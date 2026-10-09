import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {dirname,join,resolve,relative,isAbsolute} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {openStore} from '../store.mjs';
import {buildDemo} from '../factory.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),value=flag=>args[args.indexOf(flag)+1];
try{
 if(args.some((a,i)=>a.startsWith('--')&&!['--proofs','--config','--data-dir','--revoke'].includes(a)))throw Error('Unknown option.');
 if(Number(args.includes('--proofs'))+Number(args.includes('--config'))+Number(args.includes('--revoke'))!==1)throw Error('Use --proofs, --config FILE, or --revoke DEMO_ID; optional --data-dir DIR.');
 const dataDir=resolve(args.includes('--data-dir')?value('--data-dir'):join(root,'.local'));
 const within=(base,target)=>{const rel=relative(base,target);return rel!==''&&!rel.startsWith('..')&&!isAbsolute(rel);};
 if(!within(tmpdir(),dataDir)&&!within(join(root,'.local'),dataDir)&&dataDir!==join(root,'.local'))throw Error('Data directory must be owner-ops/.local (or its child) or an OS temporary directory child; tracked source folders are forbidden.');
 if(args.includes('--revoke')){const id=value('--revoke');const store=openStore(join(dataDir,'owner-ops.sqlite'),{seed:false});try{const p=store.get(id);if(!p?.demoConfig)throw Error('Factory demo not found.');p.status='revoked';p.demoConfig.status='revoked';store.save(p);console.log(JSON.stringify({demo_id:id,status:'revoked',route:'/demo/'+id},null,2));}finally{store.close();}}
 else{
  const files=args.includes('--proofs')?readdirSync(join(root,'proofs')).filter(f=>f.endsWith('.json')).sort().map(f=>join(root,'proofs',f)):[resolve(value('--config'))];
  const start=performance.now();const results=files.map(f=>buildDemo(JSON.parse(readFileSync(f,'utf8'))));
  if(new Set(results.map(r=>r.prospect.id)).size!==results.length)throw Error('Duplicate demo IDs.');
  // Validate and render the full batch before any store/file mutation.
  const store=openStore(join(dataDir,'owner-ops.sqlite'),{seed:false});try{mkdirSync(join(dataDir,'demos'),{recursive:true});for(const r of results){writeFileSync(join(dataDir,'demos',r.prospect.id+'.html'),r.html);store.save(r.prospect);}const summary={generatedAt:new Date().toISOString(),elapsed_ms:Math.round(performance.now()-start),paid_spend_usd:0,dataDir,demos:results.map(r=>({demo_id:r.prospect.id,business:r.prospect.name,theme:r.prospect.themeId,route:r.report.route,expiry:r.prospect.expiresAt,specialist:r.prospect.crew.name,preflight:r.report}))};writeFileSync(join(dataDir,'factory-summary.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));}finally{store.close();}
 }
}catch(e){console.error(e.message);process.exitCode=1;}
