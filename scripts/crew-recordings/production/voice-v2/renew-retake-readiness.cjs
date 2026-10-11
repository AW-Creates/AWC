'use strict';
const fs=require('node:fs'),path=require('node:path');
const {validateRetakeRenewal,RENEWAL_ID,RETAKE_LIMITS,sha}=require('./paid-gate.cjs');
const root=path.resolve(__dirname,'../../../..');
async function main(){
 const mode=process.argv[2];
 if(!mode){console.log(JSON.stringify({mode:'plan',provider_calls:0,renewal_id:RENEWAL_ID,allowance_id:RETAKE_LIMITS.id,roles:['sales'],max_hours:3,changes_grant:false,required:['base_readiness_sha256','original_ledger_fingerprint','approval_sha256','manifest_sha256','questions_sha256','reviewed_at','expires_at','preflight_reviewed_unchanged','native_voice_acceptance_unchanged','presenter_acceptance_unchanged','rate_reviewed_unchanged','provider_pins_reviewed_unchanged','review_source']}));return;}
 if(!['--validate','--write'].includes(mode)||process.argv.length!==3)throw Error('Explicit --validate or --write with reviewed JSON on stdin required');
 let input='';for await(const part of process.stdin){input+=part;if(input.length>10000)throw Error('Proof exceeds bound');}
 const proof=JSON.parse(input);validateRetakeRenewal({root,proof});
 if(mode==='--write') {
  const target=path.join(root,'docs/crew/voice-v2/RETAKE-READINESS-RENEWAL.json');
  const fd=fs.openSync(target,'wx',0o600);try{fs.writeFileSync(fd,JSON.stringify(proof,null,2)+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  const pin=fs.openSync(path.join(root,'voice-samples/production-v2/RETAKE-RENEWAL-PROOF.sha256'),'wx',0o600);try{fs.writeFileSync(pin,sha(fs.readFileSync(target)));fs.fsyncSync(pin);}finally{fs.closeSync(pin);}
 }
 console.log(JSON.stringify({valid:true,written:mode==='--write',provider_calls:0,grant_changed:false,consumed_attempts_reset:false}));
}
if(require.main===module)main().catch(()=>{console.error('Renewal rejected; no grant or ledger changed. Existing proof cannot be replaced.');process.exitCode=1;});
