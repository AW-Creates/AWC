const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/A-Problem/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright');
const root='C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures',out=path.join(root,'_venture-ops/media/awc-red-migration-2026-09-24');
const results=[];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Users/A-Problem/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe'});
 try{for(const name of (process.env.CANONICAL_ONLY?['canonical']:['source','canonical'])){
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference',...(name==='canonical'?{recordVideo:{dir:out,size:{width:1440,height:1000}}}:{})});
  const page=await ctx.newPage(),errors=[],shots=[];page.on('pageerror',e=>errors.push(e.message));
  const started=Date.now();const shot=async label=>{shots.push({label,seconds:(Date.now()-started)/1000});await page.screenshot({path:path.join(out,`${name}-normal-${label}.png`)});};
  await page.goto(name==='source'?pathToFileURL(path.join(root,'_recovery/AWC-red-approved-recovered/index.html')).href:'http://127.0.0.1:4173');
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(2400);await shot('desktop-dark');
  await page.locator('#work').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(1200);await shot('master-manipulator');
  await page.locator('.conversation-demo').scrollIntoViewIfNeeded();await page.waitForTimeout(4000);await shot('quote-composer');
  const composer=await page.locator('#composerText').innerText();
  await page.waitForFunction(()=>!document.getElementById('conversationEstimate').hidden,{},{timeout:45000});
  await page.waitForTimeout(700);await shot('quote-result');
  await page.locator('#quoteNextStep').click();await shot('quote-action');
  await page.locator('#viewConversation').click();await shot('quote-transcript');
  await page.locator('#replayDemo').click();await page.waitForTimeout(500);const replay=await page.locator('.conversation-demo').evaluate(e=>e.classList.contains('is-playing'));
  await page.emulateMedia({reducedMotion:'reduce'});const switchedReduced=await page.locator('#conversationEstimate').isVisible();
  await page.locator('#themeToggle').click();await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(400);await shot('desktop-light');await page.waitForTimeout(2000);
  await page.locator('#work').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(500);await shot('light-work');await page.waitForTimeout(1500);
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await shot('mobile-light');await page.waitForTimeout(1500);
  await page.locator('#themeToggle').click();await shot('mobile-dark');await page.waitForTimeout(1500);
  await page.locator('.conversation-demo').scrollIntoViewIfNeeded();await shot('mobile-quote');await page.waitForTimeout(1500);
  await page.waitForTimeout(1000);
  const video=page.video();await ctx.close();if(video){await video.saveAs(path.join(out,'canonical-red-walkthrough.webm'));await video.delete();}
  results.push({name,composer,replay,switchedReduced,errors,shots});console.log(name+' normal motion and interaction complete');
 }}finally{await browser.close();}
 fs.writeFileSync(path.join(out,process.env.CANONICAL_ONLY?'final-walkthrough-results.json':'normal-motion-results.json'),JSON.stringify(results,null,2));
 if(results.some(r=>r.errors.length||!r.replay||!r.switchedReduced))throw new Error('Normal motion check failed');
})().catch(e=>{console.error(e);process.exitCode=1;});
