import { MODEL, SYSTEM, guideAnswer } from './facts.mjs';

const ORIGIN = 'https://aw-creates-ventures.thesml.chatgpt.site';
const encoder = new TextEncoder();
const DAY = 86400;
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const baseHeaders = { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin' };
function json(value, status=200) { return new Response(JSON.stringify(value), {status, headers:{...baseHeaders,'Content-Type':'application/json'}}); }
function page(body) { return new Response(body, {headers:{...baseHeaders,'Content-Type':'text/html; charset=utf-8'}}); }
class HttpError extends Error { constructor(status,message) {super(message);this.status=status;} }
export function monthKey(now=Date.now()) {
  const p = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit'}).formatToParts(now);
  return `${p.find(x=>x.type==='year').value}-${p.find(x=>x.type==='month').value}`;
}
async function mac(secret, input) {
  const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(input)))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
export async function tokenFor(secret, id, expires) { const p=`${id}.${expires}`; return `${p}.${await mac(secret,p)}`; }
async function sessionId(request,env) {
  const token=request.headers.get('X-AWC-Session') || '';
  const [id,expiry,sig,...rest]=token.split('.');
  if(rest.length || !/^[a-f0-9-]{36}$/.test(id||'') || !/^\d{10}$/.test(expiry||'') || !sig || Number(expiry)<Date.now()/1000) throw new HttpError(401,'Your conversation expired. Start a new conversation.');
  const expected=await mac(env.SESSION_SECRET,`${id}.${expiry}`);
  if(sig.length!==expected.length || [...sig].reduce((a,c,i)=>a|(c.charCodeAt(0)^expected.charCodeAt(i)),0)) throw new HttpError(401,'Invalid conversation. Start again.');
  return id;
}
async function counter(db,key,limit,expires) {
  return db.prepare('INSERT INTO counters(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count').bind(key,expires,limit).first();
}
async function rate(request,env,kind,limit,window) {
  const ip=request.headers.get('CF-Connecting-IP') || (env.LOCAL_PREVIEW==='true' ? '127.0.0.1' : null);
  if(!ip) throw new HttpError(503,'The service is temporarily unavailable. Please try again later.');
  const bucket=Math.floor(Date.now()/1000/window);
  const hash=await mac(env.SESSION_SECRET,`${bucket}:${ip}`);
  if(!await counter(env.DB,`${kind}:${hash}`,limit,(bucket+2)*window)) throw new HttpError(429,'Please wait before trying again.');
}
function sameOrigin(request,env) {
  const origin=request.headers.get('Origin');
  const local=env.LOCAL_PREVIEW==='true' && origin===new URL(request.url).origin && /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin);
  if((origin!==ORIGIN && !local) || !request.headers.get('Content-Type')?.startsWith('application/json')) throw new HttpError(403,'Request not allowed.');
}
async function body(request) {
  const reader=request.body?.getReader(); if(!reader) throw new HttpError(400,'Missing request.');
  let size=0,parts=[];
  while(true) {const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>10000){await reader.cancel();throw new HttpError(413,'Please shorten your message.');}parts.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}
  try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new HttpError(400,'Invalid request.');}
}
function clean(value,min,max) {if(typeof value!=='string' || value.trim().length<min || value.trim().length>max)throw new HttpError(400,'Please check the form fields.');return value.trim();}
async function cleanup(db) {
  const now=Math.floor(Date.now()/1000);
  await db.batch([db.prepare('DELETE FROM counters WHERE expires < ?').bind(now),db.prepare('DELETE FROM chat_sessions WHERE expires < ?').bind(now),db.prepare('DELETE FROM inquiries WHERE expires < ?').bind(now)]);
}
function owner(request,env) {
  return !!env.OWNER_EMAIL && request.headers.get('oai-authenticated-user-email')?.toLowerCase()===env.OWNER_EMAIL.toLowerCase() && !!request.headers.get('oai-authenticated-user-id');
}
async function notify(row,env) {
  if(!env.RESEND_API_KEY || !env.INQUIRY_TO || !env.MAIL_FROM) return {status:'not_configured',provider:null};
  try {
    const transcript=JSON.parse(row.transcript).map(t=>`${t.role}: ${t.content}`).join('\n\n');
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`awc-${row.id}`},body:JSON.stringify({from:env.MAIL_FROM,to:[env.INQUIRY_TO],reply_to:row.email,subject:`AWC website inquiry ${row.id.slice(0,8)}`,text:`Reference: ${row.id}\nName: ${row.name}\nEmail: ${row.email}\nInterest: ${row.interest}\n\n${row.message}\n\nVisitor-consented conversation:\n${transcript||'(not attached)'}\n\nConsultation requests require your confirmation. This is an inquiry, not a booking.`,tags:[{name:'inquiry_id',value:row.id}]}),signal:AbortSignal.timeout(10000)});
    if(!r.ok)return {status:'failed',provider:null};const d=await r.json();return {status:'accepted',provider:d.id};
  }catch{return {status:'failed',provider:null};}
}
function inboxHTML(rows) {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AWC inquiry inbox</title><style>body{font:16px system-ui;margin:32px auto;max-width:900px;padding:16px;background:#fff9f8;color:#32181c}article{border:1px solid #cfb8bc;padding:20px;margin:18px 0;border-radius:12px}pre{white-space:pre-wrap;overflow-wrap:anywhere}a{color:#9d2440}</style><h1>AWC inquiry inbox</h1><p>Owner only. Requests need human confirmation. Email status 'accepted' means the sending service accepted the notification, not verified inbox receipt.</p><p><a href="/">Website</a> · <a href="/signout-with-chatgpt?return_to=/" target="_top">Sign out</a></p>${rows.map(r=>`<article><h2>${escape(r.interest)}</h2><p>${escape(r.name)} · ${escape(r.email)}</p><p>Reference: ${escape(r.id)}<br>${escape(new Date(r.created*1000).toISOString())}<br>Email: ${escape(r.mail_status)}</p><pre>${escape(r.message)}</pre><details><summary>Attached conversation</summary><pre>${escape(JSON.parse(r.transcript).map(t=>`${t.role}: ${t.content}`).join('\n\n'))}</pre></details></article>`).join('') || '<p>No inquiries yet.</p>'}</html>`;
}
export function createWorker(html) {
 return { async fetch(request,env,ctx) {
  try {
   const path=new URL(request.url).pathname;
   if(path==='/' && ['GET','HEAD'].includes(request.method)) return request.method==='HEAD'?new Response(null,{headers:baseHeaders}):page(html);
   if(path==='/favicon.ico')return new Response(null,{status:204});
   if(!env.DB || !env.SESSION_SECRET) throw new HttpError(503,'The service is being configured. Please try again later.');
   if(path==='/inbox' && request.method==='GET') {
     if(!request.headers.get('oai-authenticated-user-id'))return new Response(null,{status:303,headers:{...baseHeaders,Location:'/signin-with-chatgpt?return_to=%2Finbox'}});
     if(!owner(request,env))throw new HttpError(403,'This inbox is available only to the AWC owner.');
     const rows=await env.DB.prepare('SELECT * FROM inquiries WHERE expires > ? ORDER BY created DESC LIMIT 100').bind(Math.floor(Date.now()/1000)).all();return page(inboxHTML(rows.results));
   }
   if(!['/api/session','/api/chat','/api/inquiry'].includes(path))return json({error:'Not found'},404);
   if(request.method!=='POST')return json({error:'Method not allowed'},405);
   sameOrigin(request,env);const input=await body(request);
   ctx?.waitUntil(cleanup(env.DB).catch(()=>{}));
   if(path==='/api/session') {
     await rate(request,env,'session',12,3600);const id=crypto.randomUUID(),expires=Math.floor(Date.now()/1000)+DAY;
     await env.DB.prepare('INSERT INTO chat_sessions(id,history,expires,busy_until) VALUES(?,?,?,0)').bind(id,'[]',expires).run();
     return json({token:await tokenFor(env.SESSION_SECRET,id,expires),aiAvailable:env.AI_ENABLED==='true' && !!env.OPENAI_API_KEY});
   }
   const id=await sessionId(request,env);
   if(path==='/api/chat') {
     const message=clean(input.message,1,800);await rate(request,env,'chat',6,60);
     const now=Math.floor(Date.now()/1000);
     const row=await env.DB.prepare('UPDATE chat_sessions SET busy_until=? WHERE id=? AND expires>? AND busy_until<? RETURNING history').bind(now+35,id,now,now).first();
     if(!row)throw new HttpError(409,'Please wait for the current response, or start a new conversation.');
     try {
       const history=JSON.parse(row.history);
       if(history.length>=20)throw new HttpError(429,'This conversation has reached its limit. You can send your request using the form.');
       if(env.AI_ENABLED!=='true') {
         const answer=guideAnswer(message);history.push({role:'user',content:message},{role:'assistant',content:answer});
         await env.DB.prepare('UPDATE chat_sessions SET history=? WHERE id=?').bind(JSON.stringify(history),id).run();return json({answer,mode:'guide'});
       }
       if(!env.OPENAI_API_KEY)throw new HttpError(503,'Ava is unavailable right now. You can still send an inquiry using the form.');
       if(/\b(price|pricing|cost|quote|budget|discount|refund|payment|insured|insurance)\b|how much|book.*(consultation|appointment)|confirm.*(consultation|appointment)/i.test(message)) {
         const answer='AWC confirms pricing, scope and consultation availability personally. I can help you prepare a request, but I cannot issue a quote or confirm an appointment. Use “Request a consultation” or the contact form and tell us what you want to improve, your project needs and any timing preferences.';
         history.push({role:'user',content:message},{role:'assistant',content:answer});
         await env.DB.prepare('UPDATE chat_sessions SET history=? WHERE id=?').bind(JSON.stringify(history),id).run();return json({answer});
       }
       const messages=[{role:'system',content:SYSTEM},...history.slice(-8),{role:'user',content:message}];
       if(encoder.encode(JSON.stringify(messages)).length>14000)throw new HttpError(413,'This conversation is too long. Please submit an inquiry.');
       // Reserve two cents BEFORE each model request. No refunds/retries, including failures.
       // At current pinned model prices, <=14k input UTF-8 bytes and 350 output tokens cost <0.02 USD.
       if(!await counter(env.DB,`budget:${monthKey()}`,500,now+40*DAY))throw new HttpError(429,'Ava has reached her monthly usage limit. Please use the inquiry form.');
       const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,messages,max_tokens:350,temperature:0.2,store:false}),signal:AbortSignal.timeout(25000)});
       if(!response.ok)throw new HttpError(503,'Ava is unavailable right now. Please use the inquiry form.');
       const data=await response.json();let answer=data.choices?.[0]?.message?.content;
       if(typeof answer!=='string'||!answer.trim())throw new HttpError(503,'Please use the inquiry form so AWC can help.');
       answer=answer.slice(0,2000);
       if(/(?:\$\s?\d|\d\s?(?:dollars|USD)|(?:booking|appointment|consultation)\s+(?:is\s+)?confirmed|I(?:'ve| have)\s+(?:sent|booked|emailed|scheduled|saved))/i.test(answer)) answer='Pricing, scheduling and commitments need AWC’s confirmation. Please use the inquiry form with your project details; consultation requests are not confirmed appointments.';
       history.push({role:'user',content:message},{role:'assistant',content:answer});
       await env.DB.prepare('UPDATE chat_sessions SET history=? WHERE id=?').bind(JSON.stringify(history),id).run();return json({answer});
     } finally {await env.DB.prepare('UPDATE chat_sessions SET busy_until=0 WHERE id=?').bind(id).run();}
   }
   await rate(request,env,'inquiry',3,3600);
   const name=clean(input.name,1,100),email=clean(input.email,3,254),interest=clean(input.interest,1,100),message=clean(input.message,5,3000);
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(email)||input.consent!==true||input.website)throw new HttpError(400,'Please check your email and consent to sending these details.');
   if(!/^[a-f0-9-]{36}$/.test(input.requestId||''))throw new HttpError(400,'Invalid request reference.');
   const existing=await env.DB.prepare('SELECT id,mail_status,session FROM inquiries WHERE id=?').bind(input.requestId).first();
   if(existing) {if(existing.session!==id)throw new HttpError(409,'Please use a new request reference.');return json({reference:existing.id,emailStatus:existing.mail_status,saved:true});}
   const chat=await env.DB.prepare('SELECT history FROM chat_sessions WHERE id=? AND expires>?').bind(id,Math.floor(Date.now()/1000)).first();
   if(!chat)throw new HttpError(401,'Your conversation expired. Please start again.');
   const now=Math.floor(Date.now()/1000);
   const row={id:input.requestId,session:id,name,email,interest,message,transcript:input.attachConversation===true?chat.history:'[]',created:now};
   const inserted=await env.DB.prepare('INSERT OR IGNORE INTO inquiries(id,session,name,email,interest,message,transcript,created,expires,mail_status,status) VALUES(?,?,?,?,?,?,?,?,?,\'pending\',\'new\') RETURNING id').bind(row.id,id,name,email,interest,message,row.transcript,now,now+90*DAY).first();
   if(!inserted)throw new HttpError(409,'Your request is already being processed. Please retry to retrieve its status.');
   const mail=await notify(row,env);
   await env.DB.prepare('UPDATE inquiries SET mail_status=?,provider_id=? WHERE id=?').bind(mail.status,mail.provider,row.id).run();
   return json({reference:row.id,saved:true,emailStatus:mail.status},201);
  }catch(error) {if(error instanceof HttpError)return json({error:error.message},error.status);console.error('AWC request failed',error?.name||'Error');return json({error:'The service is temporarily unavailable. Your form entries are still here; please try again.'},503);}
 }};
}
