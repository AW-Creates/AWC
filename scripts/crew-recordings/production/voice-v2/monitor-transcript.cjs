'use strict';
// Read-only transcript stream. Never creates calls, subscribes to audio, takes over,
// or forwards the API credential into the browser. No automatic reconnects.
const DEFAULT_WS='C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC/website-receptionist/node_modules/ws';
const MAX_BYTES=128*1024;
function diagnosticError(code,details={}){const error=Error('Monitor '+code);error.code=code;error.details={code,...details};return error;}
// Eligibility polling reads an already reserved call; it never creates/retries a call.
async function waitForOngoing({callId,getCall,maxWaitMs=10000,pollMs=250,now=Date.now,delay=ms=>new Promise(resolve=>setTimeout(resolve,ms)),cancelled=()=>false}={}) {
 if(!/^call_[A-Za-z0-9]+$/.test(callId||'')||typeof getCall!=='function'||!Number.isFinite(maxWaitMs)||maxWaitMs<=0||maxWaitMs>15000||!Number.isFinite(pollMs)||pollMs<100||pollMs>2000)throw diagnosticError('invalid_eligibility_options');
 const start=now(),maxReads=Math.ceil(maxWaitMs/pollMs)+1;
 for(let i=0;i<maxReads;i++) {
  if(cancelled())throw diagnosticError('eligibility_cancelled');
  const readRemaining=maxWaitMs-(now()-start);if(readRemaining<=0)break;
  let call,readTimer;try{call=await Promise.race([getCall(callId),new Promise((_,reject)=>{readTimer=setTimeout(()=>reject(diagnosticError('ongoing_timeout')),readRemaining);})]);}catch(error){if(error?.code==='ongoing_timeout')throw error;throw diagnosticError('eligibility_read_failed');}finally{clearTimeout(readTimer);}
  if(cancelled())throw diagnosticError('eligibility_cancelled');
  if(now()-start>maxWaitMs)throw diagnosticError('ongoing_timeout');
  if(!call||call.call_id!==callId)throw diagnosticError('eligibility_identity_mismatch');
  if(call.call_status==='ongoing')return {ongoing:true,reads:i+1};
  if(['ended','error','not_connected'].includes(call.call_status))throw diagnosticError('call_already_terminal');
  if(call.call_status!=='registered')throw diagnosticError('eligibility_unknown_status');
  const remaining=maxWaitMs-(now()-start);if(remaining<=0||i===maxReads-1)break;
  await delay(Math.min(pollMs,remaining));
 }
 throw diagnosticError('ongoing_timeout');
}
function startMonitor({callId,key,onTranscript=()=>{},onError=()=>{},onEnd=()=>{},maxSeconds=150,connectionMs=10000,WebSocketImpl,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now}={}) {
 if(!/^call_[A-Za-z0-9]+$/.test(callId||''))throw Error('Invalid private call identity');
 if(typeof key!=='string'||!key.trim()||/[\r\n]/.test(key))throw Error('Server credential required');
 if(!Number.isFinite(maxSeconds)||maxSeconds<=0||maxSeconds>150||!Number.isFinite(connectionMs)||connectionMs<=0||connectionMs>15000)throw Error('Bounded monitor duration required');
 const WS=WebSocketImpl||require(DEFAULT_WS),items=new Map();let socket,terminal=false,admitted=false,connectTimer,hardTimer,closeTimer;
 let resolveReady,rejectReady;
 const readyPromise=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});readyPromise.catch(()=>{});
 function cleanup() {
  clearTimer(connectTimer);clearTimer(hardTimer);
  if(!socket)return;
  socket.removeAllListeners();socket.on('error',()=>{});
  try{socket.close(1000);}catch{try{socket.terminate();}catch{}return;}
  if(socket.readyState!==WS.CLOSED) {
   closeTimer=setTimer(()=>{try{socket.terminate();}catch{}},500);closeTimer?.unref?.();
   socket.once('close',()=>clearTimer(closeTimer));
  }
 }
 function finish(code,notify=true,details={}) {
  if(terminal)return;terminal=true;cleanup();
  if(!admitted)rejectReady(diagnosticError(code,details));
  if(notify){try{onError({code,...details});}catch{}}
 }
 function close(){finish('closed',false);}
 function ended(){if(terminal)return;terminal=true;cleanup();if(!admitted)rejectReady(diagnosticError('ended_before_ready'));try{onEnd({code:'call_ended'});}catch{}}
 function classifyClose(code) {return ({4000:'malformed_request',4001:'invalid_credential',4003:'permission_denied',4004:'call_not_ongoing',4008:'watcher_limit',1011:'provider_error'})[code]||'stream_lost';}
 function parseFrame(data,isBinary) {
  if(terminal)return;
  if(isBinary||!(typeof data==='string'||Buffer.isBuffer(data))||Buffer.byteLength(data)>MAX_BYTES)return finish('invalid_frame');
  let message;try{message=JSON.parse(data.toString());}catch{return finish('invalid_json');}
  if(!message||typeof message!=='object'||Array.isArray(message))return finish('invalid_frame');
  if(message.type==='call_ended')return ended();
  if(!['transcript_snapshot','transcript_updated'].includes(message.type))return; // Never interpret unknown events as turn completion.
  if(!Array.isArray(message.transcripts)||message.transcripts.length>500)return finish('invalid_transcript');
  const updates=[];
  for(const item of message.transcripts) {
   if(!item||typeof item!=='object')return finish('invalid_transcript');
   if(!['agent','user'].includes(item.role))continue; // Tool arguments/results and other sensitive payloads are not forwarded.
   if(!new RegExp('^'+item.role+'_\\d{1,6}$').test(item.id||'')||!Number.isFinite(item.time_sec)||item.time_sec<0||item.time_sec>3600||typeof item.content!=='string'||item.content.length>20000)return finish('invalid_transcript');
   updates.push({id:item.id,time_sec:item.time_sec,role:item.role,content:item.content});
  }
  for(const item of updates)items.set(item.id,item);
  if(items.size>500)return finish('transcript_limit');
  if(!admitted){admitted=true;clearTimer(connectTimer);resolveReady({admitted:true});}
  const transcript=[...items.values()].sort((a,b)=>a.time_sec-b.time_sec);
  try{onTranscript(transcript,{received_at_ms:now(),snapshot:message.type==='transcript_snapshot'});}catch{finish('consumer_error');}
 }
 try {
  socket=new WS('wss://api.retellai.com/v2/monitor-call/'+callId,{headers:{Authorization:'Bearer '+key},handshakeTimeout:connectionMs,maxPayload:MAX_BYTES,perMessageDeflate:false});
  // A successful WebSocket handshake is not admission; require a valid snapshot/update.
  socket.on('message',parseFrame);
  socket.on('unexpected-response',(_,response)=>{const status=response.statusCode;response.resume?.();finish(status===401?'invalid_credential':status===403?'permission_denied':'handshake_rejected',true,{phase:'handshake',...(Number.isInteger(status)&&status>=100&&status<=599?{http_status:status}:{})});});
  socket.on('error',error=>{const allowed=['ENOTFOUND','ECONNREFUSED','ETIMEDOUT','ECONNRESET','EHOSTUNREACH','CERT_HAS_EXPIRED','UNABLE_TO_VERIFY_LEAF_SIGNATURE'];finish('connection_error',true,{phase:admitted?'stream':'handshake',...(allowed.includes(error?.code)?{transport_code:error.code}:{})});});
  socket.on('close',code=>{if(code===1000)ended();else finish(classifyClose(code),true,{phase:admitted?'stream':'handshake',...(Number.isInteger(code)?{ws_close_code:code}:{})});});
  connectTimer=setTimer(()=>finish('admission_timeout'),Math.min(connectionMs,maxSeconds*1000));
  hardTimer=setTimer(()=>finish('duration_limit'),maxSeconds*1000);
 }catch{finish('connection_error');}
 return {readyPromise,close};
}
module.exports={startMonitor,waitForOngoing};
