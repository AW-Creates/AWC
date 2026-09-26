#!/usr/bin/env python3
"""Local paced-PCM WebRTC round trips; excludes STT/TTS/LLM/browser/Agents."""
from __future__ import annotations
import asyncio,json,os,statistics,time,uuid
from fractions import Fraction
from datetime import datetime,timezone
from pathlib import Path
import numpy as np
from aiortc import AudioStreamTrack,RTCPeerConnection,RTCSessionDescription,RTCConfiguration
from aiortc.mediastreams import MediaStreamError
from av import AudioFrame
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from livekit import api,rtc
from pipecat.frames.frames import InputAudioRawFrame,OutputAudioRawFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineWorker
from pipecat.processors.frame_processor import FrameDirection,FrameProcessor
from pipecat.transports.base_transport import TransportParams
from pipecat.transports.smallwebrtc.request_handler import SmallWebRTCRequest,SmallWebRTCRequestHandler
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport
from pipecat.workers.runner import WorkerRunner
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'docs/voice-realtime/evidence/transport.json'
RATE,N,REPEATS=48000,480,20; URL=os.getenv('AWC_LIVEKIT_URL','ws://127.0.0.1:7880'); KEY=os.getenv('AWC_LIVEKIT_KEY','devkey'); SECRET=os.getenv('AWC_LIVEKIT_SECRET','secret')
def pcm(on): return ((np.sin(np.arange(N)*2*np.pi*1000/RATE)*15000).astype('<i2').tobytes() if on else bytes(N*2))
def hit(b): return bool(b) and np.max(np.abs(np.frombuffer(b,dtype='<i2')))>4000
def report(v):
 v=sorted(v); return {'n':len(v),'min_ms':round(v[0],3),'p50_ms':round(statistics.median(v),3),'p95_ms':round(v[int(np.ceil(.95*len(v)))-1],3),'max_ms':round(v[-1],3),'raw_ms':[round(x,3) for x in v]}
def jwt(room,who): return api.AccessToken(KEY,SECRET).with_identity(who).with_grants(api.VideoGrants(room_join=True,room=room,can_publish=True,can_subscribe=True)).to_jwt()
class Track(AudioStreamTrack):
 kind='audio'
 def __init__(self): super().__init__(); self.pts=0; self.next_at=time.perf_counter(); self.pulses=0; self.emitted=None
 async def request(self):
  self.pulses=10; self.emitted=asyncio.get_running_loop().create_future(); return await self.emitted
 async def recv(self):
  self.next_at+=N/RATE; await asyncio.sleep(max(0,self.next_at-time.perf_counter()))
  pulse=self.pulses>0
  if pulse:
   self.pulses-=1
   if not self.emitted.done(): self.emitted.set_result(time.perf_counter())
  b=pcm(pulse); f=AudioFrame(format='s16',layout='mono',samples=N); f.sample_rate=RATE; f.pts=self.pts; f.time_base=Fraction(1,RATE); self.pts+=N; f.planes[0].update(b); return f
async def until(f,seconds=10):
 start=time.monotonic()
 while not f():
  if time.monotonic()-start>seconds: raise TimeoutError('WebRTC connection timeout')
  await asyncio.sleep(.01)
async def pulses(send,recv):
 values=[]
 for _ in range(REPEATS):
  while not recv.empty(): recv.get_nowait()
  t=await send()
  while not hit(await asyncio.wait_for(recv.get(),3)): pass
  values.append((time.perf_counter()-t)*1000); await asyncio.sleep(.5)
 return values
async def livekit_case():
 name='transport-'+uuid.uuid4().hex; bot,client=rtc.Room(),rtc.Room(); out=rtc.AudioSource(RATE,1); received=asyncio.Queue(); counters={'bot_input_frames':0,'bot_input_signal_frames':0,'bot_input_rates':{},'client_output_frames':0,'client_output_signal_frames':0,'client_output_rates':{}}
 feeder=None
 @bot.on('track_subscribed')
 def bot_track(track,*_):
  if track.kind==rtc.TrackKind.KIND_AUDIO:
   async def echo():
    async for e in rtc.AudioStream(track,sample_rate=RATE,num_channels=1,frame_size_ms=10): counters['bot_input_frames']+=1; counters['bot_input_signal_frames']+=int(hit(bytes(e.frame.data))); counters['bot_input_rates'][str(e.frame.sample_rate)]=counters['bot_input_rates'].get(str(e.frame.sample_rate),0)+1; await out.capture_frame(e.frame)
   asyncio.create_task(echo())
 @client.on('track_subscribed')
 def client_track(track,*_):
  if track.kind==rtc.TrackKind.KIND_AUDIO:
   async def read():
    async for e in rtc.AudioStream(track,sample_rate=RATE,num_channels=1,frame_size_ms=10):
     b=bytes(e.frame.data); counters['client_output_frames']+=1; counters['client_output_signal_frames']+=int(hit(b)); counters['client_output_rates'][str(e.frame.sample_rate)]=counters['client_output_rates'].get(str(e.frame.sample_rate),0)+1; await received.put(b)
   asyncio.create_task(read())
 try:
  await bot.connect(URL,jwt(name,'echo')); await bot.local_participant.publish_track(rtc.LocalAudioTrack.create_audio_track('echo',out)); await client.connect(URL,jwt(name,'client'))
  src=rtc.AudioSource(RATE,1); await client.local_participant.publish_track(rtc.LocalAudioTrack.create_audio_track('input',src)); clock=Track()
  async def feed():
   while True:
    frame=await clock.recv(); await src.capture_frame(rtc.AudioFrame(bytes(frame.planes[0]),RATE,1,N))
  feeder=asyncio.create_task(feed()); await until(lambda:bool(bot.remote_participants) and bool(client.remote_participants)); await asyncio.sleep(.5); return {'latencies_ms':await pulses(clock.request,received),'flow':counters}
 finally:
  if feeder: feeder.cancel(); await asyncio.gather(feeder,return_exceptions=True)
  await client.disconnect(); await bot.disconnect()
