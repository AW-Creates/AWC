"""Bounded managed speech control: new synthetic text only; three 100-token responses."""
import asyncio,base64,json,os,time,wave
from pathlib import Path
import websockets
from dotenv import load_dotenv
ROOT=Path(__file__).resolve().parents[2]
MEDIA=ROOT.parent/'_venture-ops/media/awc-voice-realtime-2026-09-25/managed'
async def main():
 load_dotenv(ROOT/'.env',override=False)
 MEDIA.mkdir(parents=True,exist_ok=True)
 report={'model':'gpt-realtime-mini','scope':'Server WebSocket text-to-streaming-audio control; received PCM not physical audibility; no uploaded audio, tools or booking authority','max_responses':3,'max_output_tokens_per_response':100,'rows':[]}
 try:
  async with websockets.connect('wss://api.openai.com/v1/realtime?model=gpt-realtime-mini',additional_headers={'Authorization':'Bearer '+os.environ['OPENAI_API_KEY']},open_timeout=20) as ws:
   await ws.send(json.dumps({'type':'session.update','session':{'type':'realtime','output_modalities':['audio'],'instructions':'You are a speech latency test. Read the requested sentence verbatim. No tools are available.','max_output_tokens':100,'audio':{'input':{'format':{'type':'audio/pcm','rate':24000},'turn_detection':None},'output':{'format':{'type':'audio/pcm','rate':24000},'voice':'marin'}}}}))
   while True:
    e=json.loads(await asyncio.wait_for(ws.recv(),20))
    if e['type']=='error':
     report['api_error']={k:e.get('error',{}).get(k) for k in ('type','code','param')};raise RuntimeError('api_error')
    if e['type']=='session.updated':break
   for index,prompt in enumerate(['Hello, how can I help?','We are open Monday through Friday.','A team member can help you.']):
    await ws.send(json.dumps({'type':'conversation.item.create','item':{'type':'message','role':'user','content':[{'type':'input_text','text':'Say exactly: '+prompt}]}}))
    start=time.perf_counter();await ws.send(json.dumps({'type':'response.create'}));data=bytearray();first=None;transcript='';usage=None;status=None
    async with asyncio.timeout(35):
     while True:
      e=json.loads(await ws.recv());typ=e['type']
      if typ=='error':
       report['api_error']={k:e.get('error',{}).get(k) for k in ('type','code','param')};raise RuntimeError('api_error')
      if typ=='response.output_audio.delta':
       if first is None:first=1000*(time.perf_counter()-start)
       data.extend(base64.b64decode(e['delta']))
      elif typ=='response.output_audio_transcript.delta':transcript+=e['delta']
      elif typ=='response.done':usage=e['response'].get('usage');status=e['response']['status'];break
    file=MEDIA/f'control-{index+1}.wav'
    with wave.open(str(file),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(24000);f.writeframes(data)
    row={'input':'synthetic text','prompt':prompt,'first_pcm_ms':first,'response_done_ms':1000*(time.perf_counter()-start),'audio_s':len(data)/48000,'transcript':transcript,'usage':usage,'status':status,'audio_path':str(file)}
    report['rows'].append(row);print(json.dumps({k:v for k,v in row.items() if k!='usage'}),flush=True)
 except Exception as e:report['error_type']=type(e).__name__
 finally:
  (ROOT/'docs/voice-realtime/evidence/managed-control.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
  print(json.dumps({'completed_responses':len(report['rows']),'error_type':report.get('error_type')}))
if __name__=='__main__':asyncio.run(main())
