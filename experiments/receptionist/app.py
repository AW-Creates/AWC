from __future__ import annotations
import asyncio, base64, copy, io, json, os, re, time, uuid, wave
from pathlib import Path
from dotenv import load_dotenv
from typing import Literal, Protocol
from urllib.parse import urlparse
import httpx
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

ROOT = Path(__file__).parent
# Local development only: preserve explicitly supplied runtime configuration.
load_dotenv(ROOT.parents[1] / '.env', override=False)
CACHE = ROOT.parents[1] / '.cache'
STORE = CACHE / 'receptionist-output'
app = FastAPI(title='BrightHome local voice laboratory')
SLOT_NAMES = ['2026-10-01 10:00', '2026-10-02 14:00']
SLOTS = dict.fromkeys(SLOT_NAMES, 'available')
STATE = {}
LOCK = asyncio.Lock()
WHISPER = KOKORO = None

def reset_state():
    STATE.clear()
    STATE.update(session_id=str(uuid.uuid4()), agent='receptionist', transcript=[], quote=None,
                 booking=None, handoffs=[], callbacks=[], events=[])
    SLOTS.update(dict.fromkeys(SLOT_NAMES, 'available'))
reset_state()

def snapshot(): return copy.deepcopy(STATE)
def persist():
    STORE.mkdir(parents=True, exist_ok=True)
    p = STORE / (STATE['session_id'] + '.json')
    p.write_text(json.dumps(snapshot(), indent=2), encoding='utf-8')

def event(kind, **fields): STATE['events'].append(dict(kind=kind, at=time.time(), **fields))

class QuoteRequest(BaseModel):
    bedrooms: int = Field(ge=1, le=20)
    service: Literal['standard','deep'] = 'standard'
class TextRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    speech: bool = True
class BookingRequest(BaseModel):
    slot: str
    name: str = Field(default='Synthetic caller', max_length=100)

def quote(q):
    return dict(bedrooms=q.bedrooms, service=q.service, currency='USD',
                total=120 + max(0,q.bedrooms-2)*25 + (80 if q.service=='deep' else 0))
def book(b):
    if SLOTS.get(b.slot) != 'available': return dict(ok=False,error='That slot is unavailable. Please choose an available appointment.')
    SLOTS[b.slot] = 'booked'
    STATE['booking'] = dict(slot=b.slot,name=b.name,confirmation='DEMO-'+uuid.uuid4().hex[:8])
    return dict(ok=True,**STATE['booking'])
def context():
    return copy.deepcopy({k:STATE[k] for k in ['session_id','quote','booking','transcript','agent']})

class LanguageAdapter(Protocol):
    async def respond(self,text:str,ctx:dict)->str: ...
class LocalOpenAIAdapter:
    async def respond(self,text,ctx):
        url=os.environ['AWC_LOCAL_LLM_URL']
        if urlparse(url).hostname not in ('localhost','127.0.0.1','::1'):
            raise ValueError('Only loopback LLM endpoints permitted by this no-spend POC')
        async with httpx.AsyncClient(timeout=30) as client:
            r=await client.post(url.rstrip('/')+'/chat/completions',json={'model':os.getenv('AWC_LOCAL_LLM_MODEL','local'),
                'messages':[{'role':'system','content':'You are a concise BrightHome cleaning receptionist. Do not invent prices, bookings or business facts. Tools are handled separately. Context: '+json.dumps(ctx)}, {'role':'user','content':text}], 'max_tokens':100})
            r.raise_for_status(); return r.json()['choices'][0]['message']['content']

