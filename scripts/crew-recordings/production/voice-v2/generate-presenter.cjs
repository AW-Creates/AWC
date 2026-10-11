// Local Voicebox only. Prepare presenter inputs before reserving any Retell call.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../../..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const scripts=read(path.join(root,'docs/crew/voice-v2/PRESENTER-TURNS.json'));
const profile=read(path.join(root,'docs/crew/voice-v2/VOICEBOX-PROFILES.json')).profiles.find(p=>p.role==='Demonstration presenter');
if(!profile)throw Error('Accepted presenter profile missing');
const jobs=Object.entries(scripts).flatMap(([role,texts])=>texts.map((text,index)=>({role,index,text,profile_id:profile.profile_id,script_sha256:crypto.createHash('sha256').update(text).digest('hex')})));
const output=path.join(root,'voice-samples/production-v2/presenter');
async function api(endpoint,options){const r=await fetch('http://127.0.0.1:17493'+endpoint,{...options,signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Local Voicebox HTTP '+r.status);return r.json();}
async function main(){
if(!process.argv.includes('--generate')){console.log(JSON.stringify({mode:'plan',roles:Object.keys(scripts),clips:jobs.length,profile:profile.name,output,cloud_calls:0,spend:0}));return;}
const health=await api('/health');if(!health.model_loaded||!health.model_downloaded||health.model_size!=='1.7B')throw Error('Existing local Qwen1.7B model must be ready; no automatic model download');
fs.mkdirSync(output,{recursive:true});const ledgerPath=path.join(output,'QUESTIONS.json');
const ledger=fs.existsSync(ledgerPath)?read(ledgerPath):{profile_id:profile.profile_id,engine:'qwen',model_size:'1.7B',items:[],spend:0,cloud_calls:0};
const save=()=>fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
if(ledger.profile_id!==profile.profile_id)throw Error('Presenter mapping changed; review required');
for(const job of jobs){
let item=ledger.items.find(x=>x.role===job.role&&x.index===job.index);
if(item&&item.script_sha256!==job.script_sha256)throw Error('Saved question differs from current plan; review required');
if(!item){item={...job,status:'reserved'};ledger.items.push(item);save();const generation=await api('/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({profile_id:job.profile_id,text:job.text,language:'en',seed:42,engine:'qwen',model_size:'1.7B',personality:false})});item.id=generation.id;item.status=generation.status;save();}
if(!item.id)throw Error('Unresolved generation reservation; inspect local history, no automatic retry');
const deadline=Date.now()+20*60*1000;
while(item.status!=='completed'){const status=await api('/history/'+item.id);item.status=status.status;item.duration=status.duration;save();if(['failed','cancelled'].includes(item.status))throw Error('Question generation failed; no retry');if(Date.now()>deadline)throw Error('Generation still unresolved; inspect before resuming');if(item.status!=='completed')await new Promise(r=>setTimeout(r,5000));}
const file=path.join(output,`${job.role}-${job.index+1}.wav`);
if(!fs.existsSync(file)){const response=await fetch('http://127.0.0.1:17493/audio/'+item.id);if(!response.ok)throw Error('Local generated audio unavailable');fs.writeFileSync(file,Buffer.from(await response.arrayBuffer()));}
item.wavPath=file;item.audio_sha256=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');save();console.log(`${job.role} question ${job.index+1}: ready`);
}
ledger.completed_at=new Date().toISOString();save();console.log('All presenter question inputs saved privately; listening and capture preflight still required');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
