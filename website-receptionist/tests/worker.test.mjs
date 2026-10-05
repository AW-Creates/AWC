import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createWorker,tokenFor,monthKey} from '../src/worker.mjs';
const origin='https://aw-creates-ventures.thesml.chatgpt.site';
function database(){
 const db=new DatabaseSync(':memory:');for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')))db.exec(readFileSync('drizzle/'+file,'utf8'));
 return {raw:db,prepare(sql){let args=[];return {bind(...a){args=a;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return db.prepare(sql).run(...args);}};},async batch(statements){return Promise.all(statements.map(s=>s.run()));}};
}
function setup(){const env={DB:database(),SESSION_SECRET:'test-secret-only',AI_ENABLED:'true',OPENAI_API_KEY:'test-only',OWNER_EMAIL:'owner@example.test'};return {env,worker:createWorker('<html>AWC</html>')};}
const ctx={waitUntil(p){p.catch(()=>{});}};
function request(path,data={},token=null,headers={}){return new Request(origin+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...(token?{'X-AWC-Session':token}:{}),...headers},body:JSON.stringify(data)});}
async function session(worker,env){return (await (await worker.fetch(request('/api/session'),env,ctx)).json()).token;}
test('month budget uses New York month at UTC boundary',()=>{assert.equal(monthKey(Date.parse('2026-11-01T02:00:00Z')),'2026-10');});
test('cross-origin, missing IP and forged sessions fail closed',async()=>{
 const {worker,env}=setup();assert.equal((await worker.fetch(request('/api/session',{},null,{Origin:'https://evil.test'}),env,ctx)).status,403);
 const req=request('/api/session');req.headers.delete('CF-Connecting-IP');assert.equal((await worker.fetch(req,env,ctx)).status,503);
 assert.equal((await worker.fetch(request('/api/chat',{message:'hello'},'bad'),env,ctx)).status,401);
});
test('budget gate blocks model fetch and inquiry fallback still works',async()=>{
 const {worker,env}=setup(),token=await session(worker,env);env.DB.raw.prepare('INSERT INTO counters VALUES(?,?,?)').run('budget:'+monthKey(),500,Math.floor(Date.now()/1000)+100000);
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw new Error('should not call');};
 try{assert.equal((await worker.fetch(request('/api/chat',{message:'What services?'},token),env,ctx)).status,429);assert.equal(calls,0);}finally{globalThis.fetch=original;}
 const response=await worker.fetch(request('/api/inquiry',{requestId:crypto.randomUUID(),name:'Test Visitor',email:'test@example.test',interest:'Request a consultation',message:'Synthetic test request only',consent:true},token),env,ctx);
 assert.equal(response.status,201);assert.equal((await response.json()).emailStatus,'not_configured');assert.equal(env.DB.raw.prepare('SELECT count(*) n FROM inquiries').get().n,1);
});
test('inquiry idempotency, consent, no other-session access and stored XSS stays escaped',async()=>{
 const {worker,env}=setup(),token=await session(worker,env),id=crypto.randomUUID();const payload={requestId:id,name:'<script>bad</script>',email:'test@example.test',interest:'Request a quote',message:'Synthetic website inquiry',consent:true};
 assert.equal((await worker.fetch(request('/api/inquiry',{...payload,consent:false},token),env,ctx)).status,400);
 assert.equal((await worker.fetch(request('/api/inquiry',payload,token),env,ctx)).status,201);
 assert.equal((await worker.fetch(request('/api/inquiry',payload,token),env,ctx)).status,200);
 assert.equal(env.DB.raw.prepare('SELECT count(*) n FROM inquiries').get().n,1);
 const token2=await session(worker,env);assert.equal((await worker.fetch(request('/api/inquiry',payload,token2,{'CF-Connecting-IP':'192.0.2.2'}),env,ctx)).status,409);
 const anonymous=await worker.fetch(new Request(origin+'/inbox'),env,ctx);assert.equal(anonymous.status,303);
 const forbidden=await worker.fetch(new Request(origin+'/inbox',{headers:{'oai-authenticated-user-id':'other','oai-authenticated-user-email':'other@example.test'}}),env,ctx);assert.equal(forbidden.status,403);
 const owner=await worker.fetch(new Request(origin+'/inbox',{headers:{'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.test'}}),env,ctx);assert.equal(owner.status,200);assert.ok((await owner.text()).includes('&lt;script&gt;'));
});
test('quotes and unsupported action claims are replaced; provider failure preserves cost reservation',async()=>{
 const {worker,env}=setup(),token=await session(worker,env),original=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:'I have booked your consultation for $500.'}}]}));
 try{const response=await worker.fetch(request('/api/chat',{message:'What do you do?'},token),env,ctx);assert.equal(response.status,200);assert.match((await response.json()).answer,/human|confirmation/);assert.equal(env.DB.raw.prepare('SELECT count FROM counters WHERE key=?').get('budget:'+monthKey()).count,1);
 globalThis.fetch=async()=>new Response('unavailable',{status:500});assert.equal((await worker.fetch(request('/api/chat',{message:'Tell me more'},token),env,ctx)).status,503);assert.equal(env.DB.raw.prepare('SELECT count FROM counters WHERE key=?').get('budget:'+monthKey()).count,2);
 }finally{globalThis.fetch=original;}
});
test('expired token rejected and oversized payload rejected before persistence',async()=>{
 const {worker,env}=setup(),token=await tokenFor(env.SESSION_SECRET,crypto.randomUUID(),Math.floor(Date.now()/1000)-1);
 assert.equal((await worker.fetch(request('/api/chat',{message:'hello'},token),env,ctx)).status,401);
 assert.equal((await worker.fetch(request('/api/session',{data:'x'.repeat(11000)}),env,ctx)).status,413);
});
test('no-spend mode answers service questions without any provider call',async()=>{
 const {worker,env}=setup();env.AI_ENABLED='false';delete env.OPENAI_API_KEY;const token=await session(worker,env),original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;throw new Error('must not call provider');};
 try{const response=await worker.fetch(request('/api/chat',{message:'What services does AWC offer?'},token),env,ctx);assert.equal(response.status,200);const d=await response.json();assert.equal(d.mode,'guide');assert.match(d.answer,/Brand.*Build.*Intelligence.*Growth/);assert.equal(calls,0);assert.equal(env.DB.raw.prepare('SELECT count(*) n FROM counters WHERE key LIKE \'budget:%\'').get().n,0);}finally{globalThis.fetch=original;}
});

