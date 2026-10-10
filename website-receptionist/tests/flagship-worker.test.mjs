import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createWorker} from '../src/worker.mjs';
const origin='https://aw-creates-ventures.thesml.chatgpt.site';
function setup(){const raw=new DatabaseSync(':memory:');raw.exec('CREATE TABLE counters(key TEXT PRIMARY KEY,count INTEGER,expires INTEGER); CREATE TABLE chat_sessions(id TEXT PRIMARY KEY,history TEXT,expires INTEGER,busy_until INTEGER); CREATE TABLE inquiries(id TEXT PRIMARY KEY,expires INTEGER);');const DB={raw,prepare(sql){let args=[];return {bind(...values){args=values;return this;},async first(){return raw.prepare(sql).get(...args)||null;},async run(){return raw.prepare(sql).run(...args);}};},async batch(items){return Promise.all(items.map(item=>item.run()));}};return {worker:createWorker(''),env:{DB,SESSION_SECRET:'test-secret',AI_ENABLED:'false'}};}
function req(path,data={},token,ip='192.0.2.1'){return new Request(origin+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':ip,...(token?{'X-AWC-Session':token}:{})},body:JSON.stringify(data)});}
test('six direct role selections bind server identity and deny implicit Autumn voice',async()=>{
 const {worker,env}=setup();const token=(await (await worker.fetch(req('/api/session'),env)).json()).token;
 for(const [index,role] of ['concierge','sales','scheduling','support','billing','implementation'].entries()){
  const response=await worker.fetch(req('/api/crew-select',{role,shareContext:false,business_id:'cedar',specialist_id:'ellis'},token,'192.0.2.'+(index+10)),env);assert.equal(response.status,200);const d=await response.json();assert.equal(d.role,role);assert.equal(d.events[2].business_id,'aw_creatives');assert.equal(d.contextShared,false);
  if(role!=='concierge'){assert.equal(d.voiceAvailable,false);assert.equal(d.callAvailable,false);assert.equal((await worker.fetch(req('/api/voice-session',{consent:true},token),env)).status,403);assert.equal((await worker.fetch(req('/api/callback',{},token),env)).status,403);}
 }
 assert.equal((await worker.fetch(req('/api/crew-select',{role:'foreign',shareContext:false},token,'192.0.2.80'),env)).status,400);
});
test('offered target must match and fresh-context handoff clears original transcript',async()=>{
 const {worker,env}=setup();const token=(await (await worker.fetch(req('/api/session'),env)).json()).token;
 const offered=await worker.fetch(req('/api/chat',{message:'Explain multiple specialists for my private project'},token),env);assert.equal((await offered.json()).handoffOffer.target_role,'sales');
 assert.equal((await worker.fetch(req('/api/crew-handoff',{accept:true,targetRole:'billing',shareContext:false},token),env)).status,403);
 const result=await worker.fetch(req('/api/crew-handoff',{accept:true,targetRole:'sales',shareContext:false},token),env);assert.equal(result.status,200);assert.doesNotMatch((await result.json()).answer,/private project/);
 const stored=env.DB.raw.prepare('SELECT history FROM chat_sessions WHERE id=?').get(token.split('.')[0]).history;assert.doesNotMatch(stored,/private project/);
 const response=await worker.fetch(req('/api/chat',{message:'Introduce yourself'},token),env);assert.equal((await response.json()).role,'sales');
 assert.equal((await worker.fetch(req('/api/crew-handoff',{accept:true,targetRole:'support',shareContext:true},token),env)).status,403);
});
