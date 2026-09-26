/* Evidence runner: default injected fixture/control flow; --human opens a real microphone session. */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=path.resolve(process.argv[2]),human=process.argv.includes('--human');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:!human,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--autoplay-policy=no-user-gesture-required']});
 const context=await browser.newContext({viewport:{width:1280,height:900},permissions:human?['microphone']:[],recordVideo:{dir:out,size:{width:1280,height:900}},acceptDownloads:true});
 const page=await context.newPage(),errors=[],steps=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8766');await page.click('#reset');
 if(!human){
  await page.evaluate(async()=>{
   window.fixtureCtx=new AudioContext();await fixtureCtx.resume();window.fixtureDest=fixtureCtx.createMediaStreamDestination();
   window.silence=fixtureCtx.createConstantSource();silence.offset.value=0;silence.connect(fixtureDest);silence.start();
   navigator.mediaDevices.getUserMedia=async()=>fixtureDest.stream;
   window.inject=async b64=>{await fixtureCtx.resume();const a=await fixtureCtx.decodeAudioData(Uint8Array.from(atob(b64),c=>c.charCodeAt(0)).buffer);const src=fixtureCtx.createBufferSource();src.buffer=a;src.connect(fixtureDest);let at=performance.now();src.start();event('fixture_start',{duration_s:a.duration,fixture_end:at+a.duration*1000});return {started:at,end:at+a.duration*1000}};
  });
 }
 let n=0;
 async function shot(label){await page.screenshot({path:path.join(out,`${String(++n).padStart(2,'0')}-${label}.png`)});}
 async function waitDone(){await page.waitForFunction(()=>demoEvidence.events.some(e=>e.event==='audio_done'&&e.epoch===currentEpoch),null,{timeout:90000});}
 async function waitAudio(after){await page.waitForFunction(t=>demoEvidence.audible.some(e=>e.at>t),after,{timeout:60000});}
 async function textTurn(label,text,confirm=false){
  const start=await page.evaluate(()=>performance.now());await page.fill('#text',text);await page.click('#send');
  if(confirm){await page.waitForFunction(()=>!document.querySelector('#review').hidden,null,{timeout:10000});await shot(label+'-review');await page.click('#confirm');}
  await waitAudio(start);await shot(label);await waitDone();steps.push({label,text,start});
 }
 if(human){
  console.log('HUMAN_READY: Speak through your physical microphone. Click Start microphone, Greeting, then follow the scenario. Click Transcript & summary, then Stop microphone when finished.');
  await page.waitForFunction(()=>demoEvidence.events.some(e=>e.kind==='ready'),null,{timeout:600000});
  let seen=0;
  while(await page.locator('#stop').isEnabled()){
   const decisions=await page.evaluate(()=>demoEvidence.events.filter(e=>e.event==='decision').length);
   if(decisions>seen){seen=decisions;await shot('human-turn-'+seen);}
   await page.waitForTimeout(1000);
  }
 }else{
  await page.click('#start');await page.waitForFunction(()=>pc?.connectionState==='connected',null,{timeout:30000});await page.waitForTimeout(1000);
  const start=await page.evaluate(()=>performance.now());await page.click('#greet');await waitAudio(start);await shot('greeting');
  const fixture=fs.readFileSync('docs/voice-bakeoff/evidence/human.wav').toString('base64');
  const timing=await page.evaluate(b=>inject(b),fixture);steps.push({label:'human-fixture-barge-in',...timing});
  await page.waitForFunction(()=>demoEvidence.events.some(e=>e.event==='endpoint'),null,{timeout:30000});
  await waitAudio(timing.end);await shot('replacement');await waitDone();
  await textTurn('faq','What are your hours?');
  await textTurn('quote','Deep cleaning for three bedrooms',true);
  await textTurn('availability','What slots are available?');
  await textTurn('booking','Book the first slot',true);
  await textTurn('conflict','Book the first slot',true);
  await textTurn('financing','Do you offer financing?');
  await textTurn('handoff','Sales specialist please');
  await textTurn('escalation','Human please');
  await page.click('#summary');await shot('summary');await page.click('#stop');
 }
 await page.waitForTimeout(300);
 const evidence=await page.evaluate(async()=>({browser:demoEvidence,server:await fetch('/api/summary').then(r=>r.json()),log:document.querySelector('#log').textContent}));
 evidence.errors=errors;evidence.steps=steps;evidence.mode=human?'physical microphone; user speaks and evaluates':'synthetic WebRTC barge-in fixture plus explicit text-controlled business scenario';
 fs.writeFileSync(path.join(out,'acceptance.json'),JSON.stringify(evidence,null,2));
 const audio=await page.evaluate(()=>new Promise(resolve=>{if(!recorded.length)return resolve(null);let r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(recorded,{type:'audio/webm'}))}));
 if(audio)fs.writeFileSync(path.join(out,'conversation-audio.webm'),Buffer.from(audio,'base64'));
 await shot('final');const video=page.video();await context.close();await video.saveAs(path.join(out,'conversation-screen.webm'));await browser.close();
 console.log(JSON.stringify({out,mode:evidence.mode,errors,turns:evidence.server.business.transcript.length,interruptions:evidence.browser.interruptions.length}));
})().catch(e=>{console.error(e);process.exit(1)});