async def domain(text):
    t=text.lower().strip()
    STATE['transcript'].append(dict(role='user',text=text,at=time.time()))
    if any(w in t for w in ['human','manager','escalate']):
        item=dict(id=uuid.uuid4().hex,reason=text,context=context(),status='awaiting human follow-up',contact='not supplied')
        STATE['callbacks'].append(item); event('human_escalation',id=item['id'])
        answer='I created a local human follow-up request with our conversation, estimate and booking. No human has been contacted. Please provide contact details to the operator.'
    elif any(w in t for w in ['sales','specialist']):
        packet=dict(id=uuid.uuid4().hex,reason=text,context=context())
        STATE['handoffs'].append(packet); STATE['agent']='sales specialist'; event('handoff',id=packet['id'])
        q=STATE['quote']; b=STATE['booking']
        answer='You are now with the local sales specialist. '+(f"I have your {q['service']} estimate of {q['total']} dollars. " if q else 'No estimate collected yet. ')+(f"Your appointment is {b['slot']}." if b else 'No appointment booked yet.')
    elif 'bedroom' in t or 'quote' in t or 'estimate' in t or 'price' in t:
        normalized=t
        for w,n in [('one','1'),('two','2'),('three','3'),('four','4'),('five','5')]: normalized=re.sub(r'\b'+w+r'\b',n,normalized)
        match=re.search(r'(\d+)[\s-]*bedroom',normalized)
        if match:
            count=int(match[1])
            if not 1<=count<=20: answer='Please provide a bedroom count from 1 to 20.'
            else:
                q=quote(QuoteRequest(bedrooms=count,service='deep' if 'deep' in t else 'standard')); STATE['quote']=q; event('quote',result=q)
                answer=f"Your {q['service']} cleaning estimate for {count} bedrooms is {q['total']} dollars. This is a demo estimate."
        else: answer='How many bedrooms, and standard or deep cleaning?'
    elif re.search(r'\b(book|reserve|booking|reservation)\b', t):
        # A speech transcript is untrusted intent, never implicit authorization.
        denied = re.search(r"\b(don['’]?t|do not|not|never|cancel|avoid|stop|maybe|might|if|unless)\b", t)
        authorized = re.match(r"^(?:please\s+)?(?:book|reserve)\b", t) or re.match(r"^(?:yes[, ]+|i (?:want|would like) (?:you )?to |can you |could you |please can you )(?:please )?(?:book|reserve)\b", t)
        if denied or not authorized:
            answer = 'No appointment was booked. To authorize a booking, say book the first slot or book the second slot.'
            STATE['transcript'].append(dict(role=STATE['agent'], text=answer, at=time.time()))
            persist()
            return answer
        slot=next((s for s in SLOT_NAMES if s in t),None)
        if not slot:
            if re.search(r'(october|oct)\s*(1|first)\b',t) or 'first slot' in t: slot=SLOT_NAMES[0]
            elif re.search(r'(october|oct)\s*(2|second)\b',t) or 'second slot' in t: slot=SLOT_NAMES[1]
        if slot:
            result=book(BookingRequest(slot=slot)); event('booking',result=result)
            answer=f"Your mock appointment is booked for {slot}. Confirmation {result['confirmation']}." if result['ok'] else result['error']
        else: answer='Please choose October first at 10 AM or October second at 2 PM from available slots.'
    elif any(w in t for w in ['availability','available','appointment','slots']):
        available=[s for s,v in SLOTS.items() if v=='available']; event('availability',slots=available)
        answer='Available demo appointments: '+(', '.join(available) if available else 'none')+'.'
    elif 'hour' in t or 'open' in t: answer='We are open Monday through Friday, 9 AM to 5 PM.'
    elif 'insur' in t: answer='BrightHome is fully insured.'
    elif 'where' in t or 'service area' in t or 'springfield' in t: answer='We serve Springfield.'
    elif 'financ' in t or 'payment plan' in t:
        answer='No financing terms are configured for this demo. I can retain your context for a sales specialist or a human follow-up.'
    elif os.getenv('AWC_LOCAL_LLM_URL'):
        # Unverified generative output cannot assert prices or commitments in acceptance mode.
        answer='This demo only answers verified business questions. I can connect you to a human for anything else.'
    elif STATE['agent']=='sales specialist':
        answer='As your sales specialist, I retain your estimate and appointment. Ask for an estimate, booking, or a human follow-up.'
    else: answer='I can help with hours, insurance, an estimate, appointment availability, sales or human follow-up.'
    STATE['transcript'].append(dict(role=STATE['agent'],text=answer,at=time.time()))
    persist(); return answer

async def pipeline_answer(text):
    from pipecat.frames.frames import TextFrame, EndFrame
    from pipecat.pipeline.pipeline import Pipeline
    from pipecat.pipeline.worker import PipelineWorker
    from pipecat.workers.runner import WorkerRunner
    from pipecat.processors.frame_processor import FrameProcessor
    result=[]
    class BusinessProcessor(FrameProcessor):
        async def process_frame(self,frame,direction):
            await super().process_frame(frame,direction)
            if isinstance(frame,TextFrame): result.append(await domain(frame.text))
            await self.push_frame(frame,direction)
    worker=PipelineWorker(Pipeline([BusinessProcessor()]),enable_rtvi=False,enable_turn_tracking=False)
    await worker.queue_frames([TextFrame(text),EndFrame()])
    await WorkerRunner(handle_sigint=False).run(worker)
    if not result: raise RuntimeError('Pipeline produced no response')
    return result[0]

