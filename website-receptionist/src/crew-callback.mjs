// Server-only, finite operator-approved callback boundary. Reservations are never refunded.
class CallbackError extends Error { constructor(status,message){super(message);this.status=status;} }
const unavailable=()=>new CallbackError(503,'Public Call Me is awaiting a reviewed business-number binding and operating allowance. Please request a consultation.');
function config(env){
 try {
  const c=JSON.parse(env.CREW_BUSINESS_CALLBACK_CONFIG||'null'),a=c?.allowance;
  if(!env.RETELL_API_KEY||c.enabled!==true||c.business_id!=='aw_creatives'||c.number_role!=='aw_business_number'||c.reviewed!==true||c.specialist_id!=='awc_concierge'||!/^agent_[a-zA-Z0-9]+$/.test(c.agentId)||!Number.isSafeInteger(c.agentVersion)||c.agentVersion<0||!/^\+[1-9]\d{7,14}$/.test(c.fromNumber))return null;
  if(!Array.isArray(c.destinations)||!c.destinations.length||c.destinations.length>10||c.destinations.some(d=>!/^\+[1-9]\d{7,14}$/.test(d.phone)||d.operatorVerified!==true||d.consented!==true))return null;
  if(!a||a.approved!==true||!/^[a-zA-Z0-9_-]{1,64}$/.test(a.id)||!Number.isInteger(a.cap)||a.cap<1||a.cap>4||typeof a.expiresAt!=='string'||!Number.isFinite(Date.parse(a.expiresAt))||Date.parse(a.expiresAt)<=Date.now()||!Number.isFinite(a.approvedBudgetUsd)||a.approvedBudgetUsd<=0||a.approvedBudgetUsd>100||!Number.isSafeInteger(Math.floor(a.approvedBudgetUsd*1000000))||!Number.isFinite(a.conservativeCostUsd)||a.conservativeCostUsd<=0||!Number.isSafeInteger(Math.ceil(a.conservativeCostUsd*1000000))||a.approvedBudgetUsd<a.conservativeCostUsd||!Number.isInteger(a.maxDurationSeconds)||a.maxDurationSeconds<1||a.maxDurationSeconds>120)return null;
  return {business_id:'aw_creatives',number_role:'aw_business_number',specialist_id:'awc_concierge',agentId:c.agentId,agentVersion:c.agentVersion,fromNumber:c.fromNumber,destinations:[...new Set(c.destinations.map(d=>d.phone))].sort(),allowance:{id:a.id,cap:a.cap,expiresAt:a.expiresAt,approvedBudgetUsd:a.approvedBudgetUsd,conservativeCostUsd:a.conservativeCostUsd,maxDurationSeconds:a.maxDurationSeconds}};
 }catch{return null;}
}
const dayKey=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const callbackAvailable=env=>!!config(env);
async function signature(c){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(c))))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function callbackStatus(env){
 const c=config(env);if(!c||!env.DB)return {available:false};
 try{const daily=await env.DB.prepare('SELECT count FROM counters WHERE key=?').bind('callback-day:'+dayKey()).first();if(daily?.count>=4)return {available:false};const row=await env.DB.prepare('SELECT signature,count,reserved_micros FROM crew_callback_allowances WHERE id=?').bind(c.allowance.id).first();
 if(row&&(row.signature!==await signature(c)||row.count>=c.allowance.cap||row.reserved_micros+Math.ceil(c.allowance.conservativeCostUsd*1000000)>Math.floor(c.allowance.approvedBudgetUsd*1000000)))return {available:false};
 return {available:true,maxDurationSeconds:c.allowance.maxDurationSeconds};}catch{return {available:false};}
}
export async function createPublicCallback({env,sessionId,input,request,rate,counter,providerFetch=fetch}){
 const c=config(env);if(!c)throw unavailable();
 if(!/^[a-f0-9-]{36}$/.test(sessionId||''))throw new CallbackError(401,'Start a new conversation.');
 if(!input||input.consent!==true||input.phoneConfirmed!==true||typeof input.shareContext!=='boolean'||typeof input.phone!=='string'||!c.destinations.includes(input.phone))throw new CallbackError(400,'Confirm an approved callback destination and consent before requesting a call.');
 if(['business_id','demo_id','agentId','agent_id','specialist_id','number_role','fromNumber'].some(k=>k in input))throw new CallbackError(400,'Callback routing is configured by AW Creatives.');
 const context=input.shareContext&&typeof input.context==='string'?input.context.trim().slice(0,1200):'';
 if(input.context!==undefined&&typeof input.context!=='string')throw new CallbackError(400,'Please check the callback context.');
 await rate(request,env,'callback',1,3600);
 const hash=await signature(c);
 await env.DB.prepare('INSERT INTO crew_callback_allowances(id,signature,count,reserved_micros) VALUES(?,?,0,0) ON CONFLICT(id) DO NOTHING').bind(c.allowance.id,hash).run();
 const persisted=await env.DB.prepare('SELECT signature FROM crew_callback_allowances WHERE id=?').bind(c.allowance.id).first();
 if(persisted?.signature!==hash)throw unavailable();
 if(!await counter(env.DB,'callback-session:'+sessionId,1,253402300799))throw new CallbackError(429,'This conversation already requested a callback. Please request a consultation.');
 const a=c.allowance;
 if(!await counter(env.DB,'callback-day:'+dayKey(),4,253402300799))throw new CallbackError(429,'Today’s callback allowance is exhausted. Please request a consultation.');
 const reservation=await env.DB.prepare('UPDATE crew_callback_allowances SET count=count+1,reserved_micros=reserved_micros+? WHERE id=? AND signature=? AND count<? AND reserved_micros+?<=? RETURNING count').bind(Math.ceil(a.conservativeCostUsd*1000000),a.id,hash,a.cap,Math.ceil(a.conservativeCostUsd*1000000),Math.floor(a.approvedBudgetUsd*1000000)).first();
 if(!reservation)throw new CallbackError(429,'Callback allowance is exhausted. Please request a consultation.');
 const requestId=crypto.randomUUID();
 console.info(JSON.stringify({event:'crew_callback_reserved',business_id:'aw_creatives',number_role:'aw_business_number',channel:'phone',cost_category:'conservative_allowance_reserved'}));
 const payload={from_number:c.fromNumber,to_number:input.phone,override_agent_id:c.agentId,override_agent_version:c.agentVersion,idempotency_key:requestId,agent_override:{agent:{max_call_duration_ms:a.maxDurationSeconds*1000,ring_duration_ms:30000,data_storage_setting:'basic_attributes_only',contact_memory_config:{enable_read:false,enable_update:false},pre_session_tools:[],post_session_tools:[]}},metadata:{business_id:'aw_creatives',number_role:'aw_business_number',specialist_id:'awc_concierge',channel:'phone'},retell_llm_dynamic_variables:{business_id:'aw_creatives',business:'AW Creatives',specialist_id:'awc_concierge',specialist:'Autumn Winters',role:'Customer Experience',demo_id:'',visitor_context:context||'No visitor context shared.'}};
 try {
  const response=await providerFetch('https://api.retellai.com/v2/create-phone-call',{method:'POST',headers:{Authorization:'Bearer '+env.RETELL_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('provider');const body=await response.text();if(body.length>32768)throw Error('size');const data=JSON.parse(body);if(typeof data.call_id!=='string'||!data.call_id||data.call_id.length>200)throw Error('shape');
 }catch {console.warn(JSON.stringify({event:'crew_callback_failed',business_id:'aw_creatives',reason:'provider_unavailable',cost_category:'reservation_consumed'}));throw new CallbackError(503,'The callback could not be confirmed. This request was not retried. Please request a consultation.');}
 return {status:'accepted',requestId};
}
