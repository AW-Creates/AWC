"""Offline failure/cleanup contracts; no provider calls."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('awc_operator', ROOT/'scripts/voice-demo/demo_operator.py')
operator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(operator)
spec = importlib.util.spec_from_file_location('demo_profile', ROOT/'scripts/voice-demo/retell_demo.py')
demo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(demo)

class OperatorTests(unittest.TestCase):
    def test_missing_credentials_block_before_process(self):
        with patch.dict(os.environ, {'RETELL_API_KEY':''}):
            with self.assertRaisesRegex(ValueError, 'missing'):
                operator.validate_local()

    def test_config_and_port_checks(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            cache = root/'.cache/retell-acceptance'
            cache.mkdir(parents=True)
            (cache/'setup.json').write_text(json.dumps({'agent_id':'fixture', 'llm_id':'fixture'}))
            with patch.dict(os.environ, {'RETELL_API_KEY':'fixture'}), patch.object(operator.socket, 'socket') as socket:
                self.assertEqual(operator.validate_local(root)['agent_id'], 'fixture')
                self.assertEqual(socket.return_value.__enter__.return_value.bind.call_count, 2)
                socket.return_value.__enter__.return_value.bind.side_effect = OSError('busy')
                with self.assertRaises(OSError): operator.validate_local(root)

    def test_owned_process_cleanup_and_kill_fallback(self):
        process = Mock()
        process.poll.return_value = None
        process.wait.side_effect = [subprocess.TimeoutExpired('fixture',5), 0]
        operator.stop_owned(process)
        process.terminate.assert_called_once()
        process.kill.assert_called_once()

    def test_tunnel_early_failure_and_timeout(self):
        process = Mock()
        process.poll.return_value = 1
        with self.assertRaisesRegex(ValueError, 'exited'):
            operator.tunnel_url(Path('unused'), process)
        with self.assertRaisesRegex(ValueError, '30 seconds'):
            operator.tunnel_url(Path('unused'), process, timeout=0)

    def test_profile_sync_preserves_other_settings_and_checks_readback(self):
        expected = demo.configuration('https://fixture.test')['llm_settings']
        state = {'general_prompt':'Preserve approved business rules.', 'general_tools': expected['general_tools'], 'model':'unchanged'}
        client = Mock()
        client.agent.retrieve.return_value.model_dump.return_value = {'response_engine': {'type':'retell-llm','llm_id':'llm'}, 'max_call_duration_ms':120000}
        client.llm.retrieve.return_value.model_dump.side_effect = lambda **kwargs: dict(state)
        client.llm.update.side_effect = lambda _id, **kwargs: state.update(kwargs)
        gate = demo.DemoGate(client, {'agent_id':'agent','llm_id':'llm'}, 'https://fixture.test', None, Path('.'))
        gate.sync_profile()
        self.assertEqual(state['model'], 'unchanged')
        self.assertIn('Preserve approved business rules.', state['general_prompt'])
        self.assertEqual(state['general_tools'][1:], expected['general_tools'][1:])
        self.assertNotIn('default', state['general_tools'][0]['parameters']['properties']['service'])
        gate.sync_profile()
        self.assertEqual(state['general_prompt'].count('[AWC CATALOG ROUTING]'), 1)
        client.call.create_web_call.assert_not_called()
        client.agent.update.assert_not_called()
        client.llm.update.side_effect = None
        state['begin_message'] = 'wrong'
        with self.assertRaisesRegex(ValueError, 'readback'): gate.sync_profile()

    def test_tunnel_waits_for_registration_and_dns(self):
        log = Mock()
        log.read_text.return_value = 'https://fixture.trycloudflare.com Registered tunnel connection'
        process = Mock()
        process.poll.return_value = None
        with patch.object(operator.socket, 'getaddrinfo', side_effect=[operator.socket.gaierror(), []]), patch.object(operator.time, 'sleep'):
            self.assertEqual(operator.tunnel_url(log, process), 'https://fixture.trycloudflare.com')

    def test_signed_catalog_probe_checks_actual_answer(self):
        from experiments.receptionist.service_catalog import answer
        from retell.lib.webhook_auth import symmetric
        class Response:
            status = 200
            def __enter__(self): return self
            def __exit__(self, *args): pass
            def read(self): return json.dumps({'answer':answer('services')}).encode()
        adapter = Mock(call_id='fixture', agent_id='fixture')
        gate = demo.DemoGate(Mock(), {}, 'https://fixture.test', adapter, Path('.'))
        def opened(request, timeout):
            self.assertTrue(symmetric['verify'](request.data.decode(), 'fixture-key', request.get_header('X-retell-signature')))
            self.assertEqual(json.loads(request.data)['args'], {'topic':'services'})
            return Response()
        with patch.dict(os.environ, {'RETELL_API_KEY':'fixture-key','RETELL_WEBHOOK_API_KEY':''}), patch.object(demo.urllib.request, 'urlopen', side_effect=opened):
            gate.check_catalog()
            with patch.object(Response, 'read', return_value=b'{"answer":"invented"}'):
                with self.assertRaisesRegex(ValueError, 'catalog'): gate.check_catalog()

    def test_consumed_allowance_blocks_before_starting_processes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            cache = root/'.cache/retell-acceptance'
            cache.mkdir(parents=True)
            ledger = cache/'demo-creation-attempt.json'
            ledger.write_text('preserve')
            with patch.object(operator, 'ROOT', root), patch.object(operator, 'validate_local'), patch.object(operator.sys, 'argv', ['demo_operator', '--serve']), patch.object(operator.subprocess, 'Popen') as popen:
                self.assertEqual(operator.main(), 2)
                popen.assert_not_called()
            self.assertEqual(ledger.read_text(), 'preserve')

if __name__ == '__main__': unittest.main()
