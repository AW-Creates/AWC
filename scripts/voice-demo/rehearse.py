"""Offline presentation fixture: real tools, synthetic caller, no network or audio."""
import argparse
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
from experiments.receptionist.retell_adapter import ManagedVoiceAdapter, configuration

async def rehearse():
    business.reset_state()
    clock = [0.0]
    adapter = ManagedVoiceAdapter(business, 'offline-demo', 'offline-agent', clock=lambda: clock[0])
    turns = []
    async def ask(text, name, args=None):
        if text:
            turns.append({'role':'user', 'content':text})
        result = await adapter.dispatch({'name':name, 'args':args or {}, 'call': {
            'call_id':'offline-demo','agent_id':'offline-agent','transcript_object':list(turns)}})
        if 'answer' in result:
            turns.append({'role':'agent', 'content':result['answer']})
        return result
    report = {'mode':'OFFLINE synthetic tool rehearsal; no audio, provider call or real booking'}
    report['greeting'] = configuration('https://offline.invalid')['llm_settings']['begin_message']
    report['services'] = await ask('What services do you offer?', 'get_business_info', {'topic':'services'})
    report['deep_clean'] = await ask('What does deep cleaning include?', 'get_business_info', {'topic':'service','service':'deep'})
    report['comparison'] = await ask('How does it differ from standard?', 'get_business_info', {'topic':'compare','service':'standard','compare_to':'deep'})
    report['unknown'] = await ask('Do you clean swimming pools?', 'get_business_info', {'topic':'service','service':'pool cleaning'})
    report['insurance'] = await ask('Are you insured?', 'get_business_info', {'topic':'insurance'})
    report['barge_in'] = 'Prior human voice test passed interruption; this offline walkthrough does not play or test audio.'
    report['quote'] = await ask('Deep cleaning for three bedrooms', 'get_quote', {'bedrooms':3,'service':'deep'})
    assert report['quote']['quote']['total'] == 225
    slots = await ask('What appointments are available?', 'get_availability')
    report['availability'] = slots
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
    expired = await ask('Prepare the other mock slot to illustrate an expired review', 'prepare_booking', {'slot':slots['slots'][1]})
    clock[0] += 61
    before = business.snapshot()['booking']
    report['expired_review'] = await ask(None, 'confirm_booking', {'review_id':expired['review_id']})
    assert not report['expired_review']['ok'] and business.STATE['booking'] == before
    report['expired_review']['context'] = 'Separate second proposal expired; the earlier confirmed mock booking is unchanged. No second booking was made.'
    report['sales'] = await ask('I would like a sales specialist', 'request_sales_handoff', {'reason':'Synthetic service consultation'})
    await ask('Have a human follow up', 'request_human_escalation', {'reason':'Synthetic service consultation'})
    summary = (await ask(None, 'get_summary_outcome'))['summary']
    report['summary'] = {'quote':summary['quote'],'booking_confirmed':summary['booking'] is not None,
                         'human_followups':len(summary['callbacks']), 'human_contacted':False}
    assert report['summary']['human_followups'] == 1
    report['transcript'] = summary['transcript']
    assert summary['handoffs'] and summary['handoffs'][0]['context']['quote']['total'] == 225
    ended = await adapter.lifecycle({'event':'call_ended', 'call':{'call_id':'offline-demo','agent_id':'offline-agent'}})
    assert ended['summary']['booking'] == before
    report['outcome'] = 'Synthetic session ended; quote, mock booking and follow-up context retained. Nobody contacted.'
    report['result'] = 'PASS'
    return report

def present(report):
    """Readable presentation; diagnostic JSON remains the default."""
    print('AVA / BRIGHTHOME - OFFLINE PRESENTATION\nFictional tool walkthrough; no audio or real booking.\n')
    cues = [('greeting','1. Meet Ava'), ('services','2. Services'), ('deep_clean','3. Deep cleaning'),
            ('comparison','4. Standard versus deep'), ('unknown','5. An unconfigured service'),
            ('insurance','6. Business FAQ (fictional fact)'), ('barge_in','7. Interruption evidence'),
            ('quote','8. Three-bedroom deep estimate'), ('availability','9a. Mock availability'),
            ('booking','9b. Explicit local approval: confirmed mock booking'), ('expired_review','10. Expired second proposal'),
            ('sales','11. Sales context handoff (local record only)'), ('summary','12a. Summary reveal'),
            ('transcript','12b. Synthetic transcript excerpt (tool walkthrough, not recorded speech)'), ('outcome','12c. Outcome')]
    for key, title in cues:
        value = report[key]
        if isinstance(value, dict) and 'answer' in value:
            value = value['answer']
        elif key == 'quote':
            value = f"Deep cleaning, three bedrooms: ${value['quote']['total']} demo estimate."
        elif key == 'availability':
            value = '\n'.join(value['spoken_slots'])
        elif key == 'booking':
            value = f"Local operator approval supplied by this fixture. Mock booking confirmed: {value['slot']}."
        elif key == 'expired_review':
            value = value['context'] + '\n' + value['error']
        elif key == 'summary':
            value = f"Estimate: ${value['quote']['total']}. Mock booking confirmed: {value['booking_confirmed']}. Human follow-up records: {value['human_followups']}. Nobody contacted."
        elif key == 'transcript':
            value = '\n'.join(f"{t['role']}: {t['text']}" for t in value[-6:])
        elif not isinstance(value, str):
            value = json.dumps(value, indent=2)
        print(f'{title}\n{value}\n')
    print('PASS: offline rehearsal complete. No provider call or charge.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--present', action='store_true', help='Readable operator presentation')
    args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix='awc-rehearsal-') as directory:
        business.STORE = Path(directory)
        report = asyncio.run(rehearse())
        present(report) if args.present else print(json.dumps(report, indent=2))
