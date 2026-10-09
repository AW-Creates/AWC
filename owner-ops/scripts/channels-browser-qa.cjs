const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/A-Problem/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright');
(async()=>{
  const root=process.cwd(),out=path.join(root,'docs/qa/prospect-channels'); fs.mkdirSync(out,{recursive:true});
  const {createOwnerServer}=await import(pathToFileURL(path.join(root,'owner-ops/server.mjs')));
  const {revisionHash}=await import(pathToFileURL(path.join(root,'owner-ops/model.mjs')));
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awc-channels-browser-'));
  let app=createOwnerServer({dataDir:dir});
  await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
  let base='http://127.0.0.1:'+app.server.address().port;
  const prospects=app.store.list();
  for(const p of prospects){const response=await fetch(base+'/api/prospects/'+p.id+'/generate',{method:'POST',headers:{Origin:base,'Content-Type':'application/json','X-Owner-Action':'local-workbench'},body:JSON.stringify({expectedRevision:p.inputRevision})});assert.equal(response.status,200);}
  const realty=app.store.get(prospects.find(p=>p.niche==='real-estate').id);
  const browser=await chromium.launch({headless:true,executablePath:'C:/Users/A-Problem/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe'});
  const priorKey=process.env.RETELL_API_KEY;
  const report={mode:'simulated-provider-and-sdk',checks:[],errors:[],externalRequests:[],providerAttempts:0};
  const calls=[];
  const fakeProvider=async(url,request)=>{
    calls.push({channel:url.endsWith('create-web-call')?'talk':'call',body:JSON.parse(request.body)});
    return new Response(JSON.stringify(url.endsWith('create-web-call')?{access_token:'synthetic-join-token',call_id:'synthetic-call',transport:'gateway',ice_servers:[],expires_at:Date.now()+60000}:{call_id:'synthetic-phone-call'}));
  };
  const fakeSDK=`window.retellClientJsSdk={RetellWebClient:class {constructor(){this.handlers={};}on(name,fn){this.handlers[name]=fn;}async startCall(){window.__joined++;this.handlers.call_started?.();}stopCall(){window.__stopped++;this.handlers.call_ended?.();}}};`;
  async function prepare(width,enabled){
    const ctx=await browser.newContext({viewport:{width,height:width===1440?1000:844},reducedMotion:'reduce'});
    const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));
    await page.route('**/*',route=>{const url=route.request().url();if(!url.startsWith(base)){report.externalRequests.push(url);return route.abort();}if(url.endsWith('/crew-assets/retell.js'))return route.fulfill({contentType:'text/javascript',body:fakeSDK});return route.continue();});
    await page.addInitScript(()=>{window.__mic=0;window.__tracksStopped=0;window.__joined=0;window.__stopped=0;window.__audio=0;HTMLMediaElement.prototype.play=()=>{window.__audio++;return Promise.resolve();};navigator.mediaDevices.getUserMedia=async()=>{window.__mic++;return {getTracks:()=>[{stop:()=>window.__tracksStopped++}]};};});
    await page.goto(base+'/demo/'+realty.id);
    await page.waitForFunction(expected=>window.crewVoice&&window.crewVoice.availability.talkAvailable===expected,enabled);
    if(enabled){
      assert(!(await page.locator('#messages .message span').first().textContent()).includes('When connected'));
      assert((await page.locator('#messages .message span').first().textContent()).includes('Call me is also available'));
      assert(!(await page.locator('#voice-context-availability').textContent()).includes('neither is enabled'));
    } else assert((await page.locator('#crew-launcher small').textContent()).startsWith(realty.crew.role));
    assert.equal(await page.evaluate(()=>window.__mic),0);
    await page.locator('#crew-invitation').waitFor({state:'visible'});
    const emphasis=page.locator('.invitation-voice-copy:visible strong em').first();
    assert.equal(await emphasis.textContent(),'Talk Here');
    assert.equal(await emphasis.evaluate(e=>getComputedStyle(e).fontStyle),'italic');
    assert(Number(await emphasis.evaluate(e=>getComputedStyle(e).fontWeight))>=600);
    assert.equal(await page.evaluate(()=>innerWidth===document.documentElement.scrollWidth),true);
    return {ctx,page};
  }
  try{
    const disabled=await prepare(390,false);
    await disabled.page.screenshot({animations:'disabled',path:path.join(out,'talk-here-emphasis-mobile.png')});
    await disabled.page.locator('.invitation-action').click();
    assert.equal(await disabled.page.locator('#crew-voice-step').isVisible(),false);
    assert.equal(await disabled.page.locator('#crew-callback-form').isVisible(),false);
    assert.equal(await disabled.page.evaluate(()=>window.__mic),0);
    report.checks.push({disabled:true,boldItalicTitleCase:true,noMic:true,formsUnavailable:true});
    await disabled.ctx.close();await app.close();
    process.env.RETELL_API_KEY='synthetic-unit-test-key';
    const config={enabled:true,allowance:{id:'synthetic-browser-only',approved:true,expiresAt:new Date(Date.now()+3600000).toISOString(),cap:8,approvedBudgetUsd:4,maxCostPerAttemptUsd:.5},prospects:{[realty.id]:{reviewed:true,revisionHash:revisionHash(realty),agentId:'agent_TestEllis',agentVersion:0,talkEnabled:true,callEnabled:true}},callback:{fromNumber:'+12025550122',allowedDestinations:[{phone:'+12025550123',verified:true,consentAttested:true}]}};
    app=createOwnerServer({dataDir:dir,channelConfig:config,providerFetch:fakeProvider});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+app.server.address().port;
    for(const width of [1440,390]){
      const {ctx,page}=await prepare(width,true);
      await page.locator('.invitation-action').click();
      await page.locator('#crew-voice-start').click();assert.equal(await page.evaluate(()=>window.__mic),0);
      await page.locator('#crew-voice-consent').check();
      await page.screenshot({animations:'disabled',path:path.join(out,width+'-voice-consent-simulated.png')});
      await page.locator('#crew-voice-start').click();
      await page.locator('#voice-status').getByText('Connected to Ellis',{exact:false}).waitFor();
      assert.equal(await page.evaluate(()=>window.__joined),1);
      assert.equal(await page.evaluate(()=>window.__tracksStopped),1);
      await page.screenshot({animations:'disabled',path:path.join(out,width+'-voice-state-simulated.png')});
      await page.locator('#crew-voice-end').click();assert.equal(await page.evaluate(()=>window.__stopped),1);
      assert.equal(await page.locator('#crew-voice-start').isDisabled(),true);
      const events=await page.evaluate(()=>window.crewEngagement.events);
      assert.equal(events.filter(e=>e.name==='crew_conversation_started'&&e.channel==='talk').length,1);
      assert.equal(events.filter(e=>e.name==='crew_conversation_completed'&&e.channel==='talk').length,1);
      assert(!JSON.stringify(events).includes('synthetic-join-token'));
      await page.locator('[data-crew-channel=call]').click();
      await page.locator('#crew-callback-phone').fill('+12025550123');
      await page.locator('#crew-callback-consent').check();
      await page.screenshot({animations:'disabled',path:path.join(out,width+'-callback-consent-simulated.png')});
      await page.locator('#crew-callback-submit').click();
      await page.locator('#voice-status').getByText('Request accepted by the call service.',{exact:false}).waitFor();
      assert.equal(await page.locator('#crew-callback-phone').inputValue(),'');
      assert.equal(await page.locator('#crew-callback-submit').isDisabled(),true);
      await page.locator('[data-crew-channel=chat]').click();
      await page.locator('#question').fill('What services do you offer?');await page.locator('#demo-chat button').click();
      await page.locator('#messages').getByText('Based on the reviewed concept facts:',{exact:false}).waitFor();
      report.checks.push({width,consentBeforeMic:true,simulatedJoin:true,explicitEndCleanup:true,voiceEvents:true,callbackConsentAndAccepted:true,phoneCleared:true,textFallback:true});
      await ctx.close();
    }
    // A late microphone grant after closing must never reserve or join a provider call.
    const pending=await prepare(390,true);
    await pending.page.evaluate(()=>{navigator.mediaDevices.getUserMedia=()=>{window.__mic++;return new Promise(resolve=>window.__grantLate=()=>resolve({getTracks:()=>[{stop:()=>window.__tracksStopped++}]}));};});
    await pending.page.locator('.invitation-action').click();await pending.page.locator('#crew-voice-consent').check();await pending.page.locator('#crew-voice-start').click();
    await pending.page.waitForFunction(()=>typeof window.__grantLate==='function');
    await pending.page.locator('#crew-close').click();await pending.page.evaluate(()=>window.__grantLate());
    await pending.page.waitForFunction(()=>window.__tracksStopped===1);
    assert.equal(await pending.page.evaluate(()=>window.__joined),0);assert.equal(calls.length,4);
    report.checks.push({latePermissionCancellation:true,noProviderReservation:true,tracksReleased:true});await pending.ctx.close();
    const denied=await prepare(390,true);
    await denied.page.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>{window.__mic++;throw Error('Synthetic permission denial');};});
    await denied.page.locator('.invitation-action').click();await denied.page.locator('#crew-voice-consent').check();await denied.page.locator('#crew-voice-start').click();
    await denied.page.locator('#voice-status').getByText('Voice could not connect.',{exact:false}).waitFor();
    assert.equal(await denied.page.evaluate(()=>window.__joined),0);assert.equal(calls.length,4);
    report.checks.push({permissionDenied:true,noProviderReservation:true,truthfulError:true});await denied.ctx.close();
    assert.equal(calls.length,4);assert(calls.every(c=>c.body.agent_override.agent.max_call_duration_ms===120000));
    assert(calls.every(c=>c.body.retell_llm_dynamic_variables.visitor_context==='No visitor context shared.'));
    report.providerAttempts=calls.length;
    assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalRequests,[]);
    fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
  }finally{
    await browser.close();await app.close();if(priorKey===undefined)delete process.env.RETELL_API_KEY;else process.env.RETELL_API_KEY=priorKey;
    assert.equal(path.dirname(path.resolve(dir)),path.resolve(os.tmpdir()));assert(path.basename(dir).startsWith('awc-channels-browser-'));fs.rmSync(dir,{recursive:true});
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
