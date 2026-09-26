"""Local-only, single-caller streaming acceptance laboratory. No production calendar."""
from __future__ import annotations
import asyncio,base64,io,json,re,threading,time,wave,uuid
from contextlib import asynccontextmanager
from pathlib import Path
import numpy as np
from fastapi import FastAPI,HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel,Field
from pipecat.frames.frames import InputAudioRawFrame,OutputAudioRawFrame,InterruptionFrame
from pipecat.processors.frame_processor import FrameProcessor
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineWorker,PipelineParams
from pipecat.workers.runner import WorkerRunner
from pipecat.transports.base_transport import TransportParams
from pipecat.transports.smallwebrtc.connection import SmallWebRTCConnection
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport
from . import app as business
ROOT=Path(__file__).parent
SESSION=None
TTS_LOCK=threading.Lock()
RECOGNIZER=None
FINALIZER=None
ASR_LOCK=threading.Lock()
EVENTS=[]
# Streaming transcripts are observations, not authorization.  The domain module
# intentionally owns the deterministic tools; this boundary keeps unreviewed ASR
# output from reaching those tools.
BOOKING_WORDS=re.compile(r'\b(book|reserve|booking|reservation)\b',re.I)
# Match the domain classifier's conservative substring behavior so malformed
# forms such as "3bedrooms" and "three-bedroom" still require review.
QUOTE_WORDS=re.compile(r'(quote|estimate|price|cost|bedroom|bedrooms|deep clean|standard clean)',re.I)
def booking_slot(text):
    t=text.lower()
    for slot in business.SLOT_NAMES:
        if slot in t:return slot
    if re.search(r'(october|oct)\s*(1|first)\b',t) or 'first slot' in t:return business.SLOT_NAMES[0]
    if re.search(r'(october|oct)\s*(2|second)\b',t) or 'second slot' in t:return business.SLOT_NAMES[1]
    return None
def review_plan(text):
    """Mirror the deterministic domain branch and show its interpreted commitment."""
    t=text.lower()
    if any(w in t for w in ['human','manager','escalate','sales','specialist']):return None
    if QUOTE_WORDS.search(text):
        normalized=t
        for word,count in [('one','1'),('two','2'),('three','3'),('four','4'),('five','5')]: normalized=re.sub(r'\b'+word+r'\b',count,normalized)
        match=re.search(r'(\d+)[\s-]*bedroom',normalized)
        if not match:return {'action':'quote','preview':{'missing':'bedroom count; no price will be created'}}
        bedrooms=int(match[1])
        if not 1<=bedrooms<=20:return {'action':'quote','preview':{'invalid_bedrooms':bedrooms,'allowed':'1-20; no price will be created'}}
        return {'action':'quote','preview':business.quote(business.QuoteRequest(bedrooms=bedrooms,service='deep' if 'deep' in t else 'standard'))}
    if BOOKING_WORDS.search(text):
        slot=booking_slot(text)
        return {'action':'booking','preview':{'slot':slot,'status':'will attempt booking only after confirmation'} if slot else {'missing':'one of the displayed slots; no booking will be created'}}
    return None
def review_action(text):
    plan=review_plan(text)
    return plan['action'] if plan else None
def pending_review(text):
    plan=review_plan(text)
    if not plan:return None
    # UUID prevents a stale browser confirmation from becoming authorization.
    return {'id':uuid.uuid4().hex,'transcript':text,**plan,'created_s':time.perf_counter()}
def recognizer():
    import sherpa_onnx
    m=business.CACHE/'voice-models/sherpa-onnx-streaming-zipformer-en-20M-2023-02-17'
    return sherpa_onnx.OnlineRecognizer.from_transducer(tokens=str(m/'tokens.txt'),encoder=str(m/'encoder-epoch-99-avg-1.int8.onnx'),decoder=str(m/'decoder-epoch-99-avg-1.int8.onnx'),joiner=str(m/'joiner-epoch-99-avg-1.int8.onnx'),num_threads=2,enable_endpoint_detection=True,rule1_min_trailing_silence=1.2,rule2_min_trailing_silence=.5,rule3_min_utterance_length=20)

