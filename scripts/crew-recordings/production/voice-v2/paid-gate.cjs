'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const ROLES = Object.freeze(['concierge','sales','scheduling','support','billing','implementation','retention']);
const LIMITS = Object.freeze({ id:'awc_seven_custom_voice_demos_20261011', attempts:7, seconds:150, perAttemptUsd:1, totalUsd:7 });
const ORIGINAL_LIMITS=LIMITS,ORIGINAL_ROLES=ROLES;
const RETAKE_LIMITS=Object.freeze({id:'awc_autumn_owen_fresh_demos_20261011',attempts:2,seconds:150,perAttemptUsd:1,totalUsd:2});
const RETAKE_ROLES=Object.freeze(['concierge','sales']);
const RENEWAL_ID='awc_autumn_owen_fresh_demos_20261011_readiness_renewal_20261011';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const stable = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k,v[k]])) : v);
// Pin all returned configuration fields except mutable dashboard metadata. Publication itself is checked separately.
function bindingDigest(value) { const copy = {...value}; for (const k of ['last_modification_timestamp','is_published','assigned_tags','version_description','version_title']) delete copy[k]; return sha(stable(copy)); }
const fail = message => { throw Error(message); };
function validateRetakeRenewal({root,proof,clock=Date.now,requirePinnedProof=false}) {
 const docs=path.join(root,'docs/crew/voice-v2'),priv=path.join(root,'voice-samples/production-v2');
 const readyPath=path.join(docs,'RETAKE-READINESS.json'),readiness=JSON.parse(fs.readFileSync(readyPath,'utf8')),ledger=JSON.parse(fs.readFileSync(path.join(priv,'RETAKE-ATTEMPTS.json'),'utf8'));
 const fingerprint=sha(stable({limits:RETAKE_LIMITS,approval:readiness.approval_sha256,manifest:readiness.manifest_sha256,questions:readiness.questions_sha256,readiness:sha(fs.readFileSync(readyPath))}));
 const reviewed=Date.parse(proof?.reviewed_at),expiry=Date.parse(proof?.expires_at);
 if(proof?.renewal_id!==RENEWAL_ID||proof.allowance_id!==RETAKE_LIMITS.id||proof.base_readiness_sha256!==sha(fs.readFileSync(readyPath))||proof.original_ledger_fingerprint!==fingerprint||ledger.fingerprint!==fingerprint||stable(ledger.allowance)!==stable(RETAKE_LIMITS)||fs.readFileSync(path.join(priv,'RETAKE-ATTEMPTS.json.initialized'),'utf8')!==fingerprint)fail('Renewal must pin the immutable retake grant and readiness');
 if(!Number.isFinite(reviewed)||!Number.isFinite(expiry)||reviewed>clock()||expiry<=clock()||expiry<=reviewed||expiry-reviewed>10800000||Date.parse(readiness.expires_at)>clock())fail('Renewal requires current bounded review, at most three hours');
 for(const [k,file] of [['approval','RETAKE-ALLOWANCE.json'],['manifest','RECORDING-MANIFEST.json']])if(proof[k+'_sha256']!==readiness[k+'_sha256']||sha(fs.readFileSync(path.join(docs,file)))!==readiness[k+'_sha256'])fail('Renewal cannot change approved pins');
 if(proof.questions_sha256!==readiness.questions_sha256||sha(fs.readFileSync(path.join(priv,'presenter/QUESTIONS.json')))!==readiness.questions_sha256)fail('Renewal cannot change presenter questions');
 if(proof.preflight_reviewed_unchanged!==true||proof.native_voice_acceptance_unchanged!==true||proof.presenter_acceptance_unchanged!==true||proof.rate_reviewed_unchanged!==true||proof.provider_pins_reviewed_unchanged!==true||typeof proof.review_source!=='string'||!proof.review_source.trim()||stable(proof.roles)!==stable(['sales']))fail('Fresh unchanged readiness review for unused Owen required');
 if(requirePinnedProof&&fs.readFileSync(path.join(priv,'RETAKE-RENEWAL-PROOF.sha256'),'utf8')!==sha(fs.readFileSync(path.join(docs,'RETAKE-READINESS-RENEWAL.json'))))fail('Append-only renewal proof changed');
 const autumn=ledger.attempts.filter(a=>a.role==='concierge');
 if(autumn.length!==1||autumn[0].state!=='reconciled'||!Number.isFinite(autumn[0].cost_usd)||autumn[0].cost_usd<0||autumn[0].cost_usd>1||!Number.isFinite(autumn[0].duration_ms)||autumn[0].duration_ms<0||autumn[0].duration_ms>150000||ledger.attempts.some(a=>a.role==='sales'))fail('Renewal cannot reset consumed roles; Owen must remain unreserved');
 return {expires_at:expiry,fingerprint};
}
function assertAllowance(a) {
 if(a.id !== LIMITS.id || a.status !== 'approved_not_used' || a.max_attempts !== 7 || a.max_seconds_per_attempt !== 150 || a.max_usd_per_attempt !== 1 || a.max_total_usd !== 7 || stable(a.roles) !== stable(ROLES) || a.automatic_retries !== false || a.public_live_activation !== false || a.recharge !== false || a.subscriptions !== false || a.attempts_consumed !== 0 || a.actual_spend_usd !== 0) fail('Approved grant differs from immutable seven-attempt limits');
}
function assertProvider(entry, agent, llm) {
 if(!agent.is_published || !llm.is_published || agent.agent_id !== entry.agent_id || agent.version !== entry.agent_version || agent.voice_id !== entry.voice_id || agent.response_engine?.type !== 'retell-llm' || agent.response_engine.llm_id !== entry.llm_id || agent.response_engine.version !== entry.llm_version || llm.llm_id !== entry.llm_id || llm.version !== entry.llm_version) fail('Published pinned voice/agent/LLM identity mismatch');
 if(agent.max_call_duration_ms !== 150000 || agent.data_storage_setting !== 'basic_attributes_only' || agent.contact_memory_config?.enable_read !== false || agent.contact_memory_config?.enable_update !== false || agent.webhook_url || agent.dynamic_voice_id || agent.voice_model_override || agent.response_engine?.websocket_url) fail('Unsafe duration/storage/memory/voice configuration');
 for(const [object,keys] of [[agent,['pre_session_tools','post_session_tools','fallback_voice_ids','webhook_events']], [llm,['general_tools','states','mcps','knowledge_base_ids']]]) for(const k of keys) if(object[k] != null && (!Array.isArray(object[k]) || object[k].length)) fail('Tools/knowledge/fallback must remain unconnected');
 if(sha(llm.general_prompt || '') !== entry.prompt_sha256 || bindingDigest(agent) !== entry.agent_sha256 || bindingDigest(llm) !== entry.llm_sha256) fail('Provider binding hash changed');
}
function createGate({root, api, clock = Date.now, profile='original'}) {
 if(!['original','retake'].includes(profile))fail('Unknown fixed recording profile');
 const LIMITS=profile==='retake'?RETAKE_LIMITS:ORIGINAL_LIMITS,ROLES=profile==='retake'?RETAKE_ROLES:ORIGINAL_ROLES,prefix=profile==='retake'?'RETAKE':'RECORDING';
 const privateDir = path.join(root,'voice-samples/production-v2'), ledgerPath = path.join(privateDir,profile==='retake'?'RETAKE-ATTEMPTS.json':'PAID-ATTEMPTS.json'), lockPath = ledgerPath+'.lock', markerPath=ledgerPath+'.initialized';
 const files = {approval:path.join(root,'docs/crew/voice-v2/'+prefix+'-ALLOWANCE.json'), manifest:path.join(root,'docs/crew/voice-v2/RECORDING-MANIFEST.json'), readiness:path.join(root,'docs/crew/voice-v2/'+prefix+'-READINESS.json'), questions:path.join(privateDir,'presenter/QUESTIONS.json')};
 const read = file => JSON.parse(fs.readFileSync(file,'utf8'));
 function inputs(role) {
  const approval=read(files.approval);
  if(profile==='original')assertAllowance(approval);
  else if(approval.id!==LIMITS.id||approval.status!=='approved_not_used'||approval.max_attempts!==2||approval.max_seconds_per_attempt!==150||approval.max_usd_per_attempt!==1||approval.max_total_usd!==2||stable(approval.roles)!==stable(ROLES)||approval.automatic_retries!==false||approval.public_live_activation!==false||approval.recharge!==false||approval.subscriptions!==false||approval.attempts_consumed!==0||approval.actual_spend_usd!==0||typeof approval.source!=='string'||!approval.source.trim())fail('Fresh owner-approved two-attempt grant required; original grant cannot authorize retakes');
  const manifest=read(files.manifest), readiness=read(files.readiness), questions=read(files.questions);
  let expiry=Date.parse(readiness.expires_at);const reviewed=Date.parse(readiness.reviewed_at);
  if(!Number.isFinite(expiry)||!Number.isFinite(reviewed)||reviewed>clock()||expiry-reviewed>86400000||expiry<=reviewed) fail('Readiness expired or exceeds bounded 24-hour window');
  if(expiry<=clock()) {
   if(profile!=='retake')fail('Readiness expired');
   const proof=read(path.join(root,'docs/crew/voice-v2/RETAKE-READINESS-RENEWAL.json'));
   expiry=validateRetakeRenewal({root,proof,clock,requirePinnedProof:true}).expires_at;
   if(!proof.roles.includes(role))fail('Consumed role excluded from readiness renewal');
  }
  if(manifest.allowance_id!==ORIGINAL_LIMITS.id || readiness.allowance_id!==LIMITS.id || !Array.isArray(manifest.roles) || stable(manifest.roles.map(e=>e.role).sort())!==stable([...ORIGINAL_ROLES].sort())||!ROLES.includes(role)) fail('Manifest roles or allowance mismatch');
  for(const k of ['approval','manifest','questions']) if(sha(fs.readFileSync(files[k])) !== readiness[k+'_sha256']) fail('Reviewed file changed: '+k);
  if(readiness.preflight_passed!==true || readiness.supervised_recording_authorized!==true || readiness.presenter_listening_accepted!==true || typeof readiness.acceptance_source!=='string' || !readiness.acceptance_source.trim()) fail('Supervision/listening/preflight evidence required');
  if(!Array.isArray(questions.items)||questions.items.length!==21||ORIGINAL_ROLES.some(r=>{const items=questions.items.filter(q=>q.role===r);return items.length!==3||items.some(q=>q.status!=='completed')||new Set(items.map(q=>q.index)).size!==3||items.some(q=>![0,1,2].includes(q.index));})) fail('All 21 presenter clips must finish before immutable readiness');
  const entry=manifest.roles.find(e=>e.role===role), accepted=readiness.roles?.find(e=>e.role===role); if(!entry||!accepted) fail('Unknown or unreviewed role');
  if(!/^agent_[A-Za-z0-9]+$/.test(entry.agent_id)||!/^llm_[A-Za-z0-9]+$/.test(entry.llm_id)||!/^custom_voice_[A-Za-z0-9]+$/.test(entry.voice_id)||!Number.isInteger(entry.agent_version)||entry.agent_version<0||!Number.isInteger(entry.llm_version)||entry.llm_version<0) fail('Invalid pinned identifiers');
  if(accepted.native_voice_listening_accepted!==true || accepted.voice_id!==entry.voice_id || accepted.agent_version!==entry.agent_version || !accepted.preview_sha256?.match(/^[a-f0-9]{64}$/) || !accepted.rate_evidence_source?.trim() || accepted.rate_reviewed!==true || !Number.isFinite(accepted.all_in_usd_per_minute) || accepted.all_in_usd_per_minute<=0 || accepted.all_in_usd_per_minute>0.36) fail('Owner native-voice acceptance and reviewed all-in rate <= $0.36/min required');
  if(sha(fs.readFileSync(path.join(privateDir,'clone-previews',role+'.mp3'))) !== accepted.preview_sha256) fail('Reviewed native voice preview changed');
  const clips=questions.items?.filter(q=>q.role===role).sort((a,b)=>a.index-b.index);
  if(!clips||clips.length!==3||clips.some((q,i)=>q.index!==i||q.status!=='completed'||sha(q.text)!==q.script_sha256||!Number.isFinite(q.duration)||q.duration<=0)||clips.reduce((s,q)=>s+q.duration,0)>=150) fail('Exactly three completed bounded questions required');
  for(const q of clips) { const p=path.resolve(q.wavPath), relative=path.relative(privateDir,p); if(relative.startsWith('..')||path.isAbsolute(relative)||sha(fs.readFileSync(p))!==q.audio_sha256) fail('Private question audio changed or path escaped'); }
  if(profile==='retake') {
   const oldApprovalPath=path.join(root,'docs/crew/voice-v2/RECORDING-ALLOWANCE.json'),oldReadyPath=path.join(root,'docs/crew/voice-v2/RECORDING-READINESS.json'),oldReady=read(oldReadyPath),oldLedger=read(path.join(privateDir,'PAID-ATTEMPTS.json'));
   assertAllowance(read(oldApprovalPath));
   for(const [k,p] of [['approval',oldApprovalPath],['manifest',files.manifest],['questions',files.questions]])if(oldReady[k+'_sha256']!==sha(fs.readFileSync(p)))fail('Original reviewed source changed');
   const oldFingerprint=sha(stable({limits:ORIGINAL_LIMITS,approval:oldReady.approval_sha256,manifest:oldReady.manifest_sha256,questions:oldReady.questions_sha256,readiness:sha(fs.readFileSync(oldReadyPath))}));
   if(stable(oldLedger.allowance)!==stable(ORIGINAL_LIMITS)||oldLedger.fingerprint!==oldFingerprint||fs.readFileSync(path.join(privateDir,'PAID-ATTEMPTS.json.initialized'),'utf8')!==oldFingerprint||!Array.isArray(oldLedger.attempts)||oldLedger.attempts.length>7||new Set(oldLedger.attempts.map(a=>a.role)).size!==oldLedger.attempts.length||oldLedger.attempts.some(a=>!ORIGINAL_ROLES.includes(a.role)||a.state!=='reconciled'||!Number.isFinite(a.cost_usd)||a.cost_usd<0||a.cost_usd>1||!Number.isFinite(a.duration_ms)||a.duration_ms<0||a.duration_ms>150000))fail('Original grant remains unsettled or changed; no fresh attempt');
   const original=oldLedger.attempts.filter(a=>a.role===role),failedPath=path.join(privateDir,'recordings',role,'capture-evidence.json'),failed=read(failedPath);
   if(original.length!==1||original[0].agent_id!==entry.agent_id||original[0].agent_version!==entry.agent_version||original[0].voice_id!==entry.voice_id||failed.complete!==false||failed.questionCount!==3)fail('Only the two reconciled incomplete original demonstrations are eligible');
   if(readiness.original_approval_sha256!==sha(fs.readFileSync(oldApprovalPath))||readiness.original_readiness_sha256!==sha(fs.readFileSync(oldReadyPath))||accepted.failed_capture_sha256!==sha(fs.readFileSync(failedPath)))fail('Original failed-attempt proof changed');
  }
  const fingerprint=sha(stable({limits:LIMITS,approval:readiness.approval_sha256,manifest:readiness.manifest_sha256,questions:readiness.questions_sha256,readiness:sha(fs.readFileSync(files.readiness))}));
  return {entry,clips,fingerprint,expiry,recordingVariant:profile==='retake'?role+'-retake':role};
 }
 function load(fingerprint) {
  if(!fs.existsSync(ledgerPath)&&fs.existsSync(markerPath))fail('Initialized ledger missing; never reset consumed grant');
  if(fs.existsSync(markerPath)&&fs.readFileSync(markerPath,'utf8')!==fingerprint)fail('Immutable initialization marker changed');
  const ledger=fs.existsSync(ledgerPath)?read(ledgerPath):{allowance:LIMITS,fingerprint,attempts:[]};
  if(stable(ledger.allowance)!==stable(LIMITS)||ledger.fingerprint!==fingerprint||!Array.isArray(ledger.attempts)||ledger.attempts.length>LIMITS.attempts||new Set(ledger.attempts.map(a=>a.role)).size!==ledger.attempts.length||ledger.attempts.some(a=>!ROLES.includes(a.role)||a.reserved_usd!==1||!['reserved','created','failed_consumed','reconciled','bounds_violation'].includes(a.state))) fail('Immutable ledger mismatch; no reset or rollover');
  return ledger;
 }
 function withLock(fn) { fs.mkdirSync(privateDir,{recursive:true}); let fd; try {fd=fs.openSync(lockPath,'wx',0o600);} catch {fail('Gate locked; never clear or retry automatically');} try{return fn();} finally {fs.closeSync(fd);fs.unlinkSync(lockPath);} }
 function save(ledger) {
  // A crash between marker and ledger leaves the grant blocked rather than reopening it.
  if(!fs.existsSync(markerPath)){const marker=fs.openSync(markerPath,'wx',0o600);try{fs.writeFileSync(marker,ledger.fingerprint);fs.fsyncSync(marker);}finally{fs.closeSync(marker);}}
  const temp=ledgerPath+'.'+crypto.randomUUID()+'.tmp',fd=fs.openSync(temp,'wx',0o600); try{fs.writeFileSync(fd,JSON.stringify(ledger,null,2)+'\n');fs.fsyncSync(fd);} finally{fs.closeSync(fd);} fs.renameSync(temp,ledgerPath);
 }
 function update(role,fingerprint,fn) {return withLock(()=>{const ledger=load(fingerprint),attempt=ledger.attempts.find(a=>a.role===role);if(!attempt)fail('No attempt');fn(attempt);save(ledger);return attempt;});}
 function preflight(role) {const input=inputs(role),ledger=load(input.fingerprint);if(ledger.attempts.some(a=>a.role===role)||ledger.attempts.length>=LIMITS.attempts)fail('Role consumed or grant exhausted; no retries');if(ledger.attempts.some(a=>a.state!=='reconciled'))fail('Previous attempt unresolved or violated bounds'); if(ledger.attempts.reduce((s,a)=>s+a.reserved_usd,0)+1>LIMITS.totalUsd)fail('Total reservation exhausted'); return input;}
 async function createSession(role,ready={}) {
  if(ready.browserReady!==true||ready.captureReady!==true||ready.ready?.secure!==true||ready.ready?.recorder!==true||ready.ready?.sdk!==true||!Array.isArray(ready.ready?.clips)||ready.ready.clips.length!==3) fail('Decoded browser/capture readiness required before paid attempt');
  const input=preflight(role),e=input.entry;
  const agent=await api('GET','/get-agent/'+e.agent_id+'?version='+e.agent_version),llm=await api('GET','/get-retell-llm/'+e.llm_id+'?version='+e.llm_version); assertProvider(e,agent,llm);
  for(let i=0;i<3;i++) if(ready.ready.clips[i].sha256!==input.clips[i].audio_sha256||!Number.isFinite(ready.ready.clips[i].durationSeconds)||ready.ready.clips[i].durationSeconds<=0) fail('Browser decoded audio does not match reviewed clips');
  if(ready.ready.clips.reduce((s,q)=>s+q.durationSeconds,0)>=150)fail('Decoded audio exceeds cap');
  // Re-read every pinned file under exclusive lock immediately before consuming the allowance.
  withLock(()=>{const current=preflight(role);if(current.fingerprint!==input.fingerprint||current.expiry<=clock())fail('Approval changed during preflight');const ledger=load(input.fingerprint);ledger.attempts.push({role,agent_id:e.agent_id,agent_version:e.agent_version,voice_id:e.voice_id,reserved_usd:1,state:'reserved',reserved_at:new Date(clock()).toISOString()});save(ledger);});
  try {
   const session=await api('POST','/v3/create-web-call',{agent_id:e.agent_id,agent_version:e.agent_version,metadata:{business_id:'aw_creatives',specialist_role:role,allowance_id:LIMITS.id,purpose:'owner_consented_local_recorded_demo'}});
   // Save a returned identity before validating the token so failed creation can still be stopped/reconciled.
   if(/^call_[A-Za-z0-9]+$/.test(session.call_id)) update(role,input.fingerprint,a=>{a.call_id=session.call_id;a.state='created';});
   if(!/^call_[A-Za-z0-9]+$/.test(session.call_id)||typeof session.access_token!=='string'||!session.access_token||!['gateway','livekit'].includes(session.transport)||!Number.isFinite(session.expires_at)||session.expires_at<=clock())fail('Malformed provider response; attempt consumed');
   return session;
  } catch {update(role,input.fingerprint,a=>a.state='failed_consumed');fail('Provider creation failed or uncertain; attempt consumed, no retry');}
 }
 async function reconcile(role) {
  const stored=read(ledgerPath),attempt=stored.attempts.find(a=>a.role===role);if(!attempt?.call_id)fail('No settled call identity; attempt remains consumed and blocks next role');
  const call=await api('GET','/v2/get-call/'+attempt.call_id),cents=call.call_cost?.combined_cost;
  if(!['ended','error','not_connected'].includes(call.call_status)||!Number.isFinite(cents)||cents<0||!Number.isFinite(call.duration_ms)||call.duration_ms<0)fail('Call not terminal with settled cost/duration');
  const within=call.agent_id===attempt.agent_id && call.agent_version===attempt.agent_version && call.duration_ms<=150000 && cents<=100;
  update(role,stored.fingerprint,a=>{a.cost_usd=cents/100;a.duration_ms=call.duration_ms;a.state=within?'reconciled':'bounds_violation';a.reconciled_at=new Date(clock()).toISOString();});
  if(!within)fail('Provider identity, duration or cost violated cap; block subsequent roles');return {role,cost_usd:cents/100,duration_ms:call.duration_ms,within_bounds:true};
 }
 async function stopAfterFailure(role) {
  if(!fs.existsSync(ledgerPath))return {stopped:false,reason:'no_attempt'};
  const stored=read(ledgerPath),attempt=stored.attempts.find(a=>a.role===role); if(!attempt?.call_id)return {stopped:false,reason:'unknown_call_identity'};
  const call=await api('GET','/v2/get-call/'+attempt.call_id);if(['ongoing','registered'].includes(call.call_status)){await api('POST','/v2/stop-call/'+attempt.call_id);return {stopped:true};}return {stopped:false,reason:'already_terminal'};
 }
 return {inputs,preflight,createSession,reconcile,stopAfterFailure,status:()=>{if(!fs.existsSync(ledgerPath)&&fs.existsSync(markerPath))fail('Initialized ledger missing; never reset consumed grant');return fs.existsSync(ledgerPath)?read(ledgerPath):{allowance:LIMITS,attempts:[]};}};
}
const createRetakeGate=options=>createGate({...options,profile:'retake'});
module.exports={createGate,createRetakeGate,LIMITS,ROLES,RETAKE_LIMITS,RETAKE_ROLES,RENEWAL_ID,validateRetakeRenewal,sha,stable,bindingDigest,assertProvider};
