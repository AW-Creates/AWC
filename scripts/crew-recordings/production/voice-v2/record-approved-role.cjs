'use strict';
const fs=require('node:fs'),path=require('node:path');
const {createGate,LIMITS}=require('./paid-gate.cjs');
const {captureSession}=require('./capture-session.cjs');
const {startMonitor,waitForOngoing}=require('./monitor-transcript.cjs');
const root=path.resolve(__dirname,'../../../..');
// Allowlisted calls, server-only key, one request each, no HTTP retries or response-body logging.
async function api(method,endpoint,body) {
 if(!((method==='GET' && /^\/(get-agent\/agent_[A-Za-z0-9]+\?version=\d+|get-retell-llm\/llm_[A-Za-z0-9]+\?version=\d+|v2\/get-call\/call_[A-Za-z0-9]+)$/.test(endpoint)) || (method==='POST' && (/^\/v3\/create-web-call$/.test(endpoint)||/^\/v2\/stop-call\/call_[A-Za-z0-9]+$/.test(endpoint)))))throw Error('Endpoint rejected');
 const source=fs.readFileSync(path.join(root,'.env'),'utf8'),line=source.split(/\r?\n/).find(l=>/^\s*RETELL_API_KEY\s*=/.test(l)),key=line?.slice(line.indexOf('=')+1).trim().replace(/^(['"])(.*)\1$/,'$2');if(!key)throw Error('Server credential unavailable');
 const response=await fetch('https://api.retellai.com'+endpoint,{method,headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('Provider HTTP '+response.status+'; response suppressed');if(endpoint.startsWith('/v2/stop-call/'))return {};return response.json();
}
async function main() {
 const args=process.argv.slice(2),gate=createGate({root,api});
 if(!args.length){console.log(JSON.stringify({mode:'plan',limits:LIMITS,provider_calls:0,attempts_consumed:gate.status().attempts.length,required:['RECORDING-MANIFEST.json','RECORDING-READINESS.json','three hash-verified WAVs per role','published pinned agent and LLM','owner native-voice acceptance','reviewed all-in rate <= $0.36/min'],record_command:'node scripts/crew-recordings/production/voice-v2/record-approved-role.cjs --record ROLE'}));return;}
 if(args.length!==2||!['--preflight','--record','--reconcile'].includes(args[0]))throw Error('Use --preflight ROLE, --record ROLE or --reconcile ROLE');
 const [mode,role]=args;if(mode==='--reconcile'){console.log(JSON.stringify(await gate.reconcile(role)));return;}
 const input=gate.preflight(role);
 if(mode==='--preflight'){console.log(JSON.stringify({role,local_preflight:true,provider_calls:0,published_readback_required_at_recording:true}));return;}
 let captured;
 try {captured=await captureSession({name:input.entry.name,role,purpose:input.entry.purpose,maxSeconds:150,questionClips:input.clips.map(q=>({text:q.text,wavPath:q.wavPath})),outputDir:path.join(root,'voice-samples/production-v2/recordings',role),transcriptMonitorFactory:async({callId,onTranscript,onError,onEnd})=>{const source=fs.readFileSync(path.join(root,'.env'),'utf8'),line=source.split(/\r?\n/).find(l=>/^\s*RETELL_API_KEY\s*=/.test(l)),key=line?.slice(line.indexOf('=')+1).trim().replace(/^(['"])(.*)\1$/,'$2');if(!key)throw Error('Server credential unavailable');await waitForOngoing({callId,getCall:id=>api('GET','/v2/get-call/'+id)});return startMonitor({callId,key,onTranscript,onError,onEnd});},sessionFactory:ready=>gate.createSession(role,ready)});}
 catch {let stopped=false;try{stopped=(await gate.stopAfterFailure(role)).stopped;}catch{} console.error(JSON.stringify({capture_failed:true,direct_stop_confirmed:stopped,no_retry:true,requires_reconciliation:true}));process.exitCode=1;return;}
 // A successful local capture is insufficient; unsettled provider cost blocks the next role.
 const settled=await gate.reconcile(role);console.log(JSON.stringify({capture_passed:captured.pass,...settled}));
}
if(require.main===module)main().catch(()=>{console.error('Gate stopped; inspect private ledger and readiness. No retries or paid fallback.');process.exitCode=1;});