def finalizer():
    from faster_whisper import WhisperModel
    return WhisperModel('base.en',device='cpu',compute_type='int8',cpu_threads=4,
                        download_root=str(business.CACHE/'voice-models'),local_files_only=True)

def correct_utterance(audio):
    # The decoder sees the complete bounded utterance, including pre-roll. Partial
    # hypotheses are never concatenated into an action or used as authorization.
    with ASR_LOCK:
        segments,_=FINALIZER.transcribe(audio,language='en',beam_size=3,vad_filter=False)
        segments=list(segments)
    text=' '.join(v.text.strip() for v in segments).strip()
    reliable=bool(text and segments) and all(v.avg_logprob>=-1.0 and v.no_speech_prob<=.6 for v in segments)
    return {'text':text,'reliable':reliable,'confidence':'uncalibrated model proxies',
            'avg_logprob':[float(v.avg_logprob) for v in segments],
            'no_speech_prob':[float(v.no_speech_prob) for v in segments]}

class TranscriptLedger:
    def __init__(self):self.segments=[];self.partial=''
    def update(self,text):self.partial=text.strip()
    def finalize_segment(self,text):
        if text.strip():self.segments.append(text.strip())
        self.partial=''
    def text(self):return ' '.join(self.segments+([self.partial] if self.partial else []))

def pcm(text):
    with TTS_LOCK:
        data=base64.b64decode(business.synthesize(text))
    with wave.open(io.BytesIO(data)) as w:return w.readframes(w.getnframes()),w.getframerate()
def chunks(text):
    # Preserve complete sentence boundaries so a stop cannot leave a synthetic
    # sentence fragment as the unit of planned/sent audio.
    for sentence in re.findall(r'[^.!?]+[.!?]+|[^.!?]+$', text):
        sentence=sentence.strip()
        if sentence: yield sentence
@asynccontextmanager
async def lifespan(app):
    global RECOGNIZER,FINALIZER
    RECOGNIZER=await asyncio.to_thread(recognizer)
    FINALIZER=await asyncio.to_thread(finalizer)
    await asyncio.to_thread(pcm,'Hello.')
    yield
    if SESSION:await SESSION.close()
app=FastAPI(title='AWC realtime acceptance',lifespan=lifespan)
class Text(BaseModel):text:str=Field(min_length=1,max_length=2000)
class Confirmation(BaseModel):
    id:str=Field(min_length=32,max_length=32)
    transcript:str=Field(min_length=1,max_length=2000)
    action:str=Field(pattern='^(quote|booking)$')
class Interrupt(BaseModel):
    epoch:int=Field(ge=0)
