'use strict';
// Offline only. No provider, upload or allowance mutations.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {takeProfile,assertSettledAttempt}=require('./take-profile.cjs');
const ROLES=['concierge','sales','scheduling','support','billing','implementation','retention'];
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const fail=message=>{throw Error(message);};
const finite=x=>Number.isFinite(x);
function inside(base,file){const relative=path.relative(base,path.resolve(file));if(relative.startsWith('..')||path.isAbsolute(relative))fail('Path must remain in private production-v2 directory');return path.resolve(file);}
function stamp(seconds){let ms=Math.round(seconds*1000);const h=Math.floor(ms/3600000);ms%=3600000;const m=Math.floor(ms/60000);ms%=60000;return [h,m,Math.floor(ms/1000)].map(x=>String(x).padStart(2,'0')).join(':')+'.'+String(ms%1000).padStart(3,'0');}
function validate({role,take='original',evidence,review,ledger,binding,sourceHashes}){
 const profile=takeProfile(role,take);
 if(evidence.complete!==true||evidence.completedQuestions!==3||evidence.questionCount!==3||evidence.providerCalls!==1||evidence.remoteTracks<1||evidence.errors?.length||evidence.blockedRequests||!finite(evidence.durationSeconds)||evidence.durationSeconds<=0||evidence.durationSeconds>152||!finite(evidence.videoLeadInSeconds)||evidence.videoLeadInSeconds<0)fail('Complete genuine three-question capture required');
 if(evidence.recordedAudio?.decoded!==true||!finite(evidence.recordedAudio.rms)||evidence.recordedAudio.rms<.00001)fail('Decoded nonzero actual audio required');
 const attempt=assertSettledAttempt(profile,ledger,binding);
 if(take==='retake'?review.take!=='retake':review.take!==undefined&&review.take!=='original')fail('Review take must match explicitly selected capture');
 if(review.role!==role||review.call_id!==attempt.call_id||review.status!=='reviewed'||typeof review.reviewed_by!=='string'||!review.reviewed_by.trim()||!finite(Date.parse(review.reviewed_at))||review.actual_audio_listening_reviewed!==true||review.dialogue_preserved!==true||review.meaningful_role_example_reviewed!==true||review.captions_actual_audio_reviewed!==true||review.claims_privacy_reviewed!==true)fail('Explicit actual-audio meaningful-dialogue/edit/caption/privacy review required');
 for(const name of ['screen.webm','mixed-audio.webm','capture-evidence.json'])if(review.source_sha256?.[name]!==sourceHashes[name])fail('Reviewed source hash changed: '+name);
 if(!Array.isArray(review.ranges)||!review.ranges.length)fail('Reviewed source-audio ranges required');
 let duration=0,previous=0;for(const range of review.ranges){if(!Array.isArray(range)||range.length!==2||!range.every(finite)||range[0]<previous||range[1]<=range[0]||range[1]>Math.min(evidence.durationSeconds,evidence.recordedAudio.durationSeconds))fail('Invalid or overlapping source edit range');duration+=range[1]-range[0];previous=range[1];}
 if(duration<=33||duration>150)fail('Complete meaningful dialogue must exceed 33 seconds and remain within 150 seconds; no padding');
 if(!Array.isArray(review.captions)||!review.captions.length)fail('Reviewed actual-audio captions required');
 let last=0;const captions=review.captions.map(c=>{if(!finite(c.start)||!finite(c.end)||c.start<last||c.end<=c.start||typeof c.text!=='string'||!c.text.trim()||/[\r\n]|-->|[\u0000-\u001f]/.test(c.text)||c.text.includes('<'))fail('Invalid or overlapping source caption');last=c.end;let offset=0;for(const [a,b]of review.ranges){if(c.start>=a&&c.end<=b)return {start:c.start-a+offset,end:c.end-a+offset,text:c.text.trim()};offset+=b-a;}fail('Caption crosses a cut or lies outside reviewed ranges');});
 for(let i=0;i<captions.length;i++){const c=captions[i];if(c.end>duration||Math.round(c.end*1000)<=Math.round(c.start*1000)||(i&&Math.round(c.start*1000)<Math.round(captions[i-1].end*1000)))fail('Invalid caption after millisecond remapping');}
 return {duration,captions,attempt};
}
function finalizeUnlocked({root,role,take='original',reviewPath,ffmpeg='C:/Program Files/ShareX/ffmpeg.exe'}){
 const profile=takeProfile(role,take),privateDir=path.resolve(root,'voice-samples/production-v2'),input=path.join(privateDir,'recordings',profile.captureName);
 const reviewed=inside(privateDir,reviewPath),review=read(reviewed),evidence=read(path.join(input,'capture-evidence.json'));
 const sourceHashes=Object.fromEntries(['screen.webm','mixed-audio.webm','capture-evidence.json'].map(name=>[name,hash(fs.readFileSync(path.join(input,name)))]));
 const ledger=read(path.join(privateDir,profile.ledgerFile)),binding=read(path.join(root,'docs/crew/voice-v2/RECORDING-MANIFEST.json')).roles?.find(e=>e.role===role);
 const checked=validate({role,take,evidence,review,ledger,binding,sourceHashes});
 const out=path.join(privateDir,'approved');fs.mkdirSync(out,{recursive:true});const target=path.join(out,role+'-v2.mp4'),vtt=path.join(out,role+'-v2.vtt'),manifestPath=path.join(out,'media-manifest.json');
 if(fs.existsSync(target)||fs.existsSync(vtt))fail('Approved v2 output already exists; never overwrite accepted media');
 const existing=fs.existsSync(manifestPath)?read(manifestPath):[];if(!Array.isArray(existing)||existing.some(e=>e.role===role))fail('Role manifest already exists or is malformed');
 const temp=fs.mkdtempSync(path.join(out,'.finalize-')),video=path.join(temp,role+'-v2.mp4'),captionFile=path.join(temp,role+'-v2.vtt');
 try{
  const filters=[];review.ranges.forEach(([a,b],i)=>filters.push(`[0:v]trim=start=${a+evidence.videoLeadInSeconds}:end=${b+evidence.videoLeadInSeconds},setpts=PTS-STARTPTS,scale=1280:720,setsar=1[v${i}]`,`[1:a]atrim=start=${a}:end=${b},asetpts=PTS-STARTPTS,aresample=48000[a${i}]`));
  filters.push(review.ranges.map((_,i)=>`[v${i}][a${i}]`).join('')+`concat=n=${review.ranges.length}:v=1:a=1[v][a]`,'[a]loudnorm=I=-16:TP=-1.5:LRA=11[normalized]');
  execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-n','-i',path.join(input,'screen.webm'),'-i',path.join(input,'mixed-audio.webm'),'-filter_complex',filters.join(';'),'-map','[v]','-map','[normalized]','-r','25','-c:v','libx264','-preset','veryfast','-crf','24','-c:a','aac','-b:a','128k','-movflags','+faststart',video],{stdio:'pipe'});
  // Fully decode once; inspect mux duration rather than trusting selected ranges.
  const metadata=require('node:child_process').spawnSync(ffmpeg,['-hide_banner','-xerror','-i',video,'-f','null','-'],{encoding:'utf8'});if(metadata.status!==0)fail('Final decode failed');
  const match=/Duration: (\d+):(\d+):(\d+\.\d+)/.exec(metadata.stderr);if(!match)fail('Final duration unavailable');const measured=+match[1]*3600+ +match[2]*60+ +match[3];if(Math.abs(measured-checked.duration)>.15||measured<=33||measured>150)fail('Mux duration differs from reviewed dialogue');
  fs.writeFileSync(captionFile,'WEBVTT\n\n'+checked.captions.map(c=>stamp(c.start)+' --> '+stamp(c.end)+'\n'+c.text+'\n').join('\n'));
  const bytes=fs.statSync(video).size;if(bytes>12*1024*1024||fs.statSync(captionFile).size>65536)fail('Media exceeds existing publication size limit');
  const entry={role,take,allowance_id:profile.allowanceId,video_filename:role+'-v2.mp4',caption_filename:role+'-v2.vtt',duration_seconds:measured,edited_duration_seconds:checked.duration,target_duration_seconds:[90,120],within_target_duration:checked.duration>=90&&checked.duration<=120,meaningful_role_example_reviewed:true,mp4_bytes:bytes,mp4_sha256:hash(fs.readFileSync(video)),vtt_sha256:hash(fs.readFileSync(captionFile)),review_sha256:hash(fs.readFileSync(reviewed)),source_sha256:sourceHashes,caption_cues:checked.captions.length,no_caption_overlap:true,full_decode_passed:true,source:'Genuine recorded provider dialogue with accepted synthetic presenter questions',reviewed_at:review.reviewed_at};
  fs.copyFileSync(video,target,fs.constants.COPYFILE_EXCL);fs.copyFileSync(captionFile,vtt,fs.constants.COPYFILE_EXCL);fs.writeFileSync(manifestPath,JSON.stringify([...existing,entry],null,2)+'\n');return entry;
 }finally{for(const name of fs.readdirSync(temp))fs.unlinkSync(path.join(temp,name));fs.rmdirSync(temp);}
}
function finalizeRole(options){
 takeProfile(options.role,options.take);
 const out=path.resolve(options.root,'voice-samples/production-v2/approved');fs.mkdirSync(out,{recursive:true});
 const lock=path.join(out,'.finalize.lock'),fd=fs.openSync(lock,'wx',0o600);
 try{return finalizeUnlocked(options);}finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
module.exports={validate,stamp,finalizeRole};
if(require.main===module){const [role,reviewPath,...extra]=process.argv.slice(2);try{if(!role||!reviewPath||extra.length&&!(extra.length===2&&extra[0]==='--take'))fail('Usage: node finalize-media.cjs ROLE PRIVATE_REVIEW_JSON [--take original|retake]');const take=extra.length?extra[1]:'original';takeProfile(role,take);console.log(JSON.stringify(finalizeRole({root:path.resolve(__dirname,'../../../..'),role,take,reviewPath})));}catch(e){console.error('Offline finalization stopped: '+e.message);process.exitCode=1;}}
