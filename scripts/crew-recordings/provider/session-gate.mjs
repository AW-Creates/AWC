import {readFileSync,writeFileSync,existsSync,mkdirSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url));
const canonical='C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC';
const manifest=JSON.parse(readFileSync(resolve(canonical,'docs/crew/FLAGSHIP-PROVIDER-MANIFEST.json'),'utf8'));
export const ALLOWANCE=Object.freeze({id:'awc_six_recorded_demos_20261010T0200Z',maxAttempts:6,maxSeconds:90,maxTotalUsd:3,maxPerRoleUsd:0.50,noRetry:true,publicActivation:false});
const entries=[manifest.concierge,...manifest.agents];
const privateDir=resolve(dir,'private');mkdirSync(privateDir,{recursive:true});
const ledgerPath=resolve(privateDir,ALLOWANCE.id+'.json');
const lockPath=ledgerPath+'.lock';
const initial=()=>({allowance:ALLOWANCE,attempts:[],created_at:new Date().toISOString()});
function load(){const ledger=existsSync(ledgerPath)?JSON.parse(readFileSync(ledgerPath,'utf8')):initial();if(JSON.stringify(ledger.allowance)!==JSON.stringify(ALLOWANCE))throw Error('Immutable allowance mismatch');return ledger;}
function save(ledger){writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n',{mode:0o600});}
function lock(){return openSync(lockPath,'wx');}
function unlock(fd){closeSync(fd);unlinkSync(lockPath);}
function credential(){const raw=readFileSync(resolve(canonical,'.env'),'utf8');const line=raw.split(/\r?\n/).find(line=>/^\s*RETELL_API_KEY\s*=/.test(line));const key=line?.split('=').slice(1).join('=').trim().replace(/^(['"])(.*)\1$/,'$2');if(!key)throw Error('Secure server credential missing');return key;}
async function api(path,payload){if(!/^\/(?:v3\/create-web-call|get-agent\/agent_[A-Za-z0-9]+\?version=\d+|get-retell-llm\/llm_[A-Za-z0-9]+|v2\/get-call\/call_[A-Za-z0-9]+)$/.test(path))throw Error('Endpoint rejected');const r=await fetch('https://api.retellai.com'+path,{method:payload?'POST':'GET',headers:{Authorization:'Bearer '+credential(),'Content-Type':'application/json'},...(payload?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Provider HTTP '+r.status+'; body suppressed');return r.json();}
export function status(){const ledger=load();return {allowance:ALLOWANCE,attempts:ledger.attempts.map(({role,state,cost_usd,call_id})=>({role,state,cost_usd,call_id})),remaining:6-ledger.attempts.length};}
export async function createSession(role,{browserReady=false,captureReady=false,consent=false,approvedRateUsdPerMinute}={}){
 throw Error('This recording allowance is closed: all six attempts consumed. A new explicit allowance and separate gate are required.');
 if(!browserReady||!captureReady||!consent)throw Error('Browser, recorder and explicit recording consent must be ready before reservation');
 if(!Number.isFinite(approvedRateUsdPerMinute)||approvedRateUsdPerMinute<=0||approvedRateUsdPerMinute>0.30)throw Error('Verified all-in rate <=$0.30/min required ($0.45/90sec leaves $0.05 margin)');
 const entry=entries.find(entry=>entry?.role===role);if(!entry||!/^agent_[A-Za-z0-9]+$/.test(entry.agent_id)||!Number.isInteger(entry.version))throw Error('Unknown reviewed role');
 // Read-only safety/identity check happens before consuming a paid attempt.
 const agent=await api('/get-agent/'+entry.agent_id+'?version='+entry.version),llm=await api('/get-retell-llm/'+entry.llm_id);
 if(!agent.is_published||agent.version!==entry.version||agent.response_engine?.llm_id!==entry.llm_id||!agent.agent_name?.includes(entry.name)||llm.general_tools?.length||llm.states?.length||llm.mcps?.length||llm.knowledge_base_ids?.length||agent.pre_session_tools?.length||agent.post_session_tools?.length||agent.webhook_url)throw Error('Provider configuration no longer matches safe identity');
 const fd=lock();let attempt;
 try{const ledger=load();if(ledger.attempts.some(attempt=>attempt.role===role)||ledger.attempts.length>=6)throw Error('Role attempt already consumed or allowance exhausted; no retries');if(ledger.attempts.some(attempt=>!['reconciled'].includes(attempt.state)))throw Error('Reconcile previous attempt before another role');if(ledger.attempts.some(attempt=>attempt.cost_usd>0.50)||ledger.attempts.reduce((sum,a)=>sum+(a.cost_usd||0),0)+0.50>3)throw Error('Cost guard stop');attempt={role,agent_id:entry.agent_id,agent_version:entry.version,state:'reserved',reserved_usd:0.50,rate_usd_per_minute:approvedRateUsdPerMinute,reserved_at:new Date().toISOString()};ledger.attempts.push(attempt);save(ledger);}finally{unlock(fd);}
 try{
  const session=await api('/v3/create-web-call',{agent_id:entry.agent_id,agent_version:entry.version,agent_override:{agent:{max_call_duration_ms:90000,end_call_after_silence_ms:30000,data_storage_setting:'basic_attributes_only',contact_memory_config:{enable_read:false,enable_update:false},pre_session_tools:[],post_session_tools:[]}},metadata:{business_id:'aw_creatives',specialist_role:role,allowance_id:ALLOWANCE.id,purpose:'owner_consented_local_recorded_demo'},retell_llm_dynamic_variables:{business:'A. Wilcher Creatives',business_id:'aw_creatives',specialist:entry.name,specialist_id:entry.specialist_id,role,demo_id:''}});
  if(!/^call_[A-Za-z0-9]+$/.test(session.call_id)||typeof session.access_token!=='string'||!['gateway','livekit'].includes(session.transport)||!Number.isFinite(session.expires_at)||session.expires_at<=Date.now())throw Error('Unexpected session; attempt remains consumed');
  const ledger=load(),stored=ledger.attempts.find(a=>a.role===role);stored.state='created';stored.call_id=session.call_id;stored.created_at=new Date().toISOString();save(ledger);
  // Token stays only in Node memory and the loopback response, never disk/stdout/argv/logs.
  return session;
 }catch(error){const ledger=load(),stored=ledger.attempts.find(a=>a.role===role);stored.state='failed_consumed';save(ledger);throw error;}
}
export async function reconcile(role){const ledger=load(),attempt=ledger.attempts.find(a=>a.role===role);if(!attempt?.call_id)throw Error('No call identity; failed attempt requires operator closeout and never retries');const call=await api('/v2/get-call/'+attempt.call_id);if(call.call_status!=='ended'||!Number.isFinite(call.call_cost?.combined_cost))throw Error('Call must end and provider cost must settle first');if(call.agent_id!==attempt.agent_id||call.agent_version!==attempt.agent_version)throw Error('Call identity mismatch');attempt.cost_usd=call.call_cost.combined_cost/100;attempt.duration_ms=call.duration_ms;attempt.state='reconciled';attempt.reconciled_at=new Date().toISOString();save(ledger);return {role,call_id:attempt.call_id,agent_id:attempt.agent_id,agent_version:attempt.agent_version,cost_usd:attempt.cost_usd,duration_ms:attempt.duration_ms,disconnection_reason:call.disconnection_reason,within_bounds:attempt.cost_usd<=0.50&&attempt.duration_ms<=90000};}
export const createCaptureSession=createSession;
export async function exportTranscript(role){const attempt=load().attempts.find(attempt=>attempt.role===role);if(!attempt?.call_id)throw Error('Unknown recorded attempt');const call=await api('/v2/get-call/'+attempt.call_id);const transcript=typeof call.transcript==='string'?call.transcript:'';const turns=Array.isArray(call.transcript_object)?call.transcript_object:[];if(transcript||turns.length){writeFileSync(resolve(privateDir,role+'-transcript-private.json'),JSON.stringify({role,call_id:attempt.call_id,transcript,turns},null,2),{mode:0o600});}return {role,transcript_present:!!transcript,turns_present:turns.length>0,turn_count:turns.length,recording_present:typeof call.recording_url==='string',private_file_written:!!transcript||turns.length};}
