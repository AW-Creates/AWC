"""One-session demo readiness integration; credentials stay in the server."""
from __future__ import annotations
import argparse
import json
import os
import sys
import threading
import time
import urllib.request
from dataclasses import asdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from experiments.receptionist.readiness import verify_callback
from experiments.receptionist.retell_adapter import (TOOLS, ManagedVoiceAdapter, create_app,
    identity_config, with_identity_prompt, configuration)


class DemoGate:
    def __init__(self, client, setup, base, adapter, cache):
        self.client, self.setup, self.base = client, setup, base.rstrip('/')
        self.adapter, self.cache = adapter, cache
        self.agent = self.llm = None

    def read_agent(self):
        self.agent = self.client.agent.retrieve(self.setup['agent_id']).model_dump(exclude_none=True)
        engine = self.agent.get('response_engine', {})
        if engine.get('llm_id') != self.setup['llm_id'] or engine.get('type') != 'retell-llm':
            raise ValueError('Temporary agent response engine changed')
        self.llm = self.client.llm.retrieve(self.setup['llm_id']).model_dump(exclude_none=True)
        if self.agent.get('max_call_duration_ms') != 120000:
            raise ValueError('120-second provider cap is required')
        if self.llm.get('states'):
            raise ValueError('Unexpected state-specific tools; refresh blocked')
        items = self.llm.get('general_tools') or []
        if len(items) != len(TOOLS) or {t.get('name') for t in items} != set(TOOLS):
            raise ValueError('Expected exactly the eight existing AWC tools')
        if any(t.get('type') != 'custom' for t in items):
            raise ValueError('Unexpected tool type')
        return {**{t['name']: t.get('url') for t in items}, 'webhook': self.agent.get('webhook_url')}

    def refresh(self, base):
        # Preserve every saved model/voice/tool setting; change callback URLs only.
        self.read_agent()
        items = [{**t, 'url': base + '/retell/function'} for t in self.llm['general_tools']]
        self.client.llm.update(self.setup['llm_id'], general_tools=items)
        self.client.agent.update(self.setup['agent_id'], webhook_url=base + '/retell/webhook')

    def sync_identity_prompt(self):
        """Update only the saved LLM identity fields, preserving all other settings."""
        current = self.client.llm.retrieve(self.setup['llm_id']).model_dump(exclude_none=True)
        existing = current.get('general_prompt')
        if not isinstance(existing, str) or not existing.strip():
            raise ValueError('Saved LLM has no general_prompt to preserve')
        identity = identity_config()
        updated = with_identity_prompt(existing, identity['agent_name'], identity['business_name'])
        greeting = (f"Thanks for calling {identity['business_name']}, this is {identity['agent_name']}, "
                    "an AI Customer Experience Specialist for this fictional demo. How can I help?")
        agent = self.client.agent.retrieve(self.setup['agent_id']).model_dump(exclude_none=True)
        engine = agent.get('response_engine', {})
        if engine.get('llm_id') != self.setup['llm_id'] or engine.get('type') != 'retell-llm':
            raise ValueError('Temporary agent response engine changed')
        self.client.llm.update(self.setup['llm_id'], general_prompt=updated, begin_message=greeting)
        verified = self.client.llm.retrieve(self.setup['llm_id']).model_dump(exclude_none=True)
        if verified.get('general_prompt') != updated or verified.get('begin_message') != greeting:
            raise ValueError('Identity prompt readback did not match update')
        return {'general_prompt': updated, 'begin_message': greeting}

    def sync_profile(self):
        """Sync versioned tool schemas/instructions; preserve model, voice and other tools."""
        self.read_agent()
        expected = configuration(self.base)['llm_settings']
        # Retell strips JSON Schema default annotations. These are documentation,
        # not validators; the local Pydantic model remains strict and authoritative.
        def provider_schema(value):
            if isinstance(value, dict):
                return {k: provider_schema(v) for k, v in value.items() if k != 'default'}
            if isinstance(value, list):
                return [provider_schema(v) for v in value]
            return value
        catalog = next(t for t in expected['general_tools'] if t['name'] == 'get_business_info')
        tools = [{**item, 'parameters': provider_schema(catalog['parameters']),
                  'description': catalog['description']} if item['name'] == 'get_business_info'
                 else item for item in self.llm['general_tools']]
        # Existing prompt remains intact; add a bounded tool-routing section.
        marker = '[AWC CATALOG ROUTING]'
        prompt = self.llm['general_prompt'].split(marker)[0].rstrip()
        prompt = with_identity_prompt(prompt, **identity_config())
        prompt += '\n\n' + marker + ' ' + (
            'Use get_business_info for service list, explanation, comparison and add-ons using its schema. '
            'Business facts come only from tools. Unknown services require clarification or human follow-up. '
            'Only standard and deep have deterministic quotes; do not price other services or add-ons. '
            'A stale review does not mean the slot is unavailable: no booking is confirmed; '
            'ask whether the caller wants a fresh proposal, then recheck availability. Never automatically re-offer.')
        self.client.llm.update(self.setup['llm_id'], general_tools=tools,
            general_prompt=prompt, begin_message=expected['begin_message'])
        verified = self.client.llm.retrieve(self.setup['llm_id']).model_dump(exclude_none=True)
        if (verified.get('general_prompt') != prompt or verified.get('begin_message') != expected['begin_message']
                or any(next((t for t in verified.get('general_tools', []) if t.get('name') == item['name']), None) != item for item in tools)):
            raise ValueError('Profile configuration readback mismatch')

    def probe(self, url):
        from retell.lib.webhook_auth import symmetric
        payload = {'name': 'get_availability', 'args': {}, 'call': {
            'call_id': self.adapter.call_id, 'agent_id': self.adapter.agent_id,
            'transcript_object': []}}
        raw = json.dumps(payload).encode()
        key = os.getenv('RETELL_WEBHOOK_API_KEY') or os.environ['RETELL_API_KEY']
        signature = symmetric['sign'](raw.decode(), key)
        request = urllib.request.Request(url, data=raw, headers={
            'Content-Type': 'application/json', 'X-Retell-Signature': signature})
        with urllib.request.urlopen(request, timeout=8) as response:
            value = json.load(response)
            from experiments.receptionist.service_catalog import PROFILE
            from experiments.receptionist.spoken import spoken_slot
            return response.status == 200 and value.get('slots') == PROFILE['slots'] and ' '.join(spoken_slot(PROFILE['slots'][0]).split()[:2]).rstrip(',') in value.get('spoken_slots', [''])[0]

    def check_catalog(self):
        from retell.lib.webhook_auth import symmetric
        from experiments.receptionist.service_catalog import answer
        payload = {'name': 'get_business_info', 'args': {'topic': 'services'}, 'call': {
            'call_id': self.adapter.call_id, 'agent_id': self.adapter.agent_id, 'transcript_object': []}}
        raw = json.dumps(payload).encode()
        key = os.getenv('RETELL_WEBHOOK_API_KEY') or os.environ['RETELL_API_KEY']
        request = urllib.request.Request(self.base + '/retell/function', data=raw, headers={
            'Content-Type': 'application/json', 'X-Retell-Signature': symmetric['sign'](raw.decode(), key)})
        with urllib.request.urlopen(request, timeout=8) as response:
            if response.status != 200 or json.load(response).get('answer') != answer('services'):
                raise ValueError('Signed catalog probe failed')

    def check(self):
        result = verify_callback(self.base, read_agent=self.read_agent,
            expected_names=set(TOOLS) | {'webhook'}, update_agent=self.refresh, signed_probe=self.probe)
        self.cache.mkdir(parents=True, exist_ok=True)
        (self.cache / 'demo-readiness.json').write_text(json.dumps(asdict(result), indent=2))
        if not result.ok:
            raise ValueError('Readiness blocked: ' + result.reason)
        return result

    def create_once(self):
        self.check()
        ledger = self.cache / 'demo-creation-attempt.json'
        # Exclusive reservation BEFORE network: ambiguous create failures never retry.
        with ledger.open('x') as out:
            json.dump({'attempted_at': time.time(), 'max_sessions': 1}, out)
        session = self.client.call.create_web_call(agent_id=self.setup['agent_id']).model_dump(mode='json')
        (self.cache / 'demo-session-private.json').write_text(json.dumps(session))
        self.adapter.call_id = session['call_id']
        return session


