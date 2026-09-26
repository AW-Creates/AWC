import asyncio
import unittest
from unittest.mock import AsyncMock, patch

from .realtime import Session, pending_review, review_action


class StreamingTranscriptSafetyTests(unittest.TestCase):
    def test_sensitive_transcripts_require_named_review_action(self):
        self.assertEqual(review_action('Deep cleaning for three bedrooms'), 'quote')
        self.assertEqual(review_action('Please book the first slot'), 'booking')
        self.assertEqual(review_action('Yes, book the first slot'), 'booking')
        self.assertEqual(review_action('Book the first slot for a three bedroom deep clean'), 'quote')

    def test_non_sensitive_and_voice_yes_have_no_tool_authority(self):
        self.assertIsNone(review_action('What are your hours?'))
        self.assertIsNone(review_action('yes'))

    def test_pending_confirmation_binds_id_transcript_and_action(self):
        pending = pending_review('Book the first slot')
        self.assertEqual(pending['action'], 'booking')
        self.assertEqual(pending['transcript'], 'Book the first slot')
        self.assertEqual(len(pending['id']), 32)
        self.assertNotEqual(pending['id'], pending_review('Book the first slot')['id'])

    def test_preview_shows_price_or_slot_interpretation(self):
        quote = pending_review('Deep cleaning for three bedrooms')
        self.assertEqual(quote['preview']['total'], 225)
        self.assertEqual(quote['preview']['service'], 'deep')
        booking = pending_review('Book the second slot')
        self.assertEqual(booking['preview']['slot'], '2026-10-02 14:00')

    def test_streaming_action_is_held_until_exact_api_confirmation(self):
        # Avoid transport setup: this exercises the authorization boundary alone.
        session = Session.__new__(Session)
        session.pending = None
        emitted, launched, replies = [], [], []
        session.emit = lambda *args, **kwargs: emitted.append((args, kwargs))
        session.launch = lambda *args, **kwargs: launched.append((args, kwargs))
        session.launch_reply = lambda *args, **kwargs: replies.append((args, kwargs))
        session.accept_transcript('Please book the first slot')
        self.assertFalse(launched)
        self.assertTrue(replies)
        pending = session.pending
        bad = type('Confirmation', (), dict(id=pending['id'], transcript='Book the second slot', action='booking'))
        with self.assertRaises(Exception): session.confirm(bad)
        self.assertFalse(launched)
        good = type('Confirmation', (), pending)
        session.confirm(good)
        self.assertEqual(launched[0][0][0], 'Please book the first slot')

    def test_new_voice_turn_invalidates_old_pending_confirmation(self):
        session = Session.__new__(Session)
        session.pending = pending_review('Book the first slot')
        session.responding = True
        session.epoch = 0
        session.worker = type('Worker', (), {'queue_frame': AsyncMock()})()
        session.emit = lambda *_args, **_kwargs: None
        asyncio.run(session.interrupt('caller speech'))
        stale = type('Confirmation', (), dict(id=session.pending['id'] if session.pending else 'x'*32, transcript='Book the first slot', action='booking'))
        with self.assertRaises(Exception): session.confirm(stale)

    def test_review_prompt_keeps_pending_confirmation(self):
        session = Session.__new__(Session)
        session.pending = pending_review('Book the first slot')
        session.epoch = 0; session.responding = False; session.closed = False
        session.worker = type('Worker', (), {'queue_frame': AsyncMock()})()
        session.emit = lambda *_args, **_kwargs: None
        session.transport = type('Transport', (), {'send_audio': AsyncMock()})()
        # Exercise the actual speak -> interrupt lifecycle with TTS/transport isolated.
        with patch('experiments.receptionist.realtime.pcm', return_value=(b'\0\0', 24000)):
            asyncio.run(session.speak('Please review and confirm the request on screen.', 0))
        self.assertIsNotNone(session.pending)


if __name__ == '__main__':
    unittest.main()
