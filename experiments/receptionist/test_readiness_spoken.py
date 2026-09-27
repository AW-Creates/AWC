import unittest
from unittest.mock import patch
from .readiness import verify_callback
from .spoken import spoken_datetime

class ReadinessAndSpeech(unittest.TestCase):
    def test_spoken_dates_use_ordinals_and_unambiguous_times(self):
        self.assertEqual(spoken_datetime('2026-10-01 10:00'), 'October first, 2026 at 10 o\'clock AM')
        self.assertEqual(spoken_datetime('2026-10-02 14:30'), 'October second, 2026 at 2:30 PM')
        self.assertEqual(spoken_datetime('2026-11-21 00:05'), 'November twenty-first, 2026 at 12:05 AM')

    def test_readiness_fails_stale_agent_without_update(self):
        def open_ok(request, timeout=5):
            class Response:
                status = 200
                def read(self): return b'{"ok":true,"service":"awc-retell-callback"}'
                def __enter__(self): return self
                def __exit__(self, *args): pass
            return Response()
        result = verify_callback('https://demo.example.test', opener=open_ok,
            resolver=lambda host, port: [], read_agent=lambda: {'function': 'https://old.example.test/retell/function'},
            expected_names={'function': '/retell/function', 'webhook': '/retell/webhook'}, signed_probe=lambda url: True)
        self.assertFalse(result.ok)
        self.assertIn('stale', result.reason)

    def test_readiness_refreshes_then_requires_readback(self):
        def open_ok(request, timeout=5):
            class Response:
                status = 200
                def read(self): return b'{"ok":true,"service":"awc-retell-callback"}'
                def __enter__(self): return self
                def __exit__(self, *args): pass
            return Response()
        tools = {'function': 'https://old.example.test/retell/function', 'webhook': 'https://old.example.test/retell/webhook'}
        def refresh(base): tools.update(function=base + '/retell/function', webhook=base + '/retell/webhook')
        result = verify_callback('https://demo.example.test', opener=open_ok,
            resolver=lambda host, port: [], read_agent=lambda: dict(tools), update_agent=refresh,
            expected_names={'function': '/retell/function', 'webhook': '/retell/webhook'}, signed_probe=lambda url: True)
        self.assertTrue(result.ok)
        self.assertTrue(result.checks['refreshed'])

    def test_readiness_requires_signed_probe_and_exact_paths(self):
        def open_ok(request, timeout=5):
            class Response:
                status = 200
                def read(self): return b'{"ok":true,"service":"awc-retell-callback"}'
                def __enter__(self): return self
                def __exit__(self, *args): pass
            return Response()
        result = verify_callback('https://demo.example.test', opener=open_ok,
            resolver=lambda host, port: [], read_agent=lambda: {
                'function': 'https://demo.example.test/retell/function/extra',
                'webhook': 'https://demo.example.test/retell/webhook'},
            expected_names={'function': '/retell/function', 'webhook': '/retell/webhook'},
            signed_probe=lambda url: True)
        self.assertFalse(result.ok)
        self.assertIn('stale', result.reason)

    def test_readiness_rejects_invalid_origin_and_empty_or_missing_webhook(self):
        common = dict(read_agent=lambda: {}, expected_names={'webhook': '/retell/webhook'},
                      signed_probe=lambda url: True)
        for url in ('https://user:pass@demo.example.test',
                    'https://demo.example.test?x=1',
                    'https://demo.example.test/health'):
            self.assertFalse(verify_callback(url, **common).ok)
        self.assertFalse(verify_callback('https://demo.example.test', read_agent=lambda: {},
                         expected_names={}, signed_probe=lambda url: True).ok)
        self.assertFalse(verify_callback('https://demo.example.test', read_agent=lambda: {},
                         expected_names={'function': '/retell/function'},
                         signed_probe=lambda url: True).ok)

    def test_readiness_rejects_missing_extra_and_trailing_slash_urls(self):
        def open_ok(request, timeout=5):
            class Response:
                status = 200
                def read(self): return b'{"ok":true,"service":"awc-retell-callback"}'
                def __enter__(self): return self
                def __exit__(self, *args): pass
            return Response()
        names = {'function': '/retell/function', 'webhook': '/retell/webhook'}
        for agent in ({'function': 'https://demo.example.test/retell/function'},
                      {'function': 'https://demo.example.test/retell/function',
                       'webhook': 'https://demo.example.test/retell/webhook', 'extra': 'x'},
                      {'function': 'https://demo.example.test/retell/function/',
                       'webhook': 'https://demo.example.test/retell/webhook'}):
            result = verify_callback('https://demo.example.test', opener=open_ok,
                resolver=lambda host, port: [], read_agent=lambda agent=agent: agent,
                expected_names=names, signed_probe=lambda url: True)
            self.assertFalse(result.ok)

    def test_readiness_fails_closed_on_probe_provider_update_and_health_errors(self):
        def open_ok(request, timeout=5):
            class Response:
                status = 200
                def read(self): return b'{"ok":true,"service":"awc-retell-callback"}'
                def __enter__(self): return self
                def __exit__(self, *args): pass
            return Response()
        names = {'function': '/retell/function', 'webhook': '/retell/webhook'}
        calls = []
        result = verify_callback('https://demo.example.test', opener=open_ok,
            resolver=lambda host, port: [], read_agent=lambda: {'function': 'x', 'webhook': 'x'},
            expected_names=names, signed_probe=lambda url: False,
            update_agent=lambda base: calls.append(base))
        self.assertFalse(result.ok); self.assertFalse(calls)
        result = verify_callback('https://demo.example.test', opener=open_ok,
            resolver=lambda host, port: [], read_agent=lambda: (_ for _ in ()).throw(RuntimeError('read')),
            expected_names=names, signed_probe=lambda url: True)
        self.assertFalse(result.ok)
        result = verify_callback('https://demo.example.test', opener=open_ok,
            resolver=lambda host, port: [], read_agent=lambda: {'function': 'x', 'webhook': 'x'},
            expected_names=names, signed_probe=lambda url: True,
            update_agent=lambda base: (_ for _ in ()).throw(RuntimeError('update')))
        self.assertFalse(result.ok)

    def test_refresh_requires_fresh_readback_and_stale_result_fails(self):
        def open_ok(request, timeout=5):
            class Response:
                status = 200
                def read(self): return b'{"ok":true,"service":"awc-retell-callback"}'
                def __enter__(self): return self
                def __exit__(self, *args): pass
            return Response()
        reads = [{'function': 'https://old.test/retell/function', 'webhook': 'https://old.test/retell/webhook'},
                 {'function': 'https://still-old.test/retell/function', 'webhook': 'https://still-old.test/retell/webhook'}]
        result = verify_callback('https://demo.example.test', opener=open_ok,
            resolver=lambda host, port: [], read_agent=lambda: reads.pop(0), update_agent=lambda base: None,
            expected_names={'function': '/retell/function', 'webhook': '/retell/webhook'}, signed_probe=lambda url: True)
        self.assertFalse(result.ok); self.assertEqual(len(reads), 0)

if __name__ == '__main__': unittest.main()