class Offer(BaseModel):sdp:str;type:str='offer'
class Engine(FrameProcessor):
    def __init__(self,session):
        super().__init__();self.s=session;self.stream=RECOGNIZER.create_stream()
        self.ledger=TranscriptLedger();self.first=None;self.last_voice=None
        self.speaking=False;self.voiced_s=0.;self.preroll=np.empty(0,dtype=np.float32)
        self.audio=[];self.samples=0;self.frames=0;self.generation=0

    def reset_capture(self):
        RECOGNIZER.reset(self.stream);self.ledger=TranscriptLedger()
        self.speaking=False;self.voiced_s=0.;self.audio=[];self.samples=0
        self.first=None;self.last_voice=None;self.preroll=np.empty(0,dtype=np.float32)

    def decode(self,a,rate):
        self.stream.accept_waveform(rate,a)
        while RECOGNIZER.is_ready(self.stream):RECOGNIZER.decode_stream(self.stream)
        return RECOGNIZER.get_result(self.stream).strip(),RECOGNIZER.is_endpoint(self.stream)

    def begin_utterance(self,now):
        self.speaking=True;self.first=now
        self.s.input_generation+=1;self.generation=self.s.input_generation
        self.s.pending=None;self.s.emit('review_cleared',reason='caller speech onset')
        self.s.emit('speech_start',input_generation=self.generation)
        self.audio=[self.preroll.copy()];self.samples=len(self.preroll)

    async def finish_utterance(self,audio,generation,origin,streaming_text,truncated):
        if truncated:
            if generation==self.s.input_generation and not self.s.closed:
                self.s.emit('transcript_rejected',reason='utterance exceeded 20 seconds; repeat a complete shorter request')
            return
        started=time.perf_counter()
        try: result=await asyncio.to_thread(correct_utterance,audio)
        except Exception as exc:
            self.s.emit('transcript_rejected',reason='final recognition failed',error=type(exc).__name__)
            return
        if self.s.closed or generation!=self.s.input_generation:
            self.s.emit('transcript_discarded',reason='newer caller turn or reset',input_generation=generation)
            return
        self.s.emit('final_transcript',**result,streaming_text=streaming_text,
                    finalizer_ms=1000*(time.perf_counter()-started),input_generation=generation)
        self.s.accept_transcript(result['text'],origin,reliable=result['reliable'])

    async def process_frame(self,frame,direction):
        await super().process_frame(frame,direction)
        if not isinstance(frame,InputAudioRawFrame):
            await self.push_frame(frame,direction);return
        now=time.perf_counter()
        a=np.frombuffer(frame.audio,dtype=np.int16).astype(np.float32)/32768
        channels=frame.num_channels
        if channels>1:a=a.reshape(-1,channels).mean(axis=1)
        if frame.sample_rate!=16000:
            # Fail closed rather than silently interpreting a changed transport rate.
            self.s.emit('transcript_rejected',reason='unexpected input sample rate',sample_rate=frame.sample_rate)
            self.reset_capture();return
        rms=float(np.sqrt(np.mean(a*a))) if len(a) else 0.
        self.preroll=np.concatenate((self.preroll,a))[-3200:]
        began=False
        if rms>.008:
            self.last_voice=now;self.voiced_s+=len(a)/16000
            if not self.speaking and self.voiced_s>=.06:
                self.begin_utterance(now);began=True
        else:self.voiced_s=0.
        if self.speaking and not began:self.audio.append(a.copy());self.samples+=len(a)
        start=time.perf_counter();text,endpoint=await asyncio.to_thread(self.decode,a,16000)
        self.frames+=1
        if self.frames==1 or self.frames%100==0:
            self.s.emit('ingress',sample_rate=frame.sample_rate,samples=len(a),channels=channels,
                        decode_ms=1000*(time.perf_counter()-start),frame_count=self.frames)
        if text!=self.ledger.partial:
            self.ledger.update(text)
            if text:self.s.emit('partial',text=self.ledger.text(),segment_index=len(self.ledger.segments),confidence='unknown')
        if endpoint:
            self.ledger.finalize_segment(text);RECOGNIZER.reset(self.stream)
            self.s.emit('asr_segment',segment_count=len(self.ledger.segments))
        quiet=(now-self.last_voice) if self.last_voice is not None else 0.
        if self.speaking and (quiet>=.8 or self.samples>=320000):
            audio=np.concatenate(self.audio);generation=self.generation
            origin=self.last_voice;merged=self.ledger.text();truncated=self.samples>=320000
            self.s.emit('endpoint',text=merged,endpoint_ms=quiet*1000,
                        cause='duration cap' if truncated else '800ms energy quiet',confidence='unknown')
            self.reset_capture()
            task=asyncio.create_task(self.finish_utterance(audio,generation,origin,merged,truncated))
            self.s.jobs.add(task);task.add_done_callback(self.s.jobs.discard)

