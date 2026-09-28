"""Offline presentation fixture: real tools, synthetic caller, no network or audio."""
import asyncio
import json
import os
from pathlib import Path
import sys
import tempfile

os.environ['PYTHON_DOTENV_DISABLED'] = '1'
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from experiments.receptionist import app as business
from experiments.receptionist.retell_adapter import ManagedVoiceAdapter

async def rehearse():
    business.reset_state()
    adapter = ManagedVoiceAdapter(business, 'offline-demo', 'offline-agent')
    turns = []
    async def ask(text, name, args=None):
        if text:
            turns.append({'role':'user', 'content':text})
        return await adapter.dispatch({'name':name, 'args':args or {}, 'call': {
            'call_id':'offline-demo','agent_id':'offline-agent','transcript_object':list(turns)}})
    report = {'mode':'OFFLINE synthetic tool rehearsal; no audio, provider call or real booking'}
    report['services'] = await ask('What services do you offer?', 'get_business_info', {'topic':'services'})
    report['deep_clean'] = await ask('What does deep cleaning include?', 'get_business_info', {'topic':'service','service':'deep'})
    report['comparison'] = await ask('How does it differ from standard?', 'get_business_info', {'topic':'compare','service':'standard','compare_to':'deep'})
    report['unknown'] = await ask('Do you clean swimming pools?', 'get_business_info', {'topic':'service','service':'pool cleaning'})
    report['insurance'] = await ask('Are you insured?', 'get_business_info', {'topic':'insurance'})
    report['quote'] = await ask('Deep cleaning for three bedrooms', 'get_quote', {'bedrooms':3,'service':'deep'})
    assert report['quote']['quote']['total'] == 225
    slots = await ask('What appointments are available?', 'get_availability')
    slot = slots['slots'][0]
    proposal = await ask('Please prepare the first appointment', 'prepare_booking', {'slot':slot})
    refused = await ask(None, 'confirm_booking', {'review_id':proposal['review_id']})
    assert not refused['ok'] and business.STATE['booking'] is None
    # Deliberate local operator action, never caller speech or an HTTP approval route.
    await adapter.approve(proposal['review_id'])
    confirmed = await ask(None, 'confirm_booking', {'review_id':proposal['review_id']})
    assert confirmed['ok']
    report['booking'] = {'local_operator_approval_required':True,'confirmed':True,'slot':confirmed['slot']}
    report['conflict'] = await ask('Prepare that same slot again', 'prepare_booking', {'slot':slot})
    assert not report['conflict']['ok']
    await ask('Have a human follow up', 'request_human_escalation', {'reason':'Synthetic service consultation'})
    summary = (await ask(None, 'get_summary_outcome'))['summary']
    report['summary'] = {'quote':summary['quote'],'booking_confirmed':summary['booking'] is not None,
                         'human_followups':len(summary['callbacks']), 'human_contacted':False}
    assert report['summary']['human_followups'] == 1
    report['result'] = 'PASS'
    return report

if __name__ == '__main__':
    with tempfile.TemporaryDirectory(prefix='awc-rehearsal-') as directory:
        business.STORE = Path(directory)
        print(json.dumps(asyncio.run(rehearse()), indent=2))