test('estimate route requires origin, valid active session and bounded input, and rate limits',async()=>{
 const {worker,env}=setup();env.AI_ENABLED='false';const token=await session(worker,env),data={package:'launch',extraPages:2,copyPages:3};
 assert.equal((await worker.fetch(request('/api/estimate',data,null),env,ctx)).status,401);
 assert.equal((await worker.fetch(request('/api/estimate',data,token,{Origin:'https://evil.test'}),env,ctx)).status,403);
 assert.equal((await worker.fetch(request('/api/estimate',{...data,copyPages:8},token),env,ctx)).status,400);
 const response=await worker.fetch(request('/api/estimate',data,token),env,ctx);assert.equal(response.status,200);const estimate=await response.json();assert.deepEqual([estimate.min,estimate.max],[2100,3450]);
 for(let i=0;i<10;i++)assert.equal((await worker.fetch(request('/api/estimate',data,token),env,ctx)).status,200);
 assert.equal((await worker.fetch(request('/api/estimate',data,token),env,ctx)).status,429);
 assert.equal(env.DB.raw.prepare('SELECT count(*) n FROM inquiries').get().n,0);assert.equal(env.DB.raw.prepare("SELECT count(*) n FROM counters WHERE key LIKE 'budget:%'").get().n,0);
 const deleted=await session(worker,env);env.DB.raw.prepare('DELETE FROM chat_sessions WHERE id=?').run(deleted.split('.')[0]);assert.equal((await worker.fetch(request('/api/estimate',data,deleted,{'CF-Connecting-IP':'192.0.2.2'}),env,ctx)).status,401);
});
test('estimate attachment needs explicit choice and inquiry consent and is recomputed server-side',async()=>{
 const {worker,env}=setup(),token=await session(worker,env);const payload={name:'Draft Test',email:'test@example.test',interest:'Draft proposal',message:'Synthetic test inquiry only',consent:true,estimate:{package:'launch',extraPages:2,copyPages:3}};
 const first=crypto.randomUUID();assert.equal((await worker.fetch(request('/api/inquiry',{...payload,requestId:first},token),env,ctx)).status,201);assert.doesNotMatch(env.DB.raw.prepare('SELECT message FROM inquiries WHERE id=?').get(first).message,/planning draft/);
 assert.equal((await worker.fetch(request('/api/inquiry',{...payload,requestId:crypto.randomUUID(),attachEstimate:true,consent:false},token),env,ctx)).status,400);
 const second=crypto.randomUUID();assert.equal((await worker.fetch(request('/api/inquiry',{...payload,requestId:second,attachEstimate:true},token),env,ctx)).status,201);const row=env.DB.raw.prepare('SELECT message,transcript FROM inquiries WHERE id=?').get(second);assert.match(row.message,/\$2100–\$3450/);assert.match(row.message,/Preliminary/);assert.equal(row.transcript,'[]');
});