class Session:
    def __init__(self,conn):
        self.conn=conn;self.epoch=0;self.input_generation=0;self.jobs=set();self.responding=False;self.closed=False;self.pending=None
        self.transport=SmallWebRTCTransport(conn,TransportParams(audio_in_enabled=True,audio_out_enabled=True,audio_in_sample_rate=16000,audio_out_sample_rate=24000,audio_out_10ms_chunks=2))
        self.engine=Engine(self)
        self.worker=PipelineWorker(Pipeline([self.transport.input(),self.engine,self.transport.output()]),params=PipelineParams(audio_in_sample_rate=16000,audio_out_sample_rate=24000),enable_rtvi=False,enable_turn_tracking=False)
        self.runner=asyncio.create_task(WorkerRunner(handle_sigint=False).run(self.worker))
    def emit(self,event,**kw):
        item={'type':'event','event':event,'server_s':time.perf_counter(),'epoch':self.epoch,**kw};EVENTS.append(item);self.conn.send_app_message(item)
    async def interrupt(self,reason,clear_pending=True,request_epoch=None):
        if request_epoch is not None and request_epoch != self.epoch:return False
        self.epoch+=1;self.responding=False
        if clear_pending:self.pending=None
        await self.worker.queue_frame(InterruptionFrame())
        self.emit('interrupted',reason=reason)
        return True
    def launch(self,text,origin=None,greeting=False):
        task=asyncio.create_task(self.respond(text,origin or time.perf_counter(),greeting,self.epoch,getattr(self,'input_generation',0)));self.jobs.add(task);task.add_done_callback(self.jobs.discard)
    def launch_reply(self,answer,origin=None):
        task=asyncio.create_task(self.speak(answer,origin or time.perf_counter()));self.jobs.add(task);task.add_done_callback(self.jobs.discard)
    def accept_transcript(self,text,origin=None,reliable=True):
        """Fail closed for price and booking language until the browser confirms it."""
        if not reliable or not text.strip():
            self.pending=None;self.emit('transcript_rejected',reason='uncertain final transcript; repeat or type a complete request')
            return
        self.pending=pending_review(text)
        if self.pending:
            self.emit('review_required',review=self.pending)
            self.launch_reply('Please review and confirm the request on screen.',origin)
        else:self.launch(text,origin)
    def confirm(self,confirmation):
        pending=self.pending
        if not pending or confirmation.id!=pending['id'] or confirmation.transcript!=pending['transcript'] or confirmation.action!=pending['action']:
            raise HTTPException(409,'No matching reviewed transcript/action is pending')
        if 'missing' in pending['preview'] or 'invalid_bedrooms' in pending['preview']:
            raise HTTPException(409,'Correct the incomplete request before confirming')
        self.pending=None
        self.emit('review_confirmed',action=confirmation.action,transcript=confirmation.transcript)
        self.launch(confirmation.transcript)
    async def respond(self,text,origin,greeting=False,request_epoch=None,input_generation=None):
        if greeting:answer='Hello, I am the BrightHome demo receptionist. How can I help?'
        else:
            if request_epoch is None:request_epoch=self.epoch
            async with business.LOCK:
                # A queued decision from an interrupted/reset session may not mutate tools.
                if self.closed or request_epoch!=self.epoch or input_generation not in (None,getattr(self,'input_generation',0)):return
                answer=await business.domain(text)
        await self.speak(answer,origin,input_text=text)
    async def speak(self,answer,origin,input_text=None):
        # A review prompt is server speech, not a new caller action: retain its
        # pending browser confirmation until caller speech/reset/stop invalidates it.
        await self.interrupt('new turn',clear_pending=False);epoch=self.epoch;self.responding=True
        try:
            self.emit('decision',input=input_text,text=answer,decision_ms=1000*(time.perf_counter()-origin))
            play_until=time.perf_counter();first=True
            planned=list(chunks(answer));sent=[]
            self.emit('tts_plan',planned_chunks=planned,planned_count=len(planned))
            for index,part in enumerate(planned):
                if epoch!=self.epoch or self.closed:
                    self.emit('audio_abandoned',reason='epoch changed before synthesis',playback_epoch=epoch,planned_chunks=planned,sent_chunks=sent);return
                start=time.perf_counter();audio,rate=await asyncio.to_thread(pcm,part)
                if epoch!=self.epoch or self.closed:
                    self.emit('audio_abandoned',reason='epoch changed after synthesis',playback_epoch=epoch,planned_chunks=planned,sent_chunks=sent);return
                duration=len(audio)/(2*rate)
                self.emit('tts_chunk',text=part,index=index,synthesis_ms=1000*(time.perf_counter()-start),duration_s=duration,first=first,first_audio_ready_ms=1000*(time.perf_counter()-origin) if first else None)
                if first:self.emit('audio_start',text=answer);first=False
                await self.transport.send_audio(OutputAudioRawFrame(audio=audio,sample_rate=rate,num_channels=1))
                sent.append(part)
                play_until=max(play_until,time.perf_counter())+duration
                # Keep at most one phrase ahead so interruptions cannot build an inference backlog.
                await asyncio.sleep(max(0,play_until-time.perf_counter()-1))
            await asyncio.sleep(max(0,play_until-time.perf_counter())+.25)
            if epoch==self.epoch:self.responding=False;self.emit('audio_done',planned_chunks=planned,sent_chunks=sent,completion='scheduled playback complete')
            else:self.emit('audio_abandoned',reason='epoch changed',planned_chunks=planned,sent_chunks=sent)
        except Exception as exc:
            self.emit('error',error=type(exc).__name__,detail=str(exc))
            if epoch==self.epoch:self.responding=False
            self.emit('audio_abandoned',reason=type(exc).__name__,playback_epoch=epoch,planned_chunks=locals().get('planned',[]),sent_chunks=locals().get('sent',[]))
    async def close(self):
        self.closed=True;self.epoch+=1;self.input_generation+=1;self.pending=None
        await self.worker.cancel();await self.conn.disconnect()
        for task in self.jobs:task.cancel()
