const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--autoplay-policy=no-user-gesture-required']});
const context=await browser.newContext({viewport:{width:1360,height:900},recordVideo:{dir:out,size:{width:1360,height:900}}});
const page=await context.newPage(),errors=[];page.on('request',r=>{if(r.url().endsWith('/api/audio')&&r.postDataBuffer())fs.writeFileSync(path.join(out,'audio-request.bin'),r.postDataBuffer());});page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765');await page.click('#reset');
// Synthetic microphone traverses real WebAudio stream, VAD, MediaRecorder and server STT.
await page.evaluate(()=>{window.fixtureContext=new AudioContext();window.fixtureDest=fixtureContext.createMediaStreamDestination();navigator.mediaDevices.getUserMedia=async()=>fixtureDest.stream;window.inject=async b64=>{await fixtureContext.resume();const b=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));const audio=await fixtureContext.decodeAudioData(b.buffer);const src=fixtureContext.createBufferSource();src.buffer=audio;src.connect(fixtureDest);window.fixtureStarted=performance.now();src.start();return audio.duration;};});
await page.click('#start');
const waitPlayback=async n=>page.waitForFunction(n=>window.demoEvidence.playbacks.length>=n,n,{timeout:120000});
await page.click('#greet');await waitPlayback(1);
await page.screenshot({path:path.join(out,'greeting.png')});
const estimate=fs.readFileSync('docs/voice-bakeoff/evidence/estimate.wav').toString('base64');
await page.evaluate(b=>window.inject(b),estimate);
await waitPlayback(2);
await page.waitForFunction(()=>document.querySelector('#log').textContent.includes('225 dollars'),{timeout:120000});
async function textTurn(text,n){await page.fill('#text-input',text);await page.click('#send-text');await waitPlayback(n);await page.waitForTimeout(250);}
await textTurn('What hours are you open?',3);
await textTurn('What appointments are available?',4);
await textTurn('Book the first slot',5);
await textTurn('Connect me to sales specialist',6);
await page.screenshot({path:path.join(out,'handoff.png')});
const human=fs.readFileSync('docs/voice-bakeoff/evidence/human.wav').toString('base64');await page.evaluate(b=>window.inject(b),human);await waitPlayback(7);
await page.click('#summary');await page.waitForTimeout(800);await page.screenshot({path:path.join(out,'summary.png')});
const evidence=await page.evaluate(()=>({browser:window.demoEvidence,summary:JSON.parse(document.querySelector('#summary-output').textContent),width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
if(!evidence.summary.booking||evidence.summary.quote?.total!==225||evidence.summary.handoffs.length!==1||evidence.summary.callbacks.length!==1)throw Error('Scenario assertions failed');
if(!evidence.browser.interruptions.some(x=>x.reason==='microphone energy'))throw Error('No microphone interruption');
if(errors.length)throw Error(errors.join('\n'));
evidence.errors=errors;evidence.input='synthetic Kokoro WAV injected into WebAudio MediaStream, not human microphone';evidence.audio='Chromium playing events/duration verified; silent Playwright video; subjective listening unmeasured';
fs.writeFileSync(path.join(out,'browser-evidence.json'),JSON.stringify(evidence,null,2));
await page.click('#stop');const video=page.video();await context.close();await video.saveAs(path.join(out,'brighthome-demo.webm'));await browser.close();console.log(JSON.stringify({out,turns:evidence.browser.turns.length,interruptions:evidence.browser.interruptions.length,pass:true}));
})().catch(e=>{console.error(e);process.exit(1)});


