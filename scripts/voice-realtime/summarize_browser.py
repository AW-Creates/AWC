"""Summarize browser-clock latency; no cross-clock subtraction or physical-speaker claim."""
import json,sys,statistics,math
from pathlib import Path
def stats(xs):
 xs=sorted(xs)
 return {'n':len(xs),'min_ms':round(xs[0],2),'p50_ms':round(statistics.median(xs),2),'p95_ms':round(xs[math.ceil(.95*len(xs))-1],2),'max_ms':round(xs[-1],2)} if xs else None
p=Path(sys.argv[1]);x=json.loads(p.read_text(encoding='utf-8'));b=x['browser'];events=b['events'];aud=b['audible'];rows=[]
for d in [e for e in events if e.get('event')=='decision']:
 a=next((v for v in aud if v['epoch']==d['epoch'] and v['at']>=d['at']),None)
 if not a:continue
 starts=[e for e in events if e.get('kind')=='text_request' and e.get('text')==d.get('input') and e['at']<=d['at']]
 confirmations=[e for e in events if e.get('kind')=='confirmation_click' and e.get('transcript')==d.get('input') and e['at']<=d['at']]
 row={'epoch':d['epoch'],'input':d.get('input'),'decision_received_to_rendered_ms':a['at']-d['at'],'server_decision_ms':d.get('decision_ms')}
 if starts:row['request_to_rendered_ms']=a['at']-starts[-1]['at']
 if confirmations:row['confirmation_to_rendered_ms']=a['at']-confirmations[-1]['at']
 ends=[e for e in events if e.get('kind')=='mic_speech_end' and e['at']<=d['at']]
 if d.get('input') and not starts and ends:
  row['mic_energy_end_to_rendered_ms']=a['at']-ends[-1]['last_voice_at']
  row['mic_energy_end_to_decision_received_ms']=d['at']-ends[-1]['last_voice_at']
 rows.append(row)
fixture=next((s for s in x.get('steps',[]) if 'fixture' in s.get('label','')),None)
replacement=None
if fixture:
 a=next((a for a in aud if a['at']>fixture['end']),None)
 ep=next((e for e in events if e.get('event')=='endpoint' and e['at']>fixture['started']),None)
 partial=next((e for e in events if e.get('event')=='partial' and e['at']>fixture['started']),None)
 replacement={'fixture_end_to_rendered_ms':a['at']-fixture['end'] if a else None,'fixture_start_to_first_partial_received_ms':partial['at']-fixture['started'] if partial else None,'fixture_end_to_endpoint_received_ms':ep['at']-fixture['end'] if ep else None}
report={'source':str(p),'mode':x['mode'],'scope':'Browser received/rendered WebAudio energy; not calibrated acoustic output. Microphone end uses energy threshold proxy.','turns':rows,'normal_request_ms':stats([r['request_to_rendered_ms'] for r in rows if 'request_to_rendered_ms' in r and 'confirmation_to_rendered_ms' not in r]),'confirmed_action_ms':stats([r['confirmation_to_rendered_ms'] for r in rows if 'confirmation_to_rendered_ms' in r]),'mic_energy_end_ms':stats([r['mic_energy_end_to_rendered_ms'] for r in rows if 'mic_energy_end_to_rendered_ms' in r]),'barge_in_detection_to_mute_ms':stats([i['muted']-i['detected'] for i in b['interruptions']]),'replacement':replacement,'errors':x.get('errors',[]),'server_endpoints':[{'text':e.get('text'),'endpoint_ms':e.get('endpoint_ms')} for e in events if e.get('event')=='endpoint']}
out=Path(sys.argv[2]);out.write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))
