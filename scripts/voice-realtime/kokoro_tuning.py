"""Bounded CPU thread/chunk sweep, uncached speech; not a human quality score."""
import asyncio,json,time
from pathlib import Path
import numpy as np,onnxruntime as ort,psutil,soundfile as sf
from kokoro_onnx import Kokoro
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/voice-realtime/evidence/kokoro-tuning.json'
MEDIA=ROOT.parent/'_venture-ops/media/awc-realtime-2026-09-25/tts'
TEXTS=['Hello, how can I help?','Your estimate is 225 dollars.','We are open Monday through Friday.']
async def main():
 MEDIA.mkdir(parents=True,exist_ok=True);rows=[];proc=psutil.Process()
 for threads in [1,2,4]:
  opts=ort.SessionOptions();opts.intra_op_num_threads=threads;opts.inter_op_num_threads=1
  opts.add_session_config_entry('session.intra_op.allow_spinning','0');opts.add_session_config_entry('session.inter_op.allow_spinning','0')
  begin=time.perf_counter();session=ort.InferenceSession(str(ROOT/'.cache/voice-models/kokoro-v1.0.int8.onnx'),sess_options=opts,providers=['CPUExecutionProvider'])
  model=Kokoro.from_session(session,str(ROOT/'.cache/voice-models/voices-v1.0.bin'));model.create('Hello.',voice='af_heart',lang='en-us')
  cold=1000*(time.perf_counter()-begin)
  for text in TEXTS:
   for run in range(2):
    t=time.perf_counter();cpu=proc.cpu_times();audio,rate=model.create(text,voice='af_heart',lang='en-us');elapsed=time.perf_counter()-t;c=proc.cpu_times()
    row=dict(mode='short-phrase',threads=threads,text=text,run=run+1,first_audio_ms=elapsed*1000,audio_s=len(audio)/rate,real_time_factor=elapsed/(len(audio)/rate),cpu_core_percent=100*((c.user+c.system)-(cpu.user+cpu.system))/elapsed,rss_mib=proc.memory_info().rss/2**20,cold_load_and_warmup_ms=cold)
    rows.append(row);print(json.dumps(row),flush=True)
    if run==1:sf.write(MEDIA/f'threads-{threads}-phrase-{TEXTS.index(text)}.wav',audio,rate)
  text='We are open Monday through Friday. Your estimate is 225 dollars.';t=time.perf_counter();arr=[];times=[]
  async for audio,rate in model.create_stream(text,voice='af_heart',lang='en-us'):
   times.append((time.perf_counter()-t)*1000);arr.append(audio)
  rows.append(dict(mode='native-create-stream',threads=threads,text=text,chunk_ready_ms=times,first_audio_ms=times[0],audio_s=sum(len(x) for x in arr)/rate,chunks=len(arr)))
  sf.write(MEDIA/f'threads-{threads}-stream.wav',np.concatenate(arr),rate)
  del model,session
 OUT.write_text(json.dumps({'scope':'Warm uncached CPU component timing; native stream batches vs short phrases; no network, physical playback or human quality rating','rows':rows,'media':str(MEDIA)},indent=2))
asyncio.run(main())