@app.get('/',response_class=HTMLResponse)
def index():return (ROOT/'realtime.html').read_text(encoding='utf-8')
@app.get('/api/health')
def health():return {'ok':True,'transport':'Pipecat SmallWebRTC pipeline','stt':'Sherpa live partials + cached Whisper base.en final correction','tts':'Kokoro af_heart phrase-chunked uncached','single_session':True,'ready':RECOGNIZER is not None}
@app.post('/api/offer')
async def offer(p:Offer):
    global SESSION
    if SESSION and not SESSION.closed and SESSION.conn.pc.connectionState not in ('closed','failed','disconnected'):raise HTTPException(409,'One caller at a time; stop existing demo first')
    if SESSION:await SESSION.close()
    conn=SmallWebRTCConnection(ice_servers=[]);await conn.initialize(p.sdp,p.type);SESSION=Session(conn)
    return conn.get_answer()
@app.post('/api/interrupt')
async def interrupt(p:Interrupt):
    if SESSION:await SESSION.interrupt('browser energy',request_epoch=p.epoch)
    return {'ok':True}
@app.post('/api/text')
async def text(p:Text):
    if not SESSION:raise HTTPException(409,'Start microphone first')
    SESSION.input_generation+=1;SESSION.engine.reset_capture()
    SESSION.accept_transcript(p.text);return {'ok':True,'review_required':SESSION.pending}
@app.get('/api/review')
async def review():
    if not SESSION:raise HTTPException(409,'Start microphone first')
    return {'pending':SESSION.pending}
@app.post('/api/confirm')
async def confirm(p:Confirmation):
    if not SESSION:raise HTTPException(409,'Start microphone first')
    SESSION.confirm(p)
    return {'ok':True}
@app.post('/api/greet')
async def greet():
    if not SESSION:raise HTTPException(409,'Start microphone first')
    SESSION.launch('',greeting=True);return {'ok':True}
@app.get('/api/summary')
async def summary():
    async with business.LOCK:return {'business':business.snapshot(),'events':EVENTS}
@app.post('/api/reset')
async def reset():
    if SESSION:
        SESSION.input_generation+=1;SESSION.engine.reset_capture()
        await SESSION.interrupt('reset')
    async with business.LOCK:business.reset_state();EVENTS.clear()
    return {'ok':True}
@app.post('/api/stop')
async def stop():
    global SESSION
    if SESSION:await SESSION.close();SESSION=None
    return {'ok':True}
