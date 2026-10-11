'use strict';
const ROLES=['concierge','sales','scheduling','support','billing','implementation','retention'];
function takeProfile(role,take='original'){
 if(!ROLES.includes(role)||!['original','retake'].includes(take)||take==='retake'&&!['concierge','sales'].includes(role))throw Error('Only exact original or authorized concierge/sales retake selection allowed');
 return {take,role,captureName:role+(take==='retake'?'-retake':''),ledgerFile:take==='retake'?'RETAKE-ATTEMPTS.json':'PAID-ATTEMPTS.json',allowanceId:take==='retake'?'awc_autumn_owen_fresh_demos_20261011':'awc_seven_custom_voice_demos_20261011'};
}
function assertSettledAttempt(profile,ledger,binding){
 const a=ledger.allowance;
 if(a?.id!==profile.allowanceId||a.seconds!==150||a.perAttemptUsd!==1)throw Error('Selected take allowance mismatch');
 if(profile.take==='retake'&&(a.attempts!==2||a.totalUsd!==2||!Array.isArray(ledger.attempts)||ledger.attempts.length>2||new Set(ledger.attempts.map(x=>x.role)).size!==ledger.attempts.length||ledger.attempts.some(x=>!['concierge','sales'].includes(x.role))))throw Error('Immutable two-role/two-attempt/$2 retake ledger required');
 const matches=ledger.attempts?.filter(x=>x.role===profile.role);if(matches?.length!==1)throw Error('Exactly one settled selected role attempt required');const attempt=matches[0];
 if(attempt.state!=='reconciled'||!/^call_[A-Za-z0-9]+$/.test(attempt.call_id)||!Number.isFinite(attempt.duration_ms)||attempt.duration_ms<=0||attempt.duration_ms>150000||!Number.isFinite(attempt.cost_usd)||attempt.cost_usd<0||attempt.cost_usd>1||attempt.agent_id!==binding?.agent_id||attempt.agent_version!==binding?.agent_version||attempt.voice_id!==binding?.voice_id)throw Error('Matched reconciled pinned identity within 150 seconds/$1 required');return attempt;
}
module.exports={takeProfile,assertSettledAttempt};
