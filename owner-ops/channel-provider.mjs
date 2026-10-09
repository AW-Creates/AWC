// Provider boundary: one bounded attempt, no retries, no raw response/credential logs.
import {ValidationError} from './model.mjs';
const messages={network:'The voice service could not be reached before the connection deadline.',http:'The voice service rejected this connection request.',response:'The voice service returned an unreadable connection response.',join:'The voice service returned unsupported connection details.',expiry:'The voice service returned an expired or invalid connection token.',ice:'The voice service returned invalid audio connection settings.'};
export const MAX_DURATION_SECONDS=120;
export function providerAdapter(providerFetch,apiKey){return async({channel,binding,snapshot,context,callback,requestId})=>{
 const unavailable=(reason,outcome='unknown',status=null)=>{
  console.warn(JSON.stringify({event:'crew_connection_failure',channel,reason,httpStatus:status}));
  const error=new ValidationError('The voice connection could not be created. '+messages[reason]+' This test was not retried. Please use Chat.',503);
  error.outcome=outcome;error.failureReason=reason;return error;
 };
 const agent={max_call_duration_ms:120000,data_storage_setting:'basic_attributes_only',contact_memory_config:{enable_read:false,enable_update:false},pre_session_tools:[],post_session_tools:[]};
 if(channel==='call')agent.ring_duration_ms=30000;
 const variables={business_id:snapshot.business_id,demo_id:snapshot.demo_id,specialist_id:snapshot.specialist_id,number_role:snapshot.number_role,business:snapshot.business,specialist:snapshot.specialist,role:snapshot.role,services:snapshot.services.join('; '),visitor_context:context?JSON.stringify(context):'No visitor context shared.'};
 const payload=channel==='talk'?{agent_id:binding.agentId,agent_version:binding.agentVersion,agent_override:{agent},retell_llm_dynamic_variables:variables}:{from_number:callback.fromNumber,to_number:callback.phone,override_agent_id:binding.agentId,override_agent_version:binding.agentVersion,agent_override:{agent},retell_llm_dynamic_variables:variables,idempotency_key:requestId};
 let response;
 try{response=await providerFetch('https://api.retellai.com/'+(channel==='talk'?'v3/create-web-call':'v2/create-phone-call'),{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});}
 catch{throw unavailable('network');}
 if(!response.ok)throw unavailable('http','failed',response.status);
 let data;
 try{const text=await response.text();if(text.length>32768)throw Error('oversize');data=JSON.parse(text);if(!data||typeof data!=='object')throw Error('shape');}
 catch{throw unavailable('response');}
 if(channel==='call'){
  if(typeof data.call_id!=='string'||!data.call_id.length||data.call_id.length>200)throw unavailable('join');
  return {status:'accepted',requestId};
 }
 const bounded=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max;
 if(!bounded(data.access_token,8192)||!bounded(data.call_id,200)||data.transport!=='gateway'||!Array.isArray(data.ice_servers)||data.ice_servers.length>8)throw unavailable('join');
 // Provider contract: epoch milliseconds, without a ten-minute token TTL promise.
 // The independent owner session remains <=10 minutes; token joins one capped call.
 if(!Number.isSafeInteger(data.expires_at)||data.expires_at<=Date.now()||data.expires_at>8640000000000000)throw unavailable('expiry');
 const ice=data.ice_servers.map(server=>{
  if(!server||typeof server!=='object')throw unavailable('ice');
  const urls=typeof server.urls==='string'?[server.urls]:server.urls;
  if(!Array.isArray(urls)||urls.length>4||!urls.length||urls.some(url=>!bounded(url,500)||!/^turns?:|^stuns?:/.test(url)))throw unavailable('ice');
  const result={urls};
  for(const key of ['username','credential'])if(server[key]!==undefined){if(typeof server[key]!=='string'||server[key].length>512)throw unavailable('ice');result[key]=server[key];}
  return result;
 });
 return {access_token:data.access_token,call_id:data.call_id,transport:'gateway',ice_servers:ice,expires_at:data.expires_at};
};}
