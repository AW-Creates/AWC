"""Paced 20ms online ASR + phrase TTS benchmark; synthetic components, not microphone acceptance."""
import base64,io,json,time,wave,math
from pathlib import Path
import numpy as np, psutil,sherpa_onnx,soundfile as sf
from scipy.signal import resample_poly
from experiments.receptionist.app import synthesize
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/voice-realtime/evidence'
MODEL=ROOT/'.cache/voice-models/sherpa-onnx-streaming-zipformer-en-20M-2023-02-17'
proc=psutil.Process()
def stats(v):
    v=sorted(v);return {'n':len(v),'p50_ms':float(np.median(v)),'p95_ms':v[math.ceil(.95*len(v))-1],'min_ms':v[0],'max_ms':v[-1]}
started=time.perf_counter()
r=sherpa_onnx.OnlineRecognizer.from_transducer(tokens=str(MODEL/'tokens.txt'),encoder=str(MODEL/'encoder-epoch-99-avg-1.int8.onnx'),decoder=str(MODEL/'decoder-epoch-99-avg-1.int8.onnx'),joiner=str(MODEL/'joiner-epoch-99-avg-1.int8.onnx'),num_threads=2,enable_endpoint_detection=True,rule1_min_trailing_silence=1.2,rule2_min_trailing_silence=.5,rule3_min_utterance_length=20)
report={'method':'Synthetic pre-generated Kokoro fixtures, 20ms PCM delivered at wall clock rate; sherpa online Zipformer int8 2 threads. Component only, no WebRTC or physical microphone. TTS cache disabled, same process repeated phrase/full synthesis.','asr_load_ms':1000*(time.perf_counter()-started),'asr':[],'tts':[]}
for run in range(3):
 for slug in ['faq','estimate','booking','sales','human']:
    samples,sr=sf.read(ROOT/f'docs/voice-bakeoff/evidence/{slug}.wav',dtype='float32');samples=resample_poly(samples,16000,sr);seconds=len(samples)/16000
    samples=np.concatenate([samples,np.zeros(24000,dtype='float32')]);stream=r.create_stream();begin=time.perf_counter();first=None;changes=[];old='';decode_ms=[];endpoint=None;cpu0=proc.cpu_times()
    for i in range(0,len(samples),320):
        deadline=begin+i/16000
        if deadline>time.perf_counter():time.sleep(deadline-time.perf_counter())
        t=time.perf_counter();stream.accept_waveform(16000,samples[i:i+320])
        while r.is_ready(stream):r.decode_stream(stream)
        decode_ms.append(1000*(time.perf_counter()-t));text=r.get_result(stream)
        if text and text!=old:
            now=time.perf_counter();first=first or now;changes.append({'ms':1000*(now-begin),'text':text});old=text
        if r.is_endpoint(stream):endpoint=time.perf_counter();break
    end=time.perf_counter();cpu=proc.cpu_times();report['asr'].append({'run':run+1,'fixture':slug,'audio_seconds':seconds,'hypothesis':old,'first_partial_ms':1000*(first-begin) if first else None,'endpoint_after_file_end_ms':1000*((endpoint or end)-begin-seconds),'endpoint_detected':endpoint is not None,'partials':changes,'decode_frame':stats(decode_ms),'cpu_core_percent':100*((cpu.user+cpu.system)-(cpu0.user+cpu0.system))/(end-begin)})
    print('ASR',run,slug,old,flush=True)
# Prime the model separately; warm measurements do not hide this cost.
s=time.perf_counter();synthesize('Hello.');report['tts_cold_load_and_hello_ms']=1000*(time.perf_counter()-s)
for text in ['We are open Monday through Friday.','Your estimate is 225 dollars.','Hello, how can I help?','Your deep cleaning estimate for three bedrooms is 225 dollars. This is a demo estimate.']:
 for run in range(5):
    cpu0=proc.cpu_times();begin=time.perf_counter();data=base64.b64decode(synthesize(text));elapsed=time.perf_counter()-begin;cpu=proc.cpu_times()
    with wave.open(io.BytesIO(data)) as w: duration=w.getnframes()/w.getframerate()
    report['tts'].append({'text':text,'run':run+1,'first_complete_chunk_ms':1000*elapsed,'audio_seconds':duration,'real_time_factor':elapsed/duration,'cpu_core_percent':100*((cpu.user+cpu.system)-(cpu0.user+cpu0.system))/elapsed})
report['rss_mib']=proc.memory_info().rss/2**20
(OUT/'components.json').write_text(json.dumps(report,indent=2));print('SAVED components.json',flush=True)
