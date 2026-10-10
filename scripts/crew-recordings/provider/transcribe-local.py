"""Local-only ASR from captured audio. No provider API or fabricated script captions."""
import argparse,json,sys,time
from pathlib import Path
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE/'private/.asr'))
from faster_whisper import WhisperModel
# PyAV 19 removed metadata_errors; stripping that optional compatibility argument
# keeps audio decoding equivalent for these locally recorded WebM containers.
import av
av_open=av.open
def compatible_open(*args,**kwargs):
    kwargs.pop('metadata_errors',None)
    return av_open(*args,**kwargs)
av.open=compatible_open
DEFAULT_MODEL=Path('C:/Users/A-Problem/.cache/huggingface/hub/models--Systran--faster-whisper-base/snapshots/ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66')
def timestamp(seconds):
    total=max(0,round(seconds*1000));hours,total=divmod(total,3600000);minutes,total=divmod(total,60000);secs,ms=divmod(total,1000)
    return f'{hours:02}:{minutes:02}:{secs:02}.{ms:03}'
def main():
    parser=argparse.ArgumentParser();parser.add_argument('inputs',nargs='+');parser.add_argument('--model',default=str(DEFAULT_MODEL));args=parser.parse_args()
    model=WhisperModel(args.model,device='cpu',compute_type='int8',cpu_threads=6,local_files_only=True)
    for source in args.inputs:
        path=Path(source).resolve();start=time.monotonic()
        segments,info=model.transcribe(str(path),language='en',beam_size=5,vad_filter=True,word_timestamps=True,condition_on_previous_text=False,initial_prompt='A. Wilcher Creatives. Autumn Winters. Owen Brooks. Clara Bennett. Miles Carter. June Parker. Theo Reed. Crew specialists.')
        records=[];vtt=['WEBVTT','']
        for segment in segments:
            text=segment.text.strip();words=[{'start':word.start,'end':word.end,'text':word.word,'probability':word.probability} for word in segment.words or []]
            records.append({'start':segment.start,'end':segment.end,'text':text,'avg_logprob':segment.avg_logprob,'no_speech_prob':segment.no_speech_prob,'words':words})
            if words:
                cue=[];cue_start=words[0]['start']
                for index,word in enumerate(words):
                    candidate=''.join(item['text'] for item in cue)+word['text']
                    if cue and (len(candidate)>76 or len(cue)>=12 or word['end']-cue_start>5):
                        cue_text=''.join(item['text'] for item in cue).strip()
                        vtt.extend([timestamp(cue_start)+' --> '+timestamp(cue[-1]['end']),cue_text,''])
                        cue=[];cue_start=word['start']
                    cue.append(word)
                if cue:vtt.extend([timestamp(cue_start)+' --> '+timestamp(cue[-1]['end']),''.join(item['text'] for item in cue).strip(),''])
            else:vtt.extend([timestamp(segment.start)+' --> '+timestamp(segment.end),text,''])
        target=path.with_name('transcript-asr-private.json');target.write_text(json.dumps({'source':str(path),'model':str(args.model),'language':info.language,'duration':info.duration,'segments':records,'review_status':'unreviewed_asr'},indent=2),encoding='utf8')
        path.with_name('captions-asr-unreviewed.vtt').write_text('\n'.join(vtt)+'\n',encoding='utf8')
        print(json.dumps({'source':str(path),'segments':len(records),'duration':info.duration,'elapsed_seconds':round(time.monotonic()-start,2),'private_json':str(target)}))
if __name__=='__main__':main()
