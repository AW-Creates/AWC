'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {createReviewServer,reviewInventory,render,parseRange}=require('./review-server.cjs');
test('fixed private assets support native media range requests and reject arbitrary paths',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'awc-draft-server-')),roles=['concierge','sales','scheduling','support','billing','implementation','retention'];
 fs.mkdirSync(path.join(root,'docs/crew/voice-v2'),{recursive:true});fs.writeFileSync(path.join(root,'docs/crew/voice-v2/RECORDING-MANIFEST.json'),JSON.stringify({roles:roles.map(role=>({role,name:role+' approved name'}))}));
 const dir=path.join(root,'voice-samples/production-v2/reviews/scheduling-draft');fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'REVIEW-DRAFT.json'),JSON.stringify({role:'scheduling',take:'original',review_status:'unreviewed',call_id:'call_private_do_not_expose'}));fs.writeFileSync(path.join(dir,'preview.mp4'),'0123456789');fs.writeFileSync(path.join(dir,'preview.vtt'),'WEBVTT\n');
 const server=createReviewServer({root,port:0});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
  const index=await fetch(base+'/'),html=await index.text();assert.equal(index.headers.get('x-robots-tag'),'noindex, nofollow, noarchive');assert.match(html,/1 of 7 drafts/);assert.equal(html.includes('call_private'),false);assert.equal(html.includes(root),false);assert.equal(html.includes('autoplay'),false);assert.match(html,/track kind="captions"[^>]+ default/);
  const range=await fetch(base+'/review/scheduling/preview.mp4',{headers:{Range:'bytes=2-5'}});assert.equal(range.status,206);assert.equal(await range.text(),'2345');
  const suffix=await fetch(base+'/review/scheduling/preview.mp4',{headers:{Range:'bytes=-3'}});assert.equal(await suffix.text(),'789');
  const head=await fetch(base+'/review/scheduling/preview.mp4',{method:'HEAD'});assert.equal(head.headers.get('content-length'),'10');assert.equal(await head.text(),'');
  for(const url of ['/review/concierge/preview.mp4','/voice-samples/production-v2/PAID-ATTEMPTS.json','/review/scheduling/REVIEW-DRAFT.json','/review/scheduling/preview.mp4?private=1'])assert.equal((await fetch(base+url)).status,404);
  assert.equal((await fetch(base+'/review/scheduling/preview.mp4',{headers:{Range:'bytes=99-'}})).status,416);
  const denied=await new Promise(resolve=>http.get(base+'/',{headers:{Host:'example.com'}},response=>{response.resume();resolve(response.statusCode);}));assert.equal(denied,403);
  assert.match(await(await fetch(base+'/robots.txt')).text(),/Disallow: \//);
 }finally{await new Promise(resolve=>server.close(resolve));assert.equal(path.dirname(root),path.resolve(os.tmpdir()));assert.ok(path.basename(root).startsWith('awc-draft-server-'));fs.rmSync(root,{recursive:true,force:true});}
});
test('range grammar rejects multiple and malformed ranges',()=>{assert.equal(parseRange('bytes=1-2,4-5',10),null);assert.equal(parseRange('bytes=-0',10),null);assert.deepEqual(parseRange('bytes=8-',10),{start:8,end:9,partial:true});});
test('selected incomplete retake shows replacement status and never exposes stale playback',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'awc-draft-server-')),roles=['concierge','sales','scheduling','support','billing','implementation','retention'];
 try{
  fs.mkdirSync(path.join(root,'docs/crew/voice-v2'),{recursive:true});fs.writeFileSync(path.join(root,'docs/crew/voice-v2/RECORDING-MANIFEST.json'),JSON.stringify({roles:roles.map(role=>({role,name:role+' approved name'}))}));
  const dir=path.join(root,'voice-samples/production-v2/reviews/concierge-retake-draft'),input=path.join(root,'voice-samples/production-v2/recordings/concierge-retake');
  fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(input,{recursive:true});
  fs.writeFileSync(path.join(dir,'REVIEW-DRAFT.json'),JSON.stringify({role:'concierge',take:'retake',review_status:'unreviewed'}));fs.writeFileSync(path.join(dir,'preview.mp4'),'failed source');fs.writeFileSync(path.join(dir,'preview.vtt'),'WEBVTT\n');
  fs.writeFileSync(path.join(input,'capture-evidence.json'),JSON.stringify({complete:false,reason:'question_agent_overlap',call_id:'call_private',completedQuestions:2}));
  const items=reviewInventory(root,{conciergeTake:'retake'}),autumn=items.find(item=>item.role==='concierge'),owen=items.find(item=>item.role==='sales'),html=render(items);
  assert.equal(autumn.status,'incomplete');assert.equal(autumn.available,false);assert.equal(owen.status,'pending');
  assert.match(html,/Recording incomplete; replacement requires a separately approved attempt/);assert.match(html,/Draft unavailable; preparation pending/);
  assert.equal(html.includes('/review/concierge/preview.mp4'),false);assert.equal(html.includes('question_agent_overlap'),false);assert.equal(html.includes('call_private'),false);assert.equal(html.includes(root),false);
  const corrected=reviewInventory(root).find(item=>item.role==='concierge');assert.equal(corrected.take,'corrected');assert.equal(corrected.status,'pending');assert.equal(corrected.available,false);assert.match(corrected.dir,/concierge-corrected-draft$/);
 }finally{assert.equal(path.dirname(root),path.resolve(os.tmpdir()));assert.ok(path.basename(root).startsWith('awc-draft-server-'));fs.rmSync(root,{recursive:true,force:true});}
});
