"""Bounded Zipformer fixture diagnostic; reports accuracy, not acceptance."""
import json, re, time
from pathlib import Path

import numpy as np
import sherpa_onnx
import soundfile as sf
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parents[2]
MODEL = ROOT / '.cache/voice-models/sherpa-onnx-streaming-zipformer-en-20M-2023-02-17'
OUT = ROOT / 'docs/voice-realtime/evidence/asr-diagnostic.json'
FIXTURES = {
    'faq': 'What is included in a standard BrightHome cleaning?',
    'estimate': 'I need a deep clean for a three bedroom home.',
    'booking': 'Can I book next Tuesday at 10 AM?',
    'sales': 'I need recurring cleaning for my office.',
    'human': 'Please connect me with a human because I have a complaint.',
}

def words(text): return re.findall(r"[a-z0-9]+", text.lower())
def wer(reference, hypothesis):
    a,b=words(reference),words(hypothesis); row=list(range(len(b)+1))
    for i,x in enumerate(a,1):
        nxt=[i]
        for j,y in enumerate(b,1): nxt.append(min(nxt[-1]+1,row[j]+1,row[j-1]+(x!=y)))
        row=nxt
    return row[-1]/max(1,len(a))
def recognizer(variant, endpoints):
    suffix='' if variant=='float' else '.int8'
    return sherpa_onnx.OnlineRecognizer.from_transducer(
        tokens=str(MODEL/'tokens.txt'), encoder=str(MODEL/f'encoder-epoch-99-avg-1{suffix}.onnx'),
        decoder=str(MODEL/f'decoder-epoch-99-avg-1{suffix}.onnx'), joiner=str(MODEL/f'joiner-epoch-99-avg-1{suffix}.onnx'),
        num_threads=2, enable_endpoint_detection=endpoints, rule1_min_trailing_silence=1.2,
        rule2_min_trailing_silence=.8, rule3_min_utterance_length=20)
def decode(model, audio, rate, chunk_ms, paced, endpoints):
    stream=model.create_stream(); started=time.perf_counter(); first=None; result=''; endpoint_count=0; segments=[]
    chunk=round(rate*chunk_ms/1000)
    for i in range(0,len(audio),chunk):
        if paced:
            due=started+i/rate
            if due>time.perf_counter(): time.sleep(due-time.perf_counter())
        stream.accept_waveform(rate,audio[i:i+chunk])
        while model.is_ready(stream): model.decode_stream(stream)
        result=model.get_result(stream).strip()
        if result and first is None:first=time.perf_counter()
        if endpoints and model.is_endpoint(stream):
            endpoint_count+=1
            if result:segments.append(result)
            model.reset(stream);result=''
    stream.input_finished()
    while model.is_ready(stream): model.decode_stream(stream)
    result=model.get_result(stream).strip()
    if result:segments.append(result)
    # Endpoint mode is intentionally a sequence of complete segments, not a
    # first-endpoint early exit. Full-feed mode retains the one final hypothesis.
    return ' '.join(segments), {'first_partial_ms':None if first is None else round(1000*(first-started),3),'endpoint_count':endpoint_count,'elapsed_ms':round(1000*(time.perf_counter()-started),3)}
def audio(name, source, endpoints):
    samples,rate=sf.read(ROOT/f'docs/voice-bakeoff/evidence/{name}.wav',dtype='float32')
    if source=='native24k': data,output_rate=samples.astype('float32'),rate
    else: data,output_rate=resample_poly(samples,16000,rate).astype('float32'),16000
    if endpoints:data=np.concatenate([data,np.zeros(int(1.5*output_rate),dtype='float32')])
    return data,output_rate
def main():
    rows=[]
    # int8 gets all rate/endpoint controls; float rechecks the usable 16k path.
    controls=[('int8','resampled16k',True),('int8','resampled16k',False),('int8','native24k',True),('int8','native24k',False),('float','resampled16k',True),('float','resampled16k',False)]
    for variant,source,endpoints in controls:
        model=recognizer(variant,endpoints)
        for name,reference in FIXTURES.items():
            samples,rate=audio(name,source,endpoints)
            hypothesis,metrics=decode(model,samples,rate,20,True,endpoints)
            rows.append({'variant':variant,'fixture':name,'reference':reference,'source':source,'endpoint_mode':'segmented' if endpoints else 'full_feed','chunk_ms':20,'paced':True,'hypothesis':hypothesis,'wer':round(wer(reference,hypothesis),4),**metrics})
    OUT.write_text(json.dumps({'method':'Kokoro-generated fixture WAVs; native 24kHz versus single resample to 16kHz. Online Zipformer, 2 threads, 20ms wall-clock paced chunks. Segmented mode continues through every endpoint then calls input_finished; full-feed disables endpointing and calls input_finished. WER is normalized word-level edit distance. No microphone/noise claim.','supersedes':'The earlier diagnostic broke at the first endpoint and had an incorrect sales reference; it is retained in Git history but is not used for an accuracy conclusion.','rows':rows},indent=2),encoding='utf-8')
    print(json.dumps(rows,indent=2))
if __name__ == '__main__': main()