class Echo(FrameProcessor):
 def __init__(self,counters): super().__init__(); self.counters=counters
 async def process_frame(self,frame,direction):
  await super().process_frame(frame,direction)
  if isinstance(frame,InputAudioRawFrame):
   self.counters['pipeline_input_frames']+=1; self.counters['pipeline_input_rates'][str(frame.sample_rate)]=self.counters['pipeline_input_rates'].get(str(frame.sample_rate),0)+1
   await self.push_frame(OutputAudioRawFrame(audio=frame.audio,sample_rate=frame.sample_rate,num_channels=frame.num_channels),FrameDirection.DOWNSTREAM)
  else: await self.push_frame(frame,direction)
async def pipecat_case():
 handler=SmallWebRTCRequestHandler(); app=FastAPI(); runs=[]; counters={'pipeline_input_frames':0,'pipeline_input_rates':{},'client_output_frames':0,'client_output_signal_frames':0,'client_output_rates':{}}
 @app.post('/offer')
 async def offer(body:dict):
  async def connected(conn):
   tr=SmallWebRTCTransport(conn,TransportParams(audio_in_enabled=True,audio_out_enabled=True,audio_in_sample_rate=RATE,audio_out_sample_rate=RATE)); worker=PipelineWorker(Pipeline([tr.input(),Echo(counters),tr.output()]),enable_rtvi=False,enable_turn_tracking=False); runs.append(asyncio.create_task(WorkerRunner(handle_sigint=False).run(worker)))
  return JSONResponse(await handler.handle_web_request(SmallWebRTCRequest.from_dict(body),connected))
 pc=RTCPeerConnection(configuration=RTCConfiguration(iceServers=[])); channel=pc.createDataChannel('events'); keepalive=None; received=asyncio.Queue(); track=Track()
 @pc.on('track')
 def inbound(remote):
  if remote.kind=='audio':
   async def read():
    try:
     while True:
      frame=await remote.recv(); b=bytes(frame.planes[0]); counters['client_output_frames']+=1; counters['client_output_signal_frames']+=int(hit(b)); counters['client_output_rates'][str(frame.sample_rate)]=counters['client_output_rates'].get(str(frame.sample_rate),0)+1; received.put_nowait(b)
    except MediaStreamError:
     pass
   asyncio.create_task(read())
 try:
  pc.addTrack(track); pc.addTransceiver('video',direction='recvonly'); pc.getTransceivers()[0].direction='sendrecv'; await pc.setLocalDescription(await pc.createOffer()); response=await offer({'sdp':pc.localDescription.sdp,'type':pc.localDescription.type}); ans=json.loads(response.body); await pc.setRemoteDescription(RTCSessionDescription(ans['sdp'],ans['type'])); await until(lambda:pc.connectionState=='connected')
  async def ping():
   while True:
    if channel.readyState=='open': channel.send('ping')
    await asyncio.sleep(1)
  keepalive=asyncio.create_task(ping()); await asyncio.sleep(1); return {'latencies_ms':await pulses(track.request,received),'flow':counters}
 finally:
  await pc.close(); await handler.close()
  if keepalive: keepalive.cancel(); await asyncio.gather(keepalive,return_exceptions=True)
  for task in runs: task.cancel()
  await asyncio.gather(*runs,return_exceptions=True)
async def main():
 data={'title':'Local paced PCM WebRTC transport round-trip','measured_at_utc':datetime.now(timezone.utc).isoformat(),'methodology':{'repeats':REPEATS,'audio':'48 kHz mono, 100 ms PCM pulse followed by silence; timer ends at first returned high-energy PCM frame','excluded':'STT, TTS, LLM, browser rendering, WAN/NAT, natural speech, and AgentSession behavior'},'topologies':{'pipecat_smallwebrtc':'direct aiortc peer -> Pipecat SmallWebRTC transport -> Pipecat echo processor','livekit_local_sfu':'LiveKit RTC client -> local LiveKit SFU -> direct RTC echo participant'},'caveat':'These are practical alternate transport topologies, not a matched framework or Agents benchmark.'}
 try:
  pipecat=await asyncio.wait_for(pipecat_case(),90); data['pipecat_smallwebrtc']={**report(pipecat['latencies_ms']),**pipecat['flow']}
 except Exception as exc: data['pipecat_smallwebrtc']={'error':type(exc).__name__,'detail':str(exc),'status':'failed; no latency values recorded'}
 try:
  livekit=await livekit_case(); data['livekit_local_sfu']={**report(livekit['latencies_ms']),**livekit['flow']}
 except Exception as exc: data['livekit_local_sfu']={'error':type(exc).__name__,'detail':str(exc),'status':'failed; no latency values recorded'}
 OUT.parent.mkdir(parents=True,exist_ok=True); OUT.write_text(json.dumps(data,indent=2),encoding='utf8'); print(json.dumps(data,indent=2))
if __name__=='__main__': asyncio.run(main())
