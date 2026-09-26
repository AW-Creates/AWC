"""Summarize the bounded browser closeout using only the browser clock."""
import hashlib, json, sys
from pathlib import Path
source, output = map(Path, sys.argv[1:3])
x = json.loads(source.read_text(encoding='utf-8'))
b = x['browser']; events = b['events']; audible = b['audible']
fixtures = [e for e in events if e.get('kind') == 'fixture_start']
rows = []
for i, fixture in enumerate(fixtures):
    limit = fixtures[i+1]['at'] if i+1 < len(fixtures) else float('inf')
    after = [e for e in events if fixture['at'] <= e['at'] < limit]
    first = lambda name: next((e for e in after if e.get('event') == name), None)
    partial, endpoint, final = first('partial'), first('endpoint'), first('final_transcript')
    decision = next((e for e in after if e.get('event') == 'decision' and final and e.get('input') == final.get('text')), None)
    rendered = next((e for e in audible if decision and e['epoch'] == decision['epoch'] and e['at'] >= decision['at']), None)
    start = next((e for e in after if decision and e.get('event') == 'audio_start' and e['epoch'] == decision['epoch']), None)
    def delta(e, origin): return round(e['at']-origin, 2) if e else None
    rows.append(dict(fixture=['human-barge-in','faq','estimate'][i], transcript=final.get('text') if final else None,
        start_to_first_partial_ms=delta(partial,fixture['at']),end_to_endpoint_ms=delta(endpoint,fixture['fixture_end']),
        end_to_final_ms=delta(final,fixture['fixture_end']),end_to_decision_ms=delta(decision,fixture['fixture_end']),
        end_to_audio_start_ms=delta(start,fixture['fixture_end']),end_to_rendered_ms=delta(rendered,fixture['fixture_end']),
        decision_to_rendered_ms=delta(rendered,decision['at']) if decision else None,
        includes_review_confirmation=i==2))
completions = [dict(epoch=e['epoch'],complete=e.get('planned_chunks')==e.get('sent_chunks'),chunks=e.get('sent_chunks')) for e in events if e.get('event')=='audio_done']
report=dict(date='2026-09-26',source=str(source.resolve()),source_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
    scope='Synthetic fixture injection over browser WebRTC. Browser received events and rendered-energy proxy; not physical audible latency or human-mic acceptance. Estimate includes automated confirmation delay.',
    browser_suite_passed=not x.get('failure') and all(c['pass'] for c in x['checks']) and not x.get('errors'),
    failure=x.get('failure'),checks=x['checks'],errors=x.get('errors'),fixture_latency=rows,other_metrics=x['metrics'],
    scheduled_completions=completions,interruptions=b['interruptions'],
    truncation='No planned/sent chunk loss in completed turns. Physical sentence completion remains unresolved pending human listening.',
    acceptance='FAILED / NOT DEMO-READY',primary_bottleneck='Local CPU speech synthesis latency')
output.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:report[k] for k in ['browser_suite_passed','failure','fixture_latency','scheduled_completions']},indent=2))
