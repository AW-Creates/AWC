const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/A-Problem/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright');
const root='C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures';
const out=path.join(root,'_venture-ops/media/awc-red-migration-2026-09-24');
const source=path.join(root,'_recovery/AWC-red-approved-recovered/index.html');
const chrome='C:/Users/A-Problem/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={date:new Date().toISOString(),cases:[],failures:[]};
function check(ok,label){if(!ok)report.failures.push(label);}
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const baseline=http.createServer((q,r)=>{if(q.url==='/favicon.ico'){r.writeHead(204).end();return;}r.setHeader('Content-Type','text/html; charset=utf-8');r.end(fs.readFileSync(source));});
 await new Promise(r=>baseline.listen(4174,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:chrome});
 try{
 for(const width of [320,360,375,390,430,768,1440])for(const theme of ['dark','light']){
  const pair=[];
  for(const [name,url] of [['source','http://127.0.0.1:4174'],['canonical','http://127.0.0.1:4173']]){
   const ctx=await browser.newContext({viewport:{width,height:width===1440?1000:844},reducedMotion:'reduce'});
   const page=await ctx.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   page.on('requestfailed',r=>requests.push({url:r.url(),error:r.failure()?.errorText}));
   await page.goto(url);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(120);
   if(theme==='light')await page.locator('#themeToggle').click();
   const id=`${width}-${theme}-${name}`;
   const data=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,theme:document.documentElement.dataset.theme,text:document.body.innerText.replace(/\s+/g,' ').trim(),images:[...document.images].map(i=>({loaded:i.complete&&i.naturalWidth>0,alt:i.alt})),fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),h1:getComputedStyle(document.querySelector('h1')).fontFamily,links:[...document.querySelectorAll('a[href^="#"]')].map(a=>({href:a.getAttribute('href'),exists:!!document.querySelector(a.getAttribute('href'))})),runningAnimations:document.getAnimations().filter(a=>a.playState==='running').length}));
   check(data.width===data.scrollWidth,id+' horizontal overflow');check(data.images.every(i=>i.loaded),id+' image');check(data.links.every(a=>a.exists),id+' anchors');check(data.theme===theme,id+' theme');
   for(const phrase of ['Build what your business needs next.','Ideas, given form.','What if your business could respond before your competitor does?','A clear path. Room to evolve.','The Master Manipulator','$9,800'])check(data.text.includes(phrase),id+' text: '+phrase);
   await page.screenshot({path:path.join(out,id+'-hero.png'),animations:'disabled'});
   await page.screenshot({path:path.join(out,id+'-full.png'),fullPage:true,animations:'disabled'});
   await page.locator('#work').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,id+'-work.png'),animations:'disabled'});
   await page.locator('.conversation-demo').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,id+'-quote.png'),animations:'disabled'});
   check(await page.locator('#conversationEstimate').isVisible(),id+' reduced-motion estimate');
   await page.locator('#viewConversation').click();check(await page.locator('#chatHistory').isVisible(),id+' view conversation');
   await page.locator('#viewConversation').click();await page.locator('#quoteNextStep').click();check((await page.locator('#quoteActionNote').innerText()).includes('No appointment has been booked'),id+' demo next step');
   await page.locator('#replayDemo').click();check(await page.locator('#conversationEstimate').isVisible(),id+' reduced replay');
   for(let i=0;i<6;i++){await page.locator(`[data-lens="${i}"]`).click();check((await page.locator('#lensNumber').innerText()).startsWith(String(i+1).padStart(2,'0')),id+' lens '+i);}
   const menu=page.locator('.menu-toggle');
   await page.evaluate(()=>scrollTo(0,0));
   if(await menu.isVisible()){
    await menu.click();check(await menu.getAttribute('aria-expanded')==='true',id+' menu open');await page.keyboard.press('Escape');check(await menu.getAttribute('aria-expanded')==='false',id+' menu Escape');
    await menu.click();await page.locator('#primary-navigation a[href="#work"]').click();check(await menu.getAttribute('aria-expanded')==='false',id+' menu link close');
   }else{await page.locator('#primary-navigation a[href="#work"]').click();}
   check(new URL(page.url()).hash==='#work',id+' nav Work');
   await page.locator('#contactForm').scrollIntoViewIfNeeded();await page.locator('#submitBtn').click();check(await page.locator('#fname').evaluate(e=>!e.validity.valid),id+' required form');
   await page.locator('#fname').fill('Migration QA');await page.locator('#femail').fill('qa@example.test');await page.locator('#fmsg').fill('Synthetic local migration check.');
   await page.locator('#submitBtn').click();check(await page.locator('#formConfirm').evaluate(e=>e.classList.contains('show')),id+' form confirmation');
   check(await page.locator('#fmsg').inputValue()==='Synthetic local migration check.',id+' form preserves input');
   data.formNotice=await page.locator('#formConfirm').innerText();
   await page.locator('#themeToggle').click();check(await page.locator('html').getAttribute('data-theme')!==theme,id+' theme toggle');
   await page.reload();data.themeAfterReload=await page.locator('html').getAttribute('data-theme');
   data.errors=errors;data.failedRequests=requests;check(errors.length===0,id+' runtime/console');
   delete data.text;pair.push(data);report.cases.push({id,...data});await ctx.close();
  }
  check(JSON.stringify(pair[0])===JSON.stringify(pair[1]),`${width}-${theme} source/canonical behavior mismatch`);
  console.log(`${width} ${theme}: checked source and canonical`);
 }
 report.sourceHash=hash(fs.readFileSync(source));report.canonicalHash=hash(fs.readFileSync(path.join(root,'AWC/index.html')));check(report.sourceHash===report.canonicalHash,'source bytes');
 fs.writeFileSync(path.join(out,'qa-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({cases:report.cases.length,failures:report.failures}));
 }finally{await browser.close();baseline.close();}
 if(report.failures.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
