import asyncio
import unittest
from unittest.mock import AsyncMock, Mock, patch
import numpy as np
from . import realtime as rt

class LedgerTests(unittest.TestCase):
    def test_replace_partial_and_retain_completed_segments(self):
        ledger=rt.TranscriptLedger()
        ledger.update('I need a clean');ledger.update('I need a deep clean')
        ledger.finalize_segment('I need a deep clean')
        ledger.update('for two');ledger.update('for three bedrooms')
        self.assertEqual(ledger.text(),'I need a deep clean for three bedrooms')
        ledger.finalize_segment('for three bedrooms')
        self.assertEqual(ledger.text(),'I need a deep clean for three bedrooms')
    def test_sentence_chunking_keeps_every_word(self):
        text='Your deep cleaning estimate for three bedrooms is 225 dollars. This is a demo estimate.'
        self.assertEqual(list(rt.chunks(text)),['Your deep cleaning estimate for three bedrooms is 225 dollars.','This is a demo estimate.'])
        self.assertEqual(' '.join(rt.chunks(text)),text)
    def test_hyphenated_final_transcript_preview_is_exact(self):
        self.assertEqual(rt.pending_review("I need a deep clean for a three-bedroom home.")["preview"]["total"],225)
    def test_malformed_quote_still_requires_review(self):
        for text in ['3bedrooms','three-bedroom deep clean']:
            self.assertEqual(rt.review_action(text),'quote')

def session():
    s=rt.Session.__new__(rt.Session)
    s.epoch=0;s.input_generation=0;s.pending=None;s.responding=False;s.closed=False;s.jobs=set()
    s.worker=Mock(queue_frame=AsyncMock());s.transport=Mock(send_audio=AsyncMock())
    s.emit=Mock();s.launch=Mock();s.launch_reply=Mock()
    return s

class AsyncContinuityTests(unittest.IsolatedAsyncioTestCase):
    async def test_duplicate_and_stale_interrupt_do_not_cancel_replacement(self):
        s=session();s.responding=True
        self.assertTrue(await s.interrupt('browser',request_epoch=0))
        s.responding=True
        self.assertFalse(await s.interrupt('duplicate browser',request_epoch=0))
        self.assertEqual(s.epoch,1);self.assertTrue(s.responding)
        self.assertEqual(s.worker.queue_frame.await_count,1)
    async def test_idle_pending_invalidated_by_engine_onset_without_tts_cancel(self):
        s=session();s.pending=rt.pending_review('Book the first slot');old=rt.Confirmation(**{k:s.pending[k] for k in ['id','transcript','action']})
        with patch.object(rt,'RECOGNIZER',Mock()):
            engine=rt.Engine(s);engine.begin_utterance(1.)
        self.assertIsNone(s.pending);self.assertEqual(s.epoch,0)
        with self.assertRaises(rt.HTTPException):s.confirm(old)
        s.launch.assert_not_called();s.worker.queue_frame.assert_not_called()
    async def test_uncertain_and_incomplete_final_cannot_launch_tools(self):
        s=session();s.accept_transcript('Book the first slot',reliable=False)
        s.launch.assert_not_called();self.assertIsNone(s.pending)
        s.accept_transcript('Book a slot')
        p=s.pending
        with self.assertRaises(rt.HTTPException):s.confirm(rt.Confirmation(**{k:p[k] for k in ['id','transcript','action']}))
        s.launch.assert_not_called()
    async def test_stale_finalizer_and_duration_cap_cannot_launch(self):
        s=session()
        with patch.object(rt,'RECOGNIZER',Mock()):engine=rt.Engine(s)
        with patch.object(rt,'correct_utterance',return_value={'text':'Book the first slot','reliable':True,'confidence':'proxy'}):
            s.input_generation=2
            await engine.finish_utterance(np.zeros(100,dtype=np.float32),1,0,'book',False)
            await engine.finish_utterance(np.zeros(100,dtype=np.float32),2,0,'book',True)
        s.launch.assert_not_called();s.launch_reply.assert_not_called();self.assertIsNone(s.pending)
    async def test_uninterrupted_speech_sends_full_sentences_then_done(self):
        s=session();answer='This is a complete first sentence. Here is the second sentence.'
        with patch.object(rt,'pcm',return_value=(b'\0\0',24000)):
            await s.speak(answer,0)
        self.assertEqual(s.transport.send_audio.await_count,2)
        done=[c for c in s.emit.call_args_list if c.args[0]=='audio_done']
        self.assertEqual(len(done),1);self.assertEqual(' '.join(done[0].kwargs['sent_chunks']),answer)
        self.assertFalse(s.responding)
    async def test_cancelled_synthesis_never_sends_stale_audio(self):
        s=session()
        def cancelled(_):s.epoch+=1;s.responding=True;return b'\0\0',24000
        with patch.object(rt,'pcm',side_effect=cancelled):await s.speak('A complete sentence.',0)
        s.transport.send_audio.assert_not_called();self.assertTrue(s.responding)
        abandoned=[c for c in s.emit.call_args_list if c.args[0]=='audio_abandoned']
        self.assertEqual(len(abandoned),1);self.assertEqual(abandoned[0].kwargs['playback_epoch'],1)
    async def test_segment_endpoint_does_not_execute_until_quiet_and_full_correction(self):
        s=session();recognizer=Mock();recognizer.create_stream.return_value=Mock()
        with patch.object(rt,'RECOGNIZER',recognizer),patch.object(rt.FrameProcessor,'process_frame',new_callable=AsyncMock):
            engine=rt.Engine(s);engine.decode=Mock(return_value=('I need a deep clean',True))
            engine.finish_utterance=AsyncMock()
            frame=rt.InputAudioRawFrame(audio=(np.ones(320)*3000).astype(np.int16).tobytes(),sample_rate=16000,num_channels=1)
            with patch.object(rt.time,'perf_counter',return_value=1.):
                for _ in range(3):await engine.process_frame(frame,None)
            self.assertTrue(engine.speaking);self.assertEqual(s.input_generation,1)
            s.launch.assert_not_called();engine.finish_utterance.assert_not_called()
            silence=rt.InputAudioRawFrame(audio=bytes(640),sample_rate=16000,num_channels=1)
            engine.decode.return_value=('',False)
            with patch.object(rt.time,'perf_counter',return_value=1.5):await engine.process_frame(silence,None)
            engine.finish_utterance.assert_not_called()
            with patch.object(rt.time,'perf_counter',return_value=1.81):await engine.process_frame(silence,None)
            await asyncio.sleep(0)
            engine.finish_utterance.assert_awaited_once();self.assertFalse(engine.speaking)
            self.assertGreater(len(engine.finish_utterance.call_args.args[0]),640)

class ConfidenceTests(unittest.TestCase):
    def test_low_confidence_proxy_rejected(self):
        segment=Mock(text='Book the first slot',avg_logprob=-1.5,no_speech_prob=.1)
        with patch.object(rt,'FINALIZER',Mock(transcribe=Mock(return_value=([segment],None)))):
            self.assertFalse(rt.correct_utterance(np.zeros(100,dtype=np.float32))['reliable'])

if __name__=='__main__':unittest.main()
