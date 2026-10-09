// Run against an isolated local database. No production provider, microphone or outreach.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/A-Problem/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs/qa/demo-factory');
async function run(){
 const started=Date.now(),dir=fs.mkdtempSync(path.join(os.tmpdir(),'awc-factory-qa-'));fs.mkdirSync(out,{recursive:true});
 const report={startedAt:new Date().toISOString(),checks:[],errors:[],screenshots:[]};let app,browser;
 try{
  const {createOwnerServer}=await import(pathToFileURL(path.join(root,'owner-ops/server.mjs')).href);
  const generationStarted=Date.now();require('node:child_process').execFileSync(process.execPath,[path.join(root,'owner-ops/scripts/generate-demo.mjs'),'--proofs','--data-dir',dir],{cwd:root,encoding:'utf8'});
  report.generationSeconds=+((Date.now()-generationStarted)/1000).toFixed(2);
  report.factorySummary=JSON.parse(fs.readFileSync(path.join(dir,'factory-summary.json'),'utf8'));assert(report.factorySummary.demos.every(d=>d.preflight.passed),'All generator preflights pass');
  app=createOwnerServer({dataDir:dir,seed:false,channelConfig:null,providerFetch:()=>{throw Error('Provider request forbidden in proof QA')}});
  await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port;
  assert.match(await(await fetch(base+'/robots.txt')).text(),/Disallow: \/\s/);
  const proofs=(await(await fetch(base+'/api/prospects')).json()).prospects;assert.equal(proofs.length,3,'Three generated proof demos');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Users/A-Problem/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe'});
  const seenNamespaces=new Set(),identities=[];
  for(const proof of proofs){
   const id=proof.id||proof.prospect?.id;assert(id,'Generator returns prospect id');
   const prospect=await(await fetch(base+'/api/prospects/'+id)).json();const name=prospect.name;
   const direction=prospect.themeId;
   const namespace=prospect.demoConfig.analytics_namespace;
   identities.push({id,name,namespace});assert(namespace,'Analytics namespace present');assert(!seenNamespaces.has(namespace),'Namespace unique');seenNamespaces.add(namespace);
   for(const [label,width,height,motion] of [['desktop',1440,1000,'no-preference'],['mobile',390,844,'no-preference'],['mobile-small',360,800,'no-preference'],['reduced-motion',1440,1000,'reduce']]){
    const tick=Date.now(),context=await browser.newContext({viewport:{width,height},reducedMotion:motion}),page=await context.newPage();const external=[],errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url())});
    await page.addInitScript(()=>{window.__audioCalls=[];HTMLMediaElement.prototype.play=function(){window.__audioCalls.push('play');return Promise.resolve()};if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=()=>{window.__audioCalls.push('microphone');throw Error('Unexpected microphone')};});
    const response=await page.goto(base+'/demo/'+id);assert.equal(response.status(),200);assert.match(response.headers()['x-robots-tag'],/noindex/);assert.match(response.headers()['content-security-policy'],/connect-src 'self'/);assert.match(await page.locator('meta[name=robots]').getAttribute('content'),/noindex/);
    await page.waitForLoadState('networkidle');await page.locator('main img').evaluateAll(async es=>{for(const e of es)e.loading='eager';await Promise.all(es.map(e=>e.decode()));});assert.equal(await page.locator('body').getAttribute('data-business'),name);assert.match(await page.locator('body').innerText(),/concept|demo/i);assert.equal(await page.locator('body').getAttribute('data-estate-direction'),direction,'Theme selector bound to config');assert.equal(await page.locator('.direction-'+direction).count(),1,'Correct structural theme wrapper');
    const snap=async kind=>{const relative='docs/qa/demo-factory/'+id+'-'+label+'-'+kind+'.png';await page.screenshot({animations:'disabled',path:path.join(root,relative),fullPage:kind==='full'});report.screenshots.push(relative);};
    await snap('hero-closed');await snap('full');await page.evaluate(()=>scrollTo(0,Math.min(document.body.scrollHeight/2,1800)));await snap('mid');if(direction==='personal-brand'){await page.locator('.ed-personal-profile').scrollIntoViewIfNeeded();await snap('team-story');}await page.evaluate(()=>scrollTo(0,0));
    const imageResults=await page.locator('main img').evaluateAll(es=>es.map(e=>({src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0})));assert(imageResults.every(e=>e.loaded),'All concept images load');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No page overflow');
    const cta=page.locator('main [data-open-crew]').first();assert(await cta.count(),'Main CTA opens Crew');await cta.click();assert.equal(await page.locator('#crew-panel').isVisible(),true);assert.match(await page.locator('#crew-panel').innerText(),new RegExp(prospect.crew.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));await page.locator('#crew-close').click();await page.locator('#crew-launcher').click();
    assert.deepEqual(await page.locator('[data-crew-channel]').evaluateAll(es=>es.map(e=>e.dataset.crewChannel)),['talk','call','chat']);await snap('crew-open');const colors=await page.locator('.voice-primary').evaluate(e=>({bg:getComputedStyle(e).backgroundColor,body:getComputedStyle(e.querySelector('span')).color,title:getComputedStyle(e.querySelector('strong em')||e.querySelector('strong')).color}));assert.notEqual(colors.bg,colors.body,'Voice description has contrasting color');assert.notEqual(colors.bg,colors.title,'Talk Here title has contrasting color');
    assert.equal(await page.locator('#crew-panel').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'No dialog overflow');
    for(const channel of ['talk','call']){assert.equal(await page.locator('[data-crew-channel='+channel+']').getAttribute('aria-disabled'),'true');await page.locator('[data-crew-channel='+channel+']').click({force:true});assert.match(await page.locator('#voice-status').innerText(),/not connected|No phone call|unavailable|disabled/i)}
    await page.locator('[data-crew-channel=chat]').click();await page.locator('#question').fill('What services do you offer?');await page.locator('#demo-chat button').click();await page.locator('#chat-status').getByText('Prepared answer',{exact:false}).waitFor();assert.match(await page.locator('#messages').innerText(),new RegExp(prospect.crew.name));
    await page.locator('#question').fill('Please book a visit');await page.locator('#demo-chat button').click();await page.locator('#chat-status').getByText('Local draft saved',{exact:false}).waitFor();
    const state=await page.evaluate(()=>({events:window.crewEngagement.events,audio:window.__audioCalls,context:window.crewConversationContext()}));assert.deepEqual(state.audio,[]);assert.equal(state.context.business,name);assert(state.events.length);assert(state.events.every(e=>e.prospectId===id&&e.demo_id===id));assert(state.events.every(e=>e.analytics_namespace===namespace),'Every engagement event uses configured namespace');assert(!JSON.stringify(state.events).includes('Please book'));
    if(motion==='reduce')assert.equal(await page.locator('.ed-editorial-copy,.ed-architecture-copy,.ed-personal-copy').first().evaluate(e=>getComputedStyle(e).animationName),'none','Reduced motion disables entrance');assert.deepEqual(external,[],'No external requests');assert.deepEqual(errors,[],'No page errors');
    report.checks.push({id,name,direction,label,width,passed:true,seconds:+((Date.now()-tick)/1000).toFixed(2),images:imageResults.length,events:state.events.map(e=>e.name)});await context.close();
   }
  }
  // A fresh page must never acquire another demo's names, conversation or namespace.
  for(const identity of identities){const page=await browser.newPage();await page.goto(base+'/demo/'+identity.id);const body=await page.locator('body').innerText();for(const other of identities.filter(x=>x.id!==identity.id))assert(!body.includes(other.name),'Cross-demo business isolation');await page.close();}
  const revoked=app.store.get(identities[0].id);revoked.status='revoked';revoked.demoConfig.status='revoked';app.store.save(revoked);assert.equal((await fetch(base+'/demo/'+revoked.id)).status,410,'Revoked route blocked');
  const expired=app.store.get(identities[1].id);expired.expiresAt='2000-01-01T00:00:00.000Z';expired.demoConfig.expires_at=expired.expiresAt;app.store.save(expired);assert.equal((await fetch(base+'/demo/'+expired.id)).status,410,'Expired route blocked');
  report.guardrails={revokedRouteBlocked:true,expiredRouteBlocked:true};
  // Enforce request and session limits through the HTTP boundary.
  const quota=app.store.get(identities[2].id);quota.demoConfig.guardrails.max_chat_requests=1;quota.demoConfig.guardrails.max_sessions=6;
  const {revisionHash}=await import(pathToFileURL(path.join(root,'owner-ops/model.mjs')).href);quota.artifact.inputHash=revisionHash(quota);app.store.save(quota);
  const response=await fetch(base+'/demo/'+quota.id);assert.equal(response.status,200);const cookie=response.headers.get('set-cookie').split(';')[0];
  const send=()=>fetch(base+'/api/prospects/'+quota.id+'/chat',{method:'POST',headers:{Origin:base,'Content-Type':'application/json','X-Owner-Action':'local-workbench',Cookie:cookie},body:JSON.stringify({message:'What services do you offer?'})});assert.equal((await send()).status,200);assert.equal((await send()).status,429);assert.equal((await fetch(base+'/demo/'+quota.id)).status,429);
  expired.expiresAt=report.factorySummary.demos[1].expiry;expired.demoConfig.expires_at=expired.expiresAt;expired.artifact.inputHash=revisionHash(expired);app.store.save(expired);
  const other=await fetch(base+'/api/prospects/'+identities[1].id+'/chat',{method:'POST',headers:{Origin:base,'Content-Type':'application/json','X-Owner-Action':'local-workbench',Cookie:cookie},body:JSON.stringify({message:'What services do you offer?'})});assert.equal(other.status,401);
  report.guardrails.finiteChatRequests=true;report.guardrails.finiteSessions=true;report.guardrails.crossDemoCookieRejected=true;
  report.passed=true;
 }catch(error){report.passed=false;report.errors.push(error.stack||error.message);throw error;}
 finally{report.elapsedSeconds=+((Date.now()-started)/1000).toFixed(2);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));if(browser)await browser.close();if(app)await app.close();assert.equal(path.dirname(path.resolve(dir)),path.resolve(os.tmpdir()));assert(path.basename(dir).startsWith('awc-factory-qa-'));fs.rmSync(dir,{recursive:true});console.log(JSON.stringify({passed:report.passed,cases:report.checks.length,elapsedSeconds:report.elapsedSeconds,generationSeconds:report.generationSeconds,guardrails:report.guardrails,errors:report.errors}));}
}
run().catch(e=>{console.error(e);process.exitCode=1});