def synthesize(text):
    global KOKORO
    import numpy as np
    from kokoro_onnx import Kokoro
    if KOKORO is None:
        import onnxruntime as ort
        options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
        options.add_session_config_entry('session.intra_op.allow_spinning','0')
        options.add_session_config_entry('session.inter_op.allow_spinning','0')
        session=ort.InferenceSession(str(CACHE/'voice-models/kokoro-v1.0.int8.onnx'),sess_options=options,providers=['CPUExecutionProvider'])
        KOKORO=Kokoro.from_session(session,str(CACHE/'voice-models/voices-v1.0.bin'))
    samples,rate=KOKORO.create(text,voice='af_heart',speed=1.0,lang='en-us')
    buf=io.BytesIO()
    with wave.open(buf,'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes((np.clip(samples,-1,1)*32767).astype(np.int16).tobytes())
    return base64.b64encode(buf.getvalue()).decode()

def transcribe(data):
    global WHISPER
    from faster_whisper import WhisperModel
    if WHISPER is None: WHISPER=WhisperModel('base.en',device='cpu',compute_type='int8',cpu_threads=4,download_root=str(CACHE/'voice-models'))
    segments,_=WHISPER.transcribe(io.BytesIO(data),language='en',beam_size=1,vad_filter=True)
    return ' '.join(s.text.strip() for s in segments)

async def response(text,speech=True):
    start=time.perf_counter(); answer=await pipeline_answer(text); business=time.perf_counter()-start
    wav=await asyncio.to_thread(synthesize,answer) if speech else None
    return dict(text=answer,audio_wav=wav,stt_text=text,agent=STATE['agent'],llm='local-openai-compatible' if os.getenv('AWC_LOCAL_LLM_URL') else 'deterministic rules (no generative LLM)',metrics=dict(business_ms=business*1000,server_turn_ms=(time.perf_counter()-start)*1000))

@app.get('/',response_class=HTMLResponse)
def index(): return (ROOT/'index.html').read_text(encoding='utf-8')
@app.get('/api/health')
def health(): return dict(ok=True,framework='Pipecat business frame pipeline',transport='localhost HTTP utterance audio; not WebRTC',stt='faster-whisper base.en CPU int8',tts='Kokoro int8 af_heart',single_session=True)
@app.get('/api/summary')
def summary(): return snapshot()
@app.post('/api/reset')
async def reset():
    async with LOCK: reset_state();persist();return snapshot()
@app.post('/api/interrupt')
async def interrupt(): event('browser_interruption');persist();return dict(ok=True)
@app.post('/api/respond')
async def respond(r:TextRequest):
    async with LOCK: return await response(r.text,r.speech)
@app.post('/api/greet')
async def greet():
    async with LOCK:
        text='Hello, I am the BrightHome demo receptionist. How can I help with your cleaning today?'
        STATE['transcript'].append(dict(role='receptionist',text=text,at=time.time()));persist()
        start=time.perf_counter();wav=await asyncio.to_thread(synthesize,text)
        return dict(text=text,audio_wav=wav,metrics=dict(server_turn_ms=(time.perf_counter()-start)*1000))
@app.post('/api/audio')
async def audio(file:UploadFile=File(...)):
    data=await file.read(10*1024*1024+1)
    if len(data)>10*1024*1024: raise HTTPException(413,'Utterance too large')
    async with LOCK:
        start=time.perf_counter()
        try: text=await asyncio.to_thread(transcribe,data)
        except Exception as e: raise HTTPException(422,'Audio could not be transcribed: '+type(e).__name__) from e
        stt_ms=(time.perf_counter()-start)*1000
        if not text: raise HTTPException(422,'No speech detected; try again')
        result=await response(text);result['metrics'].update(stt_ms=stt_ms,server_audio_turn_ms=(time.perf_counter()-start)*1000)
        return result
@app.post('/api/quote')
async def api_quote(q:QuoteRequest):
    async with LOCK: result=quote(q);STATE['quote']=result;event('quote',result=result);persist();return result
@app.get('/api/availability')
def availability(): return dict(slots=[s for s,v in SLOTS.items() if v=='available'])
@app.post('/api/book')
async def api_book(b:BookingRequest):
    async with LOCK: result=book(b);event('booking',result=result);persist();return result

