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
from experiments.receptionist.retell_adapter import TOOLS, ManagedVoiceAdapter, create_app


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
            return response.status == 200 and value.get('slots') == ['2026-10-01 10:00', '2026-10-02 14:00'] and 'October first' in value.get('spoken_slots', [''])[0]

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
    import uvicorn
    from experiments.receptionist import app as business
    import retell_browser as browser
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', required=True)
    args = parser.parse_args()
    cache = ROOT / '.cache/retell-acceptance'
    setup = json.loads((cache / 'setup.json').read_text())
    client = Retell(api_key=os.environ['RETELL_API_KEY'], max_retries=0, timeout=10)
    business.reset_state()
    adapter = ManagedVoiceAdapter(business, 'UNARMED', setup['agent_id'])
    server = uvicorn.Server(uvicorn.Config(create_app(adapter), host='127.0.0.1', port=8766, log_level='warning'))
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    for _ in range(100):
        if server.started: break
        time.sleep(.05)
    gate = DemoGate(client, setup, args.base, adapter, cache)
    print(json.dumps(asdict(gate.check())), flush=True)

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
