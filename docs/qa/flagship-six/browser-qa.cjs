const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/A-Problem/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright');
const out=__dirname,base='http://127.0.0.1:4191';
const roles={concierge:'Autumn Winters',sales:'Owen Brooks',scheduling:'Clara Bennett',support:'Miles Carter',billing:'June Parker',implementation:'Theo Reed'};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Users/A-Problem/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe'});
 const report={mode:'local prepared guidance',started:new Date().toISOString(),errors:[],providerRequests:[],checks:[],screenshots:[]};
 for(const [index,width] of [1440,390,360].entries())for(const theme of ['dark','light']){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',extraHTTPHeaders:{'CF-Connecting-IP':`192.0.2.${index*2+(theme==='dark'?1:2)}`}});
  const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith(base)||/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u))return r.continue();report.providerRequests.push(u);return r.abort();});
  await page.addInitScript(()=>{window.__mic=0;window.__events=[];window.addEventListener('crew:event',e=>window.__events.push(e.detail));navigator.mediaDevices.getUserMedia=()=>{window.__mic++;throw Error('QA microphone prohibited');};});
  await page.goto(base);await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);await page.locator('#meet-crew').scrollIntoViewIfNeeded();await page.locator('.flagship-crew-card').first().waitFor();assert.equal(await page.locator('.flagship-crew-card').count(),6);
  const shot=async label=>{const file=`${width}-${theme}-${label}.png`;await page.screenshot({path:path.join(out,file),fullPage:label==='roster'});report.screenshots.push(file);};
  await shot('roster');
  const ask=async text=>{await page.locator('#specialistQuestion').fill(text);const response=page.waitForResponse(r=>r.url().endsWith('/api/chat'));await page.locator('#specialistSend').click();assert.equal((await response).status(),200);await page.locator('#specialistSend').waitFor({state:'visible'});await page.waitForFunction(()=>!document.getElementById('specialistSend').disabled);return page.locator('#specialistMessages .assistant').last().textContent();};
  for(const [role,name] of Object.entries(roles)){
   await page.locator(`[data-crew-meet="${role}"]`).click();assert.equal(await page.locator('#crewRoleSelect').inputValue(),role);assert.equal(await page.locator('#crewSelectContext').isChecked(),false);
   const resp=page.waitForResponse(r=>r.url().endsWith('/api/crew-select'));await page.locator('#crewMeetSelected').click();assert.equal((await resp).status(),200);await page.waitForFunction(n=>document.getElementById('specialistTitle').textContent===n,name);assert((await page.locator('#specialistMessages').textContent()).includes(name));
   assert((await ask('Show me an example of what you do')).includes(name));assert((await ask('How could your role be customized for my business?')).includes('customized'));
   if(role!=='concierge'){assert.equal(await page.locator('section[aria-label="Autumn voice demo"]').isVisible(),false);assert.equal(await page.locator('#crewCallback').isDisabled(),true);}
   await shot(role+'-open');await page.locator('#specialistClose').click();assert.equal(await page.locator('#specialistDialog').isVisible(),false);
  }
  await page.locator('[data-crew-meet="concierge"]').click();let response=page.waitForResponse(r=>r.url().endsWith('/api/crew-select'));await page.locator('#crewMeetSelected').click();assert.equal((await response).status(),200);await page.waitForFunction(()=>document.getElementById('specialistTitle').textContent==='Autumn Winters');
  await ask('I need the billing specialist. Private context test 7319');await page.locator('#crewAcceptHandoff').waitFor({state:'visible'});assert.equal(await page.locator('#crewShareContext').isChecked(),false);response=page.waitForResponse(r=>r.url().endsWith('/api/crew-handoff'));await page.locator('#crewAcceptHandoff').click();assert.equal((await response).status(),200);await page.waitForFunction(()=>document.getElementById('specialistTitle').textContent==='June Parker');assert(!(await page.locator('#specialistMessages').textContent()).includes('7319'));await shot('handoff-optout');
  await page.locator('#specialistConsult').click();assert.equal(await page.locator('#fname').evaluate(el=>document.activeElement===el),true);assert.equal(await page.locator('#finterest').inputValue(),'Request a consultation');
  assert.equal(await page.evaluate(()=>window.__mic),0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  report.checks.push({width,theme,roles:6,introductions:true,examples:true,customization:true,handoffOptOut:true,ctaInquiryFocus:true,noMicrophone:true,noHorizontalOverflow:true});await ctx.close();
 }
 await browser.close();assert.equal(report.errors.length,0);assert.equal(report.providerRequests.length,0);report.completed=new Date().toISOString();fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({cases:report.checks.length,screenshots:report.screenshots.length,errors:report.errors,providerRequests:report.providerRequests}));
})().catch(e=>{fs.writeFileSync(path.join(out,'failure.txt'),e.stack);console.error(e);process.exitCode=1;});
