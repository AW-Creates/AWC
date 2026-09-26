"""Bounded Chatterbox CPU inference probe, 240 seconds hard ceiling."""
import json,subprocess,time,os
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'docs/voice-realtime/evidence/chatterbox.json'
code='''import time,json,torch
s=time.perf_counter()
from chatterbox.tts import ChatterboxTTS
print(json.dumps({'stage':'import','elapsed_s':time.perf_counter()-s}),flush=True)
torch.set_num_threads(4)
m=ChatterboxTTS.from_pretrained(device='cpu')
print(json.dumps({'stage':'loaded','elapsed_s':time.perf_counter()-s}),flush=True)
t=time.perf_counter();a=m.generate('Hello, how can I help?')
print(json.dumps({'stage':'inferred','inference_s':time.perf_counter()-t,'audio_s':a.shape[-1]/m.sr}),flush=True)
'''
env=dict(os.environ,HF_HOME=str(root/'.cache/realtime/chatterbox'),HF_HUB_DISABLE_PROGRESS_BARS='1')
s=time.perf_counter();p=subprocess.Popen([str(root/'.cache/chatterbox-env/Scripts/python.exe'),'-u','-c',code],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,env=env)
try:
 stdout,stderr=p.communicate(timeout=240);status='completed' if p.returncode==0 else 'failed'
except subprocess.TimeoutExpired:
 p.kill();stdout,stderr=p.communicate();status='timeout'
result={'status':status,'elapsed_s':time.perf_counter()-s,'budget_s':240,'stdout':stdout,'stderr_tail':stderr[-4000:],'returncode':p.returncode,'scope':'Existing installed ChatterboxTTS CPU, four Torch threads; no acceptance if load/inference absent','recovery':'Perth requires pkg_resources; installed setuptools==80.10.2 in isolated chatterbox-env; watermark preserved'}
out.write_text(json.dumps(result,indent=2));print(json.dumps(result))
