const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/A-Problem/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright');
const root='C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures',out=path.join(root,'_venture-ops/media/awc-red-migration-2026-09-24');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Users/A-Problem/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe'});try{
for(const name of ['source','canonical']){const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await p.goto(name==='source'?pathToFileURL(path.join(root,'_recovery/AWC-red-approved-recovered/index.html')).href:'http://127.0.0.1:4173');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(2500);
await p.screenshot({path:path.join(out,`settled-1440-dark-${name}-full.png`),fullPage:true});
await p.locator('.conversation-demo').scrollIntoViewIfNeeded();await p.waitForTimeout(1000);await p.screenshot({path:path.join(out,`settled-1440-dark-${name}-quote.png`)});
await p.locator('#work').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await p.waitForTimeout(500);await p.screenshot({path:path.join(out,`settled-1440-dark-${name}-master.png`)});await p.close();}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
