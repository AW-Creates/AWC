'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const roles=['concierge','sales','scheduling','support','billing','implementation','retention'],legacyRoles=[...roles.filter(role=>role!=='retention'),'overview'];
const sha=body=>crypto.createHash('sha256').update(body).digest('hex');
function prepareUploads(config){
 if(config.publication_reviewed!==true||typeof config.reviewed_by!=='string'||!config.reviewed_by.trim()||!Number.isFinite(Date.parse(config.reviewed_at)))throw Error('Explicit reviewed publication required; archived default remains closed');
 if(typeof config.directory!=='string'||!config.directory)throw Error('Reviewed media directory required');
 const directory=path.resolve(config.directory);let entries;
 if(config.mode==='v2'){
  if(typeof config.manifest!=='string'||!config.manifest)throw Error('Explicit reviewed v2 manifest required');const manifest=path.resolve(config.manifest);if(path.dirname(manifest)!==directory)throw Error('Manifest must be inside reviewed media directory');const bytes=fs.readFileSync(manifest);if(sha(bytes)!==config.manifest_sha256)throw Error('Reviewed manifest hash changed');entries=JSON.parse(bytes);
  if(!Array.isArray(entries)||!entries.length||entries.length>7||new Set(entries.map(e=>e.role)).size!==entries.length)throw Error('Invalid reviewed v2 role manifest');
  for(const e of entries)if(!roles.includes(e.role)||e.video_filename!==e.role+'-v2.mp4'||e.caption_filename!==e.role+'-v2.vtt'||e.full_decode_passed!==true||e.no_caption_overlap!==true||e.meaningful_role_example_reviewed!==true||!Number.isFinite(e.duration_seconds)||e.duration_seconds<=33||e.duration_seconds>150||!e.review_sha256?.match(/^[a-f0-9]{64}$/)||!e.mp4_sha256?.match(/^[a-f0-9]{64}$/)||!e.vtt_sha256?.match(/^[a-f0-9]{64}$/))throw Error('Unaccepted or malformed v2 media entry');
 }else if(config.mode==='legacy')entries=legacyRoles.map(role=>({role,video_filename:role+'.mp4',caption_filename:role+'.vtt'}));
 else throw Error('Explicit v2 or legacy mode required; no automatic historical upload');
 // Read and verify the complete batch before sending anything.
 return entries.flatMap(e=>[['video_filename','video/mp4','mp4_sha256',12*1024*1024],['caption_filename','text/vtt','vtt_sha256',65536]].map(([field,type,hashField,limit])=>{const filename=e[field],body=fs.readFileSync(path.join(directory,filename));if(!body.length||body.length>limit)throw Error('Missing or oversized reviewed media: '+filename);if(type==='video/mp4'&&(body.length<12||body.subarray(4,8).toString()!=='ftyp')||type==='text/vtt'&&!body.toString('utf8',0,12).replace(/^\uFEFF/,'').startsWith('WEBVTT'))throw Error('Invalid media signature: '+filename);const hash=sha(body);if(config.mode==='v2'&&hash!==e[hashField])throw Error('Reviewed media hash changed: '+filename);return {filename,type,body,sha256:hash};}));
}
async function upload(config,fetchImpl=fetch){
 if(typeof config.token!=='string'||config.token.length<32||config.token.length>256)throw Error('Temporary upload credential missing');const plan=prepareUploads(config);
 try{for(const item of plan){const response=await fetchImpl('https://aw-creates-ventures.thesml.chatgpt.site/api/crew-media-upload',{method:'PUT',headers:{Authorization:'Bearer '+config.token,'X-Crew-Media-Filename':item.filename,'Content-Type':item.type},body:item.body,redirect:'error',signal:AbortSignal.timeout(60000)});if(![200,201].includes(response.status))throw Error('Upload failed '+item.filename+' HTTP '+response.status);const result=await response.json();if(result.sha256!==item.sha256)throw Error('Uploaded hash mismatch '+item.filename);console.log(JSON.stringify({filename:item.filename,status:result.status,sha256:result.sha256,bytes:item.body.length}));}}finally{config.token='';}
}
module.exports={prepareUploads,upload};
if(require.main===module){if(process.stdin.isTTY)process.stdin.setRawMode(true);console.log('Ready for explicit reviewed upload JSON on stdin (input hidden).');let input='';process.stdin.setEncoding('utf8');process.stdin.on('data',chunk=>{input+=chunk;if(input.length>16384){process.stdin.pause();if(process.stdin.isTTY)process.stdin.setRawMode(false);input='';console.error('Upload input too large');process.exitCode=1;return;}if(!/[\r\n]/.test(input))return;process.stdin.pause();if(process.stdin.isTTY)process.stdin.setRawMode(false);let config;try{config=JSON.parse(input.trim());input='';}catch{input='';console.error('Invalid upload JSON');process.exitCode=1;return;}upload(config).catch(e=>{console.error(e.message);process.exitCode=1;});});}
