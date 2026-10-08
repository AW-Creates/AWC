import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('src/voice.html','utf8').match(/<script>\s*\(\(\)=>\{([\s\S]*?)<\/script>/)[0].replace(/^<script>|<\/script>$/g,'');
function harness({deny=false,pending=false}={}){
 const nodes=new Map();function node(id){if(!nodes.has(id))nodes.set(id,{dataset:{},disabled:false,checked:false,hidden:true,textContent:'',events:{},addEventListener(event,fn){this.events[event]=fn;},focus(){},close(){this.events.close?.();},scrollIntoView(){}});return nodes.get(id);}
 let stopped=0,closed=0,fetches=0,now=1000,peak=128,frame,client,resolveMic;
 const tracks={getTracks:()=>[{stop(){stopped++;}}]};const timers=new Map();let timerId=0;
 class Client{constructor(){client=this;this.events={};}on(event,fn){this.events[event]=fn;}async startCall(){this.events.call_started();}stopCall(){closed++;this.events.call_ended?.();}}
 const window={retellClientJsSdk:{RetellWebClient:Client},addEventListener(){}};
 const sandbox={window,document:{getElementById:node},isSecureContext:true,navigator:{mediaDevices:{getUserMedia:()=>{if(deny)return Promise.reject(new Error('denied'));if(pending)return new Promise(r=>resolveMic=r);return Promise.resolve(tracks);}}},AudioContext:class{createAnalyser(){return {fftSize:512,getByteTimeDomainData(samples){samples.fill(peak);}};}createMediaStreamSource(){return {connect(){}};}close(){return Promise.resolve();}},performance:{now:()=>now},requestAnimationFrame:fn=>{frame=fn;return 1;},cancelAnimationFrame(){frame=null;},setTimeout:(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId;},clearTimeout:id=>timers.delete(id),fetch:async()=>{fetches++;return {ok:true,json:async()=>fetches===1?{token:'test',voiceAvailable:true}:{access_token:'join',call_id:'test',transport:'gateway',ice_servers:[]}};}};
 vm.runInNewContext(source,sandbox);
 return {node,click:id=>node(id).events.click(),get client(){return client;},get stopped(){return stopped;},get closed(){return closed;},get fetches(){return fetches;},resolve:()=>resolveMic(tracks),tick:(time,value=128)=>{now=time;peak=value;frame?.();},timeout:ms=>[...timers.values()].find(t=>t.ms===ms)?.fn()};
}
test('voice consent and denied microphone never reserve a provider session',async()=>{
 let h=harness();await h.click('crewStart');assert.match(h.node('crewError').textContent,/agree/);assert.equal(h.fetches,0);
 h=harness({deny:true});h.node('crewConsent').checked=true;await h.click('crewStart');assert.equal(h.node('crewState').dataset.state,'error');assert.equal(h.fetches,1);assert.equal(h.node('crewEnd').disabled,true);
});
test('cancel while permission is pending releases late microphone without network',async()=>{
 const h=harness({pending:true});h.node('crewConsent').checked=true;const pending=h.click('crewStart');await new Promise(r=>setImmediate(r));assert.equal(h.node('crewState').dataset.state,'connecting');await h.click('crewEnd');h.resolve();await pending;assert.equal(h.stopped,1);assert.equal(h.fetches,1);assert.equal(h.node('crewState').dataset.state,'ended');
});
test('voice audio hints cover listening thinking speaking and end releases resources and CTA',async()=>{
 const h=harness();h.node('crewConsent').checked=true;await h.click('crewStart');assert.equal(h.node('crewState').dataset.state,'listening');h.tick(1000,150);assert.equal(h.node('crewState').dataset.state,'listening');h.tick(1600);assert.equal(h.node('crewState').dataset.state,'thinking');h.client.events.audio(new Float32Array([.5]));h.tick(1650);assert.equal(h.node('crewState').dataset.state,'speaking');h.tick(5000);assert.equal(h.node('crewState').dataset.state,'listening');await h.click('crewEnd');assert.equal(h.node('crewState').dataset.state,'ended');assert.equal(h.stopped,1);assert.equal(h.closed,1);assert.equal(h.node('crewCTA').hidden,false);
});
test('SDK error and safety timeout stop without reconnect',async()=>{
 for(const kind of ['error','timeout']){const h=harness();h.node('crewConsent').checked=true;await h.click('crewStart');if(kind==='error')h.client.events.error(new Error('test'));else h.timeout(115000);assert.equal(h.node('crewState').dataset.state,kind==='error'?'error':'ended');assert.equal(h.stopped,1);assert.equal(h.closed,1);assert.equal(h.fetches,2);}
});
test('browser assets retain AI disclosure and contain no long-lived key configuration',()=>{
 const html=readFileSync('public/index.html','utf8');assert.doesNotMatch(html,/RETELL_API_KEY|CREW_RETELL_AGENT_ID|\bAva\b/);assert.match(html,/AI voice demo processed by Retell/);assert.match(html,/Your team gets its own names, voices, personality, language, brand knowledge and workflows/);assert.match(html,/prefers-reduced-motion/);
});
