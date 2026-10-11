'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { buildDraft, coarseCues, prepareReview } = require('./prepare-review.cjs');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
function fixture() {
  const binding = { role:'scheduling', name:'Clara Bennett', agent_id:'agent_test', agent_version:1, voice_id:'custom_test' };
  const questions = [0,1,2].map(index => ({role:'scheduling',index,text:`Approved presenter question ${index}.`,status:'completed',audio_sha256:String(index)}));
  const events = [];
  for (let index = -1; index < 3; index++) {
    const start = index === -1 ? 1 : index*10+8;
    events.push({event:'agent_start_talking',index,time:start*1000},{event:'agent_stop_talking',index,time:(start+3)*1000});
    if (index < 2) events.push({event:'question_started',index:index+1,time:(index+1)*10000+5000},{event:'question_finished',index:index+1,time:(index+1)*10000+7000});
  }
  const transcript = [];
  for (let i=0;i<4;i++) {
    transcript.push({role:'agent',id:`agent_${i}`,content:`Actual agent reply number ${i} with useful details.`,time_sec:i===0 ? 1 : (i-1)*10+8});
    if(i<3) transcript.push({role:'user',id:`user_${i}`,content:'Provider heard question',time_sec:i*10+5});
  }
  return {role:'scheduling',binding,questions,ledger:{allowance:{id:'awc_seven_custom_voice_demos_20261011',seconds:150,perAttemptUsd:1},attempts:[{role:'scheduling',state:'reconciled',call_id:'call_test',duration_ms:32000,cost_usd:.1,...binding}]},evidence:{complete:true,completedQuestions:3,questionCount:3,providerCalls:1,remoteTracks:1,errors:[],blockedRequests:0,durationSeconds:33,videoLeadInSeconds:1,recordedAudio:{decoded:true,rms:.04,durationSeconds:33},events,updates:[{source:'transcript_monitor',transcript}],ready:{clips:questions.map(q=>({text:q.text,sha256:q.audio_sha256}))}}};
}
test('draft maps stable-ID actual dialogue and accepted presenter text, never acceptance flags',()=>{
  const f=fixture(), result=buildDraft(f);
  assert.equal(result.review_status,'unreviewed'); assert.equal(result.mapping.length,7);
  assert.ok(result.captions.some(c=>c.text.startsWith('Presenter: Approved')));
  assert.equal(result.actual_audio_listening_reviewed,undefined);
  result.captions.forEach((cue,i)=>{if(i)assert.ok(cue.start>=result.captions[i-1].end);});
});
test('consecutive user fragments and agent fragments collapse to unambiguous role blocks',()=>{
  const f=fixture(), t=f.evidence.updates[0].transcript;
  t.splice(2,0,{role:'user',id:'user_9',content:'Second question sentence',time_sec:6});
  t.splice(1,0,{role:'agent',id:'agent_9',content:'Greeting continuation.',time_sec:2});
  const result=buildDraft(f); assert.deepEqual(result.mapping[0].transcript_ids,['agent_0','agent_9']);
  assert.deepEqual(result.mapping[1].transcript_ids,['user_0','user_9']);
});
test('failed capture, unsettled ledger and wrong presenter hash are excluded',()=>{
  const failed=fixture();failed.evidence.complete=false;assert.throws(()=>buildDraft(failed),/Complete genuine/);
  const unsettled=fixture();unsettled.ledger.attempts[0].state='created';assert.throws(()=>buildDraft(unsettled),/Matched reconciled/);
  const wrong=fixture();wrong.questions[1].audio_sha256='wrong';assert.throws(()=>buildDraft(wrong),/presenter texts\/hashes/);
});
test('no fabricated or ambiguous transcript mapping permitted',()=>{
  const missing=fixture();missing.evidence.updates=[];assert.throws(()=>buildDraft(missing),/Actual final monitor/);
  const duplicate=fixture();duplicate.evidence.updates[0].transcript[2].id='agent_0';assert.throws(()=>buildDraft(duplicate),/stable-ID/);
  const timing=fixture();timing.evidence.updates[0].transcript.at(-1).time_sec=100;assert.throws(()=>buildDraft(timing),/does not match/);
  const alternation=fixture();alternation.evidence.updates[0].transcript.splice(3,0,{role:'user',id:'user_9',content:'Unexpected interruption',time_sec:9},{role:'agent',id:'agent_9',content:'Unexpected backchannel',time_sec:10});assert.throws(()=>buildDraft(alternation),/unambiguously/);
});
test('coarse cues stay inside resumed audio spans without captioning the gap',()=>{
  const cues=coarseCues('one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen',[[1,3],[5,7]],'Agent');
  assert.ok(cues.every(c=>(c.start>=1&&c.end<=3)||(c.start>=5&&c.end<=7)));
});
test('overlapping observed presenter/agent spans fail and unsupported retake role is rejected',()=>{
  const f=fixture();f.evidence.events.find(e=>e.event==='question_started').time=3000;
  assert.throws(()=>buildDraft(f),/overlap/);assert.throws(()=>prepareReview({root:'.',role:'support',take:'retake'}),/limited/);
});
test('synthetic media mux aligns video lead-in, normalizes audio and stays explicitly unreviewed',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'awc-review-mux-')),f=fixture(),privateDir=path.join(root,'voice-samples/production-v2'),input=path.join(privateDir,'recordings/scheduling'),ffmpeg='C:/Program Files/ShareX/ffmpeg.exe';
  try{
    fs.mkdirSync(input,{recursive:true});fs.mkdirSync(path.join(privateDir,'presenter'));fs.mkdirSync(path.join(root,'docs/crew/voice-v2'),{recursive:true});
    fs.writeFileSync(path.join(input,'capture-evidence.json'),JSON.stringify(f.evidence));fs.writeFileSync(path.join(privateDir,'PAID-ATTEMPTS.json'),JSON.stringify(f.ledger));fs.writeFileSync(path.join(privateDir,'presenter/QUESTIONS.json'),JSON.stringify({items:f.questions}));fs.writeFileSync(path.join(root,'docs/crew/voice-v2/RECORDING-MANIFEST.json'),JSON.stringify({roles:[f.binding]}));
    execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=black:s=320x180:r=25','-t','34','-an','-c:v','libvpx','-deadline','realtime',path.join(input,'screen.webm')],{stdio:'pipe'});
    execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','33','-c:a','libopus',path.join(input,'mixed-audio.webm')],{stdio:'pipe'});
    const prepared=prepareReview({root,role:'scheduling',ffmpeg}),draft=JSON.parse(fs.readFileSync(path.join(prepared.outputDir,'REVIEW-DRAFT.json'),'utf8'));
    assert.equal(draft.review_status,'unreviewed');assert.equal(draft.take,'original');assert.equal(draft.video_alignment.videoLeadInSeconds,1);assert.equal(draft.source_sha256['screen.webm'].length,64);assert.ok(Math.abs(draft.measured_duration_seconds-33)<.15);assert.match(fs.readFileSync(path.join(prepared.outputDir,'preview.vtt'),'utf8'),/UNREVIEWED DRAFT/);assert.equal(fs.existsSync(path.join(privateDir,'approved')),false);
    assert.throws(()=>prepareReview({root,role:'scheduling',ffmpeg}),/already exists/);
  }finally{assert.equal(path.dirname(root),path.resolve(os.tmpdir()));assert.ok(path.basename(root).startsWith('awc-review-mux-'));fs.rmSync(root,{recursive:true,force:true});}
});