test('Autumn identity and Crew customization use approved shared facts',async()=>{
 const {worker,env}=setup();env.AI_ENABLED='false';const token=await session(worker,env);
 for(const [message,expected] of [['What is your name?',/Autumn Winters.*Customer Experience Specialist/],['What is Crew?',/customized.*name, voice, personality/],['Can you book an appointment?',/not a confirmed appointment/]]){
 const r=await worker.fetch(request('/api/chat',{message},token),env,ctx);assert.equal(r.status,200);assert.match((await r.json()).answer,expected);}
});
function enableVoice(env,cap=1){Object.assign(env,{CREW_VOICE_ENABLED:'true',CREW_VOICE_REVIEWED:'true',RETELL_API_KEY:'private-test-key',CREW_RETELL_AGENT_ID:'agent_test',CREW_RETELL_AGENT_VERSION:'v1',CREW_VOICE_ALLOWANCE_ID:'test-allowance',CREW_VOICE_SESSION_CAP:String(cap)});}
test('voice denies origin, forged sessions, consent and disabled config without provider calls',async()=>{
 const {worker,env}=setup(),token=await session(worker,env),original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;throw new Error('must not fetch');};
 try{
 assert.equal((await worker.fetch(request('/api/voice-session',{consent:true},token,{Origin:'https://evil.test'}),env,ctx)).status,403);
 assert.equal((await worker.fetch(request('/api/voice-session',{consent:true},'forged'),env,ctx)).status,401);
 assert.equal((await worker.fetch(request('/api/voice-session',{},token),env,ctx)).status,400);
 assert.equal((await worker.fetch(request('/api/voice-session',{consent:true},token),env,ctx)).status,503);
 enableVoice(env);env.CREW_VOICE_REVIEWED='false';assert.equal((await worker.fetch(request('/api/voice-session',{consent:true},token),env,ctx)).status,503);
 env.CREW_VOICE_REVIEWED='true';env.CREW_VOICE_SESSION_CAP='Infinity';assert.equal((await worker.fetch(request('/api/voice-session',{consent:true},token),env,ctx)).status,503);assert.equal(calls,0);
 }finally{globalThis.fetch=original;}
});
test('voice fixes agent/version server-side, returns only join data and reserves finite allowance',async()=>{
 const {worker,env}=setup();enableVoice(env);const token=await session(worker,env),original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,init)=>{calls++;assert.equal(url,'https://api.retellai.com/v3/create-web-call');assert.equal(init.headers.Authorization,'Bearer private-test-key');const b=JSON.parse(init.body);assert.equal(b.agent_id,'agent_test');assert.equal(b.agent_version,'v1');assert.equal(b.agent_override.agent.max_call_duration_ms,120000);assert.equal(b.agent_override.agent.data_storage_setting,'basic_attributes_only');return new Response(JSON.stringify({access_token:'short-lived-join-token',call_id:'call_test',transport:'gateway',ice_servers:[],expires_at:Date.now()+60000,private_field:'must-not-reach-browser'}));};
 try{
 const r=await worker.fetch(request('/api/voice-session',{consent:true,agent_id:'attacker'},token),env,ctx);assert.equal(r.status,200);const text=await r.text();assert.doesNotMatch(text,/private-test-key|private_field|must-not-reach-browser/);assert.equal(r.headers.get('Cache-Control'),'no-store');
 assert.equal((await worker.fetch(request('/api/voice-session',{consent:true},token),env,ctx)).status,429);
 const another=await session(worker,env);assert.equal((await worker.fetch(request('/api/voice-session',{consent:true},another),env,ctx)).status,429);assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
test('provider failure consumes voice allowance and hides upstream errors',async()=>{
 const {worker,env}=setup();enableVoice(env);const token=await session(worker,env),original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response('private-test-key provider diagnostic',{status:500});};
 try{const r=await worker.fetch(request('/api/voice-session',{consent:true},token),env,ctx);assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/private-test-key|diagnostic/);assert.equal((await worker.fetch(request('/api/voice-session',{consent:true},token),env,ctx)).status,429);assert.equal(calls,1);}finally{globalThis.fetch=original;}
});
