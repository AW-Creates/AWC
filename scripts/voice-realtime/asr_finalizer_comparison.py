"""Compare cached full-utterance ASR against preserved streaming evidence."""
import json, re, sys, time
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[2]
def words(text):
    text = text.lower().replace('brighthome', 'bright home')
    text = re.sub(r'\b10\b', 'ten', text)
    text = re.sub(r'\ba\.?\s*m\.?\b', 'am', text)
    return re.findall(r'[a-z0-9]+', text)
def distance(a, b):
    row = list(range(len(b)+1))
    for i, x in enumerate(a, 1):
        nxt = [i]
        for j, y in enumerate(b, 1):
            nxt.append(min(nxt[-1]+1, row[j]+1, row[j-1]+(x != y)))
        row = nxt
    return row[-1]
def main():
    prior = json.loads((ROOT/'docs/voice-realtime/evidence/asr-diagnostic.json').read_text())
    controls = [r for r in prior['rows'] if r['variant']=='int8' and r['source']=='resampled16k' and r['endpoint_mode']=='segmented']
    model = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=4,
                         download_root=str(ROOT/'.cache/voice-models'), local_files_only=True)
    rows = []
    for r in controls:
        audio, rate = sf.read(ROOT/f"docs/voice-bakeoff/evidence/{r['fixture']}.wav", dtype='float32')
        audio = resample_poly(audio, 16000, rate).astype(np.float32)
        start = time.perf_counter()
        segments, _ = model.transcribe(audio, language='en', beam_size=3, vad_filter=False)
        segments = list(segments)
        hypothesis = ' '.join(s.text.strip() for s in segments)
        ref = words(r['reference'])
        rows.append(dict(fixture=r['fixture'], reference=r['reference'], streaming_hypothesis=r['hypothesis'],
                         final_hypothesis=hypothesis, reference_words=len(ref),
                         streaming_errors=distance(ref, words(r['hypothesis'])),
                         final_errors=distance(ref, words(hypothesis)),
                         finalizer_ms=round(1000*(time.perf_counter()-start), 2),
                         audio_s=round(len(audio)/16000, 3),
                         words_per_minute=round(len(ref)*60/(len(audio)/16000), 1),
                         avg_logprob=[round(s.avg_logprob, 4) for s in segments],
                         no_speech_prob=[round(s.no_speech_prob, 4) for s in segments]))
    total = sum(r['reference_words'] for r in rows)
    report = dict(scope='Five preserved synthetic Kokoro fixtures at original ordinary/brisk pace; no human microphone claim. Streaming numbers are preserved earlier evidence, not a simultaneous speed benchmark. Cached base.en int8 CPU, beam 3, no VAD filter; whole-utterance correction adds latency.',
                  normalization='lowercase alphanumeric words; BrightHome=bright home, 10=ten, a.m./a m=am; hyphen/punctuation ignored, same normalization for both engines',
                  reference_words=total, streaming_wer=sum(r['streaming_errors'] for r in rows)/total,
                  final_wer=sum(r['final_errors'] for r in rows)/total, rows=rows)
    out = ROOT/'docs/voice-realtime/evidence/asr-finalizer-comparison.json'
    out.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))
if __name__ == '__main__': main()
