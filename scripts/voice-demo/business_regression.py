"""Deterministic business regression suite; excludes speech and generative LLM."""
import json,time,statistics
from pathlib import Path
from fastapi.testclient import TestClient
from experiments.receptionist.app import app,STORE
c=TestClient(app)
rows=[]
for i in range(20):
    c.post('/api/reset');start=time.perf_counter()
    def turn(t):
        r=c.post('/api/respond',json={'text':t,'speech':False});assert r.status_code==200;return r.json()
    assert '9 AM' in turn('What are your hours?')['text']
    assert '225' in turn('Deep clean for three bedrooms')['text']
    assert len(c.get('/api/availability').json()['slots'])==2
    turn('Book the first slot')
    assert 'unavailable' in turn('Book the first slot')['text']
    turn('Sales specialist please');turn('Human please')
    s=c.get('/api/summary').json();h=s['handoffs'][0]['context'];q=s['callbacks'][0]['context']
    assert h['quote']['total']==225 and h['booking']['slot']=='2026-10-01 10:00'
    assert h['transcript'][-1]['text']=='Sales specialist please'
    assert q['quote']==s['quote'] and q['booking']==s['booking']
    assert len(s['handoffs'])==1 and len(s['callbacks'])==1
    saved=json.loads((STORE/(s['session_id']+'.json')).read_text());assert saved==s
    assert c.post('/api/quote',json={'bedrooms':-1}).status_code==422
    assert c.post('/api/quote',json={'bedrooms':2,'service':'other'}).status_code==422
    rows.append({'run':i+1,'passed':True,'suite_ms':(time.perf_counter()-start)*1000})
report={'scope':'20 reset deterministic business scenarios; no audio/generative LLM','passed':len(rows),'failed':0,'checks_per_run':14,'rows':rows}
Path('docs/voice-bakeoff/evidence/business-regression.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'passed':20,'failed':0}))
