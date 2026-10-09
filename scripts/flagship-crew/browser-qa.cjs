const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/A-Problem/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright');
(async()=>{
 const root=process.cwd(),out=path.join(root,'docs/qa/flagship-crew');fs.mkdirSync(out,{recursive:true});
 const media='C:/Users/A-Problem/.codex/visualizations/2026/10/09/01a12279-5cc2-7513-b3b5-0f5673ed0f74/flagship-capture';fs.mkdirSync(media,{recursive:true});
 const b=await chromium.launch({headless:true,executablePath:'C:/Users/A-Problem/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe'});
 const report={mode:'local-real-prepared-role-handoff',errors:[],externalRequests:[],blockedFontRequests:[],checks:[],providerCalls:0};
 for(const width of [1440,390]){
  const c=await b.newContext({viewport:{width,height:900},reducedMotion:'reduce',...(width===1440?{recordVideo:{dir:media,size:{width:1280,height:720}}}:{})});
  const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  await p.route('**/*',r=>{if(!r.request().url().startsWith('http://127.0.0.1:4191')){const url=r.request().url();if(url.startsWith('https://fonts.googleapis.com/')||url.startsWith('https://fonts.gstatic.com/'))report.blockedFontRequests.push(url);else report.externalRequests.push(url);return r.abort();}return r.continue();});
  await p.addInitScript(()=>{window.__crewEvents=[];window.addEventListener('crew:event',e=>window.__crewEvents.push(e.detail));window.__mic=0;navigator.mediaDevices.getUserMedia=()=>{window.__mic++;throw Error('QA never requests microphone');};});
  await p.goto('http://127.0.0.1:4191');await p.locator('#specialistLaunch').click();
  assert.equal(await p.locator('#crewHandoff').isVisible(),false);assert.equal(await p.locator('#crewCallback').isDisabled(),true);
  await p.locator('#specialistQuestion').fill('I am interested in Crew sales for my website');await p.locator('#specialistSend').click();await p.locator('#crewAcceptHandoff').waitFor({state:'visible'});
  await p.screenshot({path:path.join(out,'handoff-offered-'+width+'.png')});
  if(width===390)await p.locator('#crewShareContext').uncheck();
  await p.locator('#crewAcceptHandoff').click();await p.waitForFunction(()=>document.getElementById('specialistTitle').textContent==='Sales Specialist');
  assert.equal(await p.locator('#crewHandoff').isVisible(),false);
  const text=await p.locator('#specialistMessages').textContent();assert(text.includes('Thanks for the introduction'));assert(text.includes('interested in Crew sales for my website'));
  const sales=await p.locator('#specialistMessages .assistant').last().textContent();assert.equal(sales.includes('You mentioned'),width===1440);
  await p.locator('#specialistDialog').evaluate(el=>el.scrollTop=0);await p.screenshot({path:path.join(out,'sales-connected-'+width+'.png')});
  await p.locator('#specialistQuestion').fill('What can we combine?');await p.locator('#specialistSend').click();await p.waitForFunction(()=>document.querySelector('#specialistMessages .assistant:last-child')?.textContent.includes('combine a website'));
  const events=await p.evaluate(()=>window.__crewEvents);assert(events.some(e=>e.event==='crew_specialist_handoff_completed'&&e.specialist_role==='sales'));assert(events.every(e=>e.business_id==='aw_creatives'&&!JSON.stringify(e).includes('website')));
  assert.equal(await p.evaluate(()=>window.__mic),0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('#specialistNew').click();assert.equal(await p.locator('#specialistTitle').textContent(),'Autumn Winters');
  report.checks.push({width,offer:true,accepted:true,contextConsent:width===1440,salesIdentity:true,continued:true,newSessionReset:true,noOverflow:true,noMicrophone:true,events});
  if(width===390){await p.evaluate(()=>document.documentElement.dataset.theme='light');await p.screenshot({path:path.join(out,'mobile-light.png')});}
  const video=p.video();await c.close();if(video)report.video=await video.path();
 }
 await b.close();assert.equal(report.errors.length,0);assert.equal(report.externalRequests.length,0);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({cases:report.checks.length,errors:report.errors.length,externalRequests:report.externalRequests.length,providerCalls:0,video:report.video}));
})().catch(e=>{console.error(e);process.exitCode=1;});
