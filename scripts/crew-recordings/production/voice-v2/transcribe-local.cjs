'use strict';
// Fixed loopback Voicebox API, downloaded Whisper only. No provider/cloud fallback.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {takeProfile,assertSettledAttempt}=require('./take-profile.cjs');
const ORIGIN='http://127.0.0.1:17493',ROLES=['concierge','sales','scheduling','support','billing','implementation','retention'];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),fail=m=>{throw Error(m);};
function assertModel(status){const model=status?.models?.find(m=>m.model_name==='whisper-base');if(model?.downloaded!==true||model.downloading===true)fail('Downloaded idle whisper-base model required; no downloads or fallback');return model;}
function validateCapture(role,evidence,audioBytes){
 if(!ROLES.includes(role))fail('Unknown role');
 if(evidence.complete!==true||evidence.questionCount!==3||evidence.completedQuestions!==3||evidence.providerCalls!==1||evidence.remoteTracks<1||evidence.errors?.length||evidence.blockedRequests||evidence.recordedAudio?.decoded!==true||!Number.isFinite(evidence.recordedAudio.durationSeconds)||evidence.recordedAudio.durationSeconds<=0||evidence.recordedAudio.durationSeconds>152||!Number.isFinite(evidence.recordedAudio.rms)||evidence.recordedAudio.rms<.00001)fail('Complete genuine three-question capture with decoded actual audio required');
 if(!Buffer.isBuffer(audioBytes)||!audioBytes.length||audioBytes.length>16*1024*1024)fail('Missing or oversized captured audio');
 return evidence.recordedAudio.durationSeconds;
}
function planSegments(evidence){
 const end=evidence.recordedAudio.durationSeconds,starts=[],replyEnds=[];
 for(let i=0;i<3;i++){const hits=evidence.events?.filter(e=>e.event==='question_started'&&e.index===i);if(hits?.length!==1||!Number.isFinite(hits[0].time)||hits[0].time<0||hits[0].time/1000>=end)fail('Exactly three unique ordered actual question boundaries required');starts.push(hits[0].time/1000);const replies=evidence.events.filter(e=>e.event==='reply_complete'&&e.index===i);if(replies.length!==1||!Number.isFinite(replies[0].time)||replies[0].time<=hits[0].time||replies[0].time/1000>end+.1)fail('Complete actual reply evidence required');replyEnds.push(replies[0].time/1000);}
 if(starts[0]>=starts[1]||starts[1]>=starts[2])fail('Question boundaries out of order');
 if(replyEnds[0]>starts[1]||replyEnds[1]>starts[2])fail('Questions overlap preceding incomplete replies');
 const boundaries=[0,...starts,end],segments=[];for(let i=0;i<boundaries.length-1;i++)if(boundaries[i+1]-boundaries[i]>.05)segments.push({kind:i===0?'greeting':'question_and_reply',question_index:i===0?null:i-1,start:boundaries[i],end:boundaries[i+1]});return segments;
}
function draftSegment(segment,response,wavHash){if(typeof response?.text!=='string'||response.text.length>30000||!Number.isFinite(response.duration)||response.duration<=0||Math.abs(response.duration-(segment.end-segment.start))>1)fail('Invalid local transcription response');return {...segment,text:response.text.trim(),audio_sha256:wavHash,transcribed_audio_duration_seconds:response.duration,timing_precision:'Approximate segment boundaries from capture events; no word timestamps; requires listening and manual cue timing'};}
async function transcribeRole({root,role,take='original',fetchImpl=fetch,ffmpeg='C:/Program Files/ShareX/ffmpeg.exe'}){
 const profile=takeProfile(role,take),privateDir=path.resolve(root,'voice-samples/production-v2'),dir=path.join(privateDir,'recordings',profile.captureName),audioFile=path.join(dir,'mixed-audio.webm'),evidenceFile=path.join(dir,'capture-evidence.json');
 const bytes=fs.readFileSync(audioFile),evidenceBytes=fs.readFileSync(evidenceFile),evidence=JSON.parse(evidenceBytes);const duration=validateCapture(role,evidence,bytes),segments=planSegments(evidence);
 const retakeAttempt=take!=='original'?assertSettledAttempt(profile,JSON.parse(fs.readFileSync(path.join(privateDir,profile.ledgerFile))),JSON.parse(fs.readFileSync(path.join(root,'docs/crew/voice-v2/RECORDING-MANIFEST.json'))).roles?.find(e=>e.role===role)):undefined;
 const output=path.join(dir,'ASR-DRAFT.json');if(fs.existsSync(output))fail('ASR draft already exists; no overwrite or automatic rerun');
 const request=async(endpoint,options={})=>{const r=await fetchImpl(ORIGIN+endpoint,{...options,redirect:'error',signal:AbortSignal.timeout(endpoint==='/models/status'?10000:180000)});if(!r.ok)fail('Local Voicebox HTTP '+r.status+'; stop without fallback');return r.json();};
 assertModel(await request('/models/status'));
 const lock=path.join(dir,'.asr.lock'),fd=fs.openSync(lock,'wx',0o600);let temp;
 try{
  if(fs.existsSync(output))fail('ASR draft already exists');temp=fs.mkdtempSync(path.join(dir,'.asr-temp-'));const results=[];
  for(let i=0;i<segments.length;i++){const segment=segments[i],wav=path.join(temp,i+'.wav');execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-n','-i',audioFile,'-ss',String(segment.start),'-t',String(segment.end-segment.start),'-vn','-ac','1','-ar','16000','-c:a','pcm_s16le',wav],{stdio:'pipe'});const buffer=fs.readFileSync(wav);if(!buffer.length||buffer.length>5*1024*1024)fail('Invalid bounded transcription WAV');const form=new FormData();form.set('file',new Blob([buffer],{type:'audio/wav'}),'capture-segment.wav');form.set('model','base');form.set('language','en');results.push(draftSegment(segment,await request('/transcribe',{method:'POST',body:form}),sha(buffer)));}
  if(sha(fs.readFileSync(audioFile))!==sha(bytes)||sha(fs.readFileSync(evidenceFile))!==sha(evidenceBytes))fail('Capture changed during transcription');
  const draft={role,take,allowance_id:profile.allowanceId,...(retakeAttempt?{call_id:retakeAttempt.call_id}:{}),review_status:'unreviewed_asr_draft',local_api:ORIGIN,model:'whisper-base',model_precheck:'already_downloaded_no_download_requested',source_audio_sha256:sha(bytes),capture_evidence_sha256:sha(evidenceBytes),source_duration_seconds:duration,timing_precision:'Approximate capture-event segment boundaries, not speech or word timestamps',human_listening_and_cue_timing_required:true,created_at:new Date().toISOString(),segments:results};fs.writeFileSync(output,JSON.stringify(draft,null,2)+'\n',{flag:'wx',mode:0o600});return {role,take,segments:results.length,source_duration_seconds:duration,review_status:draft.review_status,output};
 }finally{if(temp){for(const name of fs.readdirSync(temp))fs.unlinkSync(path.join(temp,name));fs.rmdirSync(temp);}fs.closeSync(fd);fs.unlinkSync(lock);}
}
module.exports={assertModel,validateCapture,planSegments,draftSegment,transcribeRole};
if(require.main===module){const args=process.argv.slice(2);if(args[0]!=='--role'||!(args.length===2||args.length===4&&args[2]==='--take')){console.error('Usage: node transcribe-local.cjs --role ROLE [--take original|retake|corrected]');process.exitCode=1;}else transcribeRole({root:path.resolve(__dirname,'../../../..'),role:args[1],take:args.length===4?args[3]:'original'}).then(result=>console.log(JSON.stringify(result))).catch(e=>{console.error('Local ASR stopped: '+e.message);process.exitCode=1;});}
