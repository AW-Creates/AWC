"""Focused offline contracts for the live readiness gate."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('retell_demo', ROOT/'scripts/voice-demo/retell_demo.py')
demo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(demo)

class DemoContracts(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.client = Mock()
        self.adapter = SimpleNamespace(call_id='UNARMED', agent_id='agent_fixture')
        self.gate = demo.DemoGate(self.client, {'agent_id':'agent_fixture','llm_id':'llm_fixture'},
            'https://demo.example.test', self.adapter, Path(self.tmp.name))

    def test_failure_prevents_creation_and_reservation(self):
        self.gate.check = Mock(side_effect=ValueError('readiness failed'))
        with self.assertRaises(ValueError): self.gate.create_once()
        self.client.call.create_web_call.assert_not_called()
        self.assertFalse((self.gate.cache/'demo-creation-attempt.json').exists())

    def test_creation_is_one_shot_even_if_provider_result_is_uncertain(self):
        self.gate.check = Mock()
        self.client.call.create_web_call.side_effect=TimeoutError()
        with self.assertRaises(TimeoutError): self.gate.create_once()
        with self.assertRaises(FileExistsError): self.gate.create_once()
        self.client.call.create_web_call.assert_called_once()

    def test_signed_probe_is_real_signature_and_checks_business_response(self):
        from retell.lib.webhook_auth import symmetric
        class Response:
            status=200
            def __enter__(self): return self
            def __exit__(self,*args): pass
            def read(self): return json.dumps({'slots':['2026-10-01 10:00','2026-10-02 14:00'], 'spoken_slots':['October first']}).encode()
        def opened(request,timeout):
            self.assertTrue(symmetric['verify'](request.data.decode(),'synthetic-key',request.get_header('X-retell-signature')))
            self.assertEqual(json.loads(request.data)['call']['call_id'],'UNARMED')
            return Response()
        with patch.dict('os.environ',{'RETELL_API_KEY':'synthetic-key','RETELL_WEBHOOK_API_KEY':''}), patch.object(demo.urllib.request,'urlopen',side_effect=opened):
            self.assertTrue(self.gate.probe('https://demo.example.test/retell/function'))

    def test_refresh_preserves_saved_tool_settings(self):
        tools=[{'name':n,'type':'custom','url':'https://old.test/retell/function','timeout_ms':3000} for n in demo.TOOLS]
        self.client.agent.retrieve.return_value.model_dump.return_value={'response_engine':{'type':'retell-llm','llm_id':'llm_fixture'},'max_call_duration_ms':120000,'webhook_url':'https://old.test/retell/webhook'}
        self.client.llm.retrieve.return_value.model_dump.return_value={'general_tools':tools}
        self.gate.refresh(self.gate.base)
        sent=self.client.llm.update.call_args.kwargs['general_tools']
        self.assertTrue(all(t['url']==self.gate.base+'/retell/function' and t['timeout_ms']==3000 for t in sent))
        self.client.agent.update.assert_called_once_with('agent_fixture',webhook_url=self.gate.base+'/retell/webhook')

    def test_spoken_availability_preserves_business_slots(self):
        import asyncio
        from experiments.receptionist import app as b
        from experiments.receptionist.retell_adapter import ManagedVoiceAdapter
        b.reset_state()
        adapter=ManagedVoiceAdapter(b,'fixture','agent_fixture')
        result=asyncio.run(adapter._execute('get_availability',{},'',''))
        self.assertEqual(result['slots'],list(b.SLOTS))
        self.assertIn('October first',result['spoken_slots'][0])

if __name__=='__main__': unittest.main()
