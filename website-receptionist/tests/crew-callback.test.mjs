import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {callbackAvailable,callbackStatus,createPublicCallback} from '../src/crew-callback.mjs';
globalThis.crypto??=webcrypto;
const make=()=>({enabled:true,business_id:'aw_creatives',number_role:'aw_business_number',specialist_id:'awc_concierge',reviewed:true,agentId:'agent_test123',agentVersion:1,fromNumber:'+12025550101',destinations:[{phone:'+12025550102',operatorVerified:true,consented:true}],allowance:{id:'approved_test',approved:true,cap:2,expiresAt:new Date(Date.now()+3600000).toISOString(),approvedBudgetUsd:1,conservativeCostUsd:.5,maxDurationSeconds:120}});
function harness(c=make()){
 let row=null,calls=0,payload;const sessions=new Set();
 const env={RETELL_API_KEY:'fake-secret',CREW_BUSINESS_CALLBACK_CONFIG:JSON.stringify(c),DB:{prepare(sql){return {bind(...args){return {async run(){if(!row)row={signature:args[1],count:0,cost:0};},async first(){if(sql.startsWith('SELECT'))return row?{...row,reserved_micros:row.cost}:null;if(row.signature!==args[2]||row.count>=args[3]||row.cost+args[0]>args[5])return null;row.count++;row.cost+=args[0];return {count:row.count};}};}}}}};
 const invoke=(overrides={})=>createPublicCallback({env,sessionId:'00000000-0000-0000-0000-000000000001',input:{phone:'+12025550102',consent:true,phoneConfirmed:true,shareContext:false},request:{},rate:async()=>{},counter:async(db,key)=>{if(key.startsWith('callback-day:'))return {count:1};if(sessions.has(key))return null;sessions.add(key);return {count:1};},providerFetch:async(url,options)=>{calls++;payload=JSON.parse(options.body);return new Response(JSON.stringify({call_id:'fake_call'}));},...overrides});
 return {env,invoke,get calls(){return calls;},get payload(){return payload;},get row(){return row;}};
}
test('public callback disabled until reviewed binding and finite approval',()=>{
 assert.equal(callbackAvailable({}),false);for(const mutate of [c=>c.business_id='cedar_lane',c=>c.number_role='aw_demo_number',c=>c.allowance.approved=false,c=>c.allowance.cap=11,c=>c.destinations[0].operatorVerified=false,c=>c.allowance.expiresAt='2000-01-01']){const c=make();mutate(c);assert.equal(callbackAvailable(harness(c).env),false);}
});
test('fixed AW callback routes with consent and no contact/context persistence',async()=>{
 const h=harness();assert.equal((await h.invoke()).status,'accepted');assert.equal(h.calls,1);assert.equal(h.payload.metadata.business_id,'aw_creatives');assert.equal(h.payload.override_agent_id,'agent_test123');assert.equal(h.payload.retell_llm_dynamic_variables.demo_id,'');assert.equal(h.row.cost,500000);await assert.rejects(h.invoke(),{status:429});assert.equal(h.calls,1);
});
test('visitor routing, unapproved destinations and missing consent rejected before provider',async()=>{
 for(const input of [{phone:'+12025550103',consent:true,phoneConfirmed:true,shareContext:false},{phone:'+12025550102',phoneConfirmed:false,shareContext:false},{phone:'+12025550102',consent:true,phoneConfirmed:true,shareContext:false,demo_id:'cedar_lane'}]){const h=harness();await assert.rejects(h.invoke({input}),{status:400});assert.equal(h.calls,0);}
});
test('immutable allowance identity rejects changed approved configuration',async()=>{
 const h=harness();await h.invoke();const c=JSON.parse(h.env.CREW_BUSINESS_CALLBACK_CONFIG);c.allowance.cap=3;h.env.CREW_BUSINESS_CALLBACK_CONFIG=JSON.stringify(c);await assert.rejects(h.invoke({sessionId:'00000000-0000-0000-0000-000000000002'}),{status:503});assert.equal(h.calls,1);
});
test('atomic budget reservation and cap consume failed attempts without retry',async()=>{
 const h=harness();await assert.rejects(h.invoke({providerFetch:async()=>{throw Error('private provider response');}}),{status:503});assert.equal(h.row.count,1);await h.invoke({sessionId:'00000000-0000-0000-0000-000000000002'});await assert.rejects(h.invoke({sessionId:'00000000-0000-0000-0000-000000000003'}),{status:429});assert.equal(h.row.count,2);assert.equal(h.calls,1);
});
test('concurrent same-session requests create one provider attempt',async()=>{
 const h=harness();const r=await Promise.allSettled([h.invoke(),h.invoke()]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1);assert.equal(h.calls,1);
});


test('readiness hides spent allowance and explicit callback consent required',async()=>{
 const h=harness();assert.equal((await callbackStatus(h.env)).available,true);
 await assert.rejects(h.invoke({input:{phone:'+12025550102',phoneConfirmed:true,shareContext:false}}),{status:400});
 await h.invoke();await h.invoke({sessionId:'00000000-0000-0000-0000-000000000002'});assert.equal((await callbackStatus(h.env)).available,false);
});
