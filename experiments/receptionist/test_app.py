import unittest
from fastapi.testclient import TestClient
from .app import app
class ReceptionistTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.client=TestClient(app)
    def setUp(self): self.client.post('/api/reset')
    def r(self,t): return self.client.post('/api/respond',json={'text':t,'speech':False})
    def test_quote_and_validation(self):
        self.assertEqual(self.client.post('/api/quote',json={'bedrooms':4,'service':'deep'}).json()['total'],250)
        self.assertIn('145',self.r('quote for three bedrooms').json()['text'])
        self.assertEqual(self.client.post('/api/quote',json={'bedrooms':2,'service':'bad'}).status_code,422)
    def test_booking_conflict(self):
        s=self.client.get('/api/availability').json()['slots'][0]
        self.assertTrue(self.client.post('/api/book',json={'slot':s}).json()['ok'])
        self.assertFalse(self.client.post('/api/book',json={'slot':s}).json()['ok'])
    def test_context_handoff_and_summary(self):
        self.r('quote for 3 bedrooms'); self.r('book October 1'); out=self.r('connect me to a specialist').json()['text']
        self.assertIn('145',out); self.assertIn('2026-10-01',out); self.assertTrue(self.client.get('/api/summary').json()['handoffs'])
    def test_human_and_no_fake_audio(self):
        self.assertIn('human follow-up',self.r('I need a human manager').json()['text'])
        self.assertEqual(len(self.client.get('/api/summary').json()['callbacks']),1)
        self.assertIsNone(self.r('What are your hours?').json()['audio_wav'])
if __name__=='__main__': unittest.main()