def main():
    from dotenv import load_dotenv
    load_dotenv(ROOT / '.env', override=False)
    from retell import Retell
    parser = argparse.ArgumentParser()
    parser.add_argument('--base')
    parser.add_argument('--sync-identity', action='store_true')
    parser.add_argument('--preflight-only', action='store_true')
    parser.add_argument('--sync-profile', action='store_true')
    args = parser.parse_args()
    cache = ROOT / '.cache/retell-acceptance'
    setup = json.loads((cache / 'setup.json').read_text())
    client = Retell(api_key=os.environ['RETELL_API_KEY'], max_retries=0, timeout=10)
    if args.sync_identity:
        gate = DemoGate(client, setup, args.base or '', None, cache)
        gate.sync_identity_prompt()
        print(json.dumps({'identity_readback': 'PASS', **identity_config()}), flush=True)
        return
    if not args.base:
        parser.error('--base is required unless --sync-identity is used')
    import uvicorn
    from experiments.receptionist import app as business
    import retell_browser as browser
    business.reset_state()
    adapter = ManagedVoiceAdapter(business, 'UNARMED', setup['agent_id'])
    server = uvicorn.Server(uvicorn.Config(create_app(adapter), host='127.0.0.1', port=8766, log_level='warning'))
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    for _ in range(100):
        if server.started: break
        time.sleep(.05)
    gate = DemoGate(client, setup, args.base, adapter, cache)
    try:
        if not server.started:
            raise ValueError('Callback server did not start')
        if args.sync_profile:
            gate.sync_profile()
        print(json.dumps(asdict(gate.check())), flush=True)
        if args.sync_profile:
            gate.check_catalog()
        if args.preflight_only:
            print('PASS: signed readiness and configuration; no call created.', flush=True)
            return
        if (cache / 'demo-creation-attempt.json').exists():
            raise ValueError('Prior one-call allowance consumed. Do not delete the ledger; a new call requires separate authorization.')
    finally:
        if args.preflight_only or sys.exc_info()[0] is not None:
            server.should_exit = True
            thread.join(timeout=5)

    class State(browser.HarnessState):
        def __init__(self):
            self.agent_id = setup['agent_id']
            self.used = (cache / 'demo-creation-attempt.json').exists()
            self.lock = threading.Lock()
            self.session = {'expires_at': int((time.time()+1800)*1000)}
        def public_session(self):
            self.session = gate.create_once()
            return super().public_session()

    browser.Handler.state = State()
    web = browser.ThreadingHTTPServer((browser.HOST, browser.PORT), browser.Handler)
    print('Readiness passed. One session available at http://127.0.0.1:8767/; readiness reruns on Start.', flush=True)
    try:
        web.serve_forever()
    finally:
        web.server_close()
        server.should_exit = True
        thread.join(timeout=5)

if __name__ == '__main__':
    main()
