const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/A-Problem/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright');
const root='C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures',out=path.join(root,'_venture-ops/media/awc-red-migration-2026-09-24');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Users/A-Problem/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe'}),results=[];
try{for(const width of [320,1440])for(const theme of ['dark','light'])for(const name of ['source','canonical']){
const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});await p.goto(name==='source'?pathToFileURL(path.join(root,'_recovery/AWC-red-approved-recovered/index.html')).href:'http://127.0.0.1:4173');await p.evaluate(()=>document.fonts.ready);if(theme==='light')await p.locator('#themeToggle').click();await p.waitForTimeout(2500);
const r={width,theme,name,links:[],animations:await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').map(a=>({name:a.animationName,target:a.effect?.target?.className}))),errors:[]};
const anchors=p.locator('a[href^="#"]');for(let i=0;i<await anchors.count();i++){
const a=anchors.nth(i),href=await a.getAttribute('href');if(!(await a.isVisible())&&await p.locator('.menu-toggle').isVisible())await p.locator('.menu-toggle').click();
if(await a.isVisible()){await a.click();r.links.push({href,pass:new URL(p.url()).hash===href});}}
await p.locator('#femail').fill('invalid-email');await p.locator('#submitBtn').click();r.invalidEmail=await p.locator('#femail').evaluate(e=>e.validity.typeMismatch);
const select=p.locator('#finterest');if(await select.count()){await select.selectOption({index:1});r.interest=await select.inputValue();}
await p.locator('.conversation-demo').scrollIntoViewIfNeeded();await p.locator('#quoteNextStep').click();r.quoteScroll=await p.locator('#conversationEstimate').evaluate(e=>({top:e.scrollTop,height:e.clientHeight,total:e.scrollHeight}));r.quoteAction=(await p.locator('#quoteActionNote').innerText()).includes('No appointment has been booked');
results.push(r);await p.close();}
}finally{await b.close();}fs.writeFileSync(path.join(out,'additional-checks.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));if(results.some(r=>r.animations.length||!r.invalidEmail||!r.quoteAction||r.links.some(l=>!l.pass)))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
