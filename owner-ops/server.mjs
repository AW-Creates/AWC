import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {dirname,join,resolve} from 'node:path';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {openStore} from './store.mjs';
import {createProspect,updateProspect,reviewProspect,score,qa,renderDemo,routeMessage,revisionHash,ValidationError} from './model.mjs';
const root=dirname(fileURLToPath(import.meta.url));
export function createOwnerServer({dataDir=join(root,'.local'),seed=true}={}){
 const store=openStore(join(dataDir,'owner-ops.sqlite'),{seed});mkdirSync(join(dataDir,'demos'),{recursive:true});
 const server=createServer(async(req,res)=>{
  const origin='http://127.0.0.1:'+server.address().port;
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  const respond=(code,data,type='application/json; charset=utf-8')=>{res.writeHead(code,{'Content-Type':type});res.end(type.startsWith('application/json')?JSON.stringify(data):data);};
  try{
   if(req.headers.host!=='127.0.0.1:'+server.address().port)throw new ValidationError('Open the loopback address printed by the owner workbench.',403);
   const url=new URL(req.url,origin),parts=url.pathname.split('/').filter(Boolean);const method=req.method;
   if(url.pathname.startsWith('/api/')&&(req.headers['sec-fetch-site']==='cross-site'||(req.headers.origin&&req.headers.origin!==origin)))throw new ValidationError('Use the local owner workbench.',403);
   const assets={'/':'index.html','/app.js':'app.js','/app.css':'app.css','/demo.js':'demo.js','/demo.css':'demo.css'};
   if(method==='GET'&&assets[url.pathname]){const f=assets[url.pathname];return respond(200,readFileSync(join(root,'public',f)),f.endsWith('.js')?'text/javascript; charset=utf-8':f.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');}
   if(method==='GET'&&url.pathname==='/robots.txt')return respond(200,'User-agent: *\nDisallow: /\n','text/plain');
   if(parts[0]==='demo'&&parts.length===2&&method==='GET'){
    const p=store.get(parts[1]);if(!p?.artifact)throw new ValidationError('Generate a reviewed concept first.',404);if(!qa(p).passed)throw new ValidationError('This concept is stale. Review and regenerate the current configuration.',409);
    return respond(200,readFileSync(join(dataDir,'demos',p.id+'.html')),'text/html; charset=utf-8');
   }
   if(parts[0]!=='api'||parts[1]!=='prospects')throw new ValidationError('Not found.',404);
   if(method==='GET'&&parts.length===2)return respond(200,{prospects:store.list().map(p=>({...p,score:score(p.signals,p.reviewedRevision===p.inputRevision),qa:qa(p)}))});
   if(method==='GET'&&parts.length===3&&parts[2]==='export'){res.setHeader('Content-Disposition','attachment; filename="awc-prospect-workspaces.json"');return respond(200,{schemaVersion:1,exportedAt:new Date().toISOString(),deployment:'local-only',prospects:store.list().map(p=>({...p,handoffs:store.handoffs(p.id)}))});}
   if(method==='GET'&&parts.length===3){const p=store.get(parts[2]);if(!p)throw new ValidationError('Prospect not found.',404);return respond(200,{...p,score:score(p.signals,p.reviewedRevision===p.inputRevision),qa:qa(p),handoffs:store.handoffs(p.id)});}
   if(!['POST','PATCH'].includes(method))throw new ValidationError('Method not allowed.',405);
   if(req.headers.origin!==origin||req.headers['x-owner-action']!=='local-workbench'||!req.headers['content-type']?.startsWith('application/json'))throw new ValidationError('Use a same-origin JSON owner action.',403);
   let bytes=0,body='';for await(const chunk of req){bytes+=chunk.length;if(bytes>32000)throw new ValidationError('Request is too large.',413);body+=chunk;}
   let input;try{input=JSON.parse(body);}catch{throw new ValidationError('Invalid JSON.');}
   if(input===null||typeof input!=='object'||Array.isArray(input))throw new ValidationError('Use a JSON object.');
   if(parts.length===2&&method==='POST')return respond(201,store.save(createProspect(input)));
   const p=store.get(parts[2]);if(!p)throw new ValidationError('Prospect not found.',404);
   if(parts.length===3&&method==='PATCH'){if(input.expectedRevision!==p.inputRevision)throw new ValidationError('This workspace changed. Refresh before saving.',409);return respond(200,store.save(updateProspect(p,input)));}
   const action=parts[3];
   if(parts.length!==4||method!=='POST')throw new ValidationError('Not found.',404);
   if(['review','generate'].includes(action)&&input.expectedRevision!==p.inputRevision)throw new ValidationError('This workspace changed. Refresh before continuing.',409);
   if(action==='review'){if(input.confirmed!==true)throw new ValidationError('Confirm manual source and configuration review.');return respond(200,store.save(reviewProspect(p)));}
   if(action==='generate'){
    const html=renderDemo(p);const inputHash=revisionHash(p);writeFileSync(join(dataDir,'demos',p.id+'.html'),html);p.builtRevision=p.inputRevision;p.artifact={generatedAt:new Date().toISOString(),inputHash,previewPath:'/demo/'+p.id,access:'loopback-only',remoteURL:null};p.stage='concept-ready';store.save(p);return respond(200,{prospect:p,qa:qa(p)});
   }
   if(action==='chat'){
    if(!qa(p).passed)throw new ValidationError('Generate the current reviewed concept before trying its specialist.',409);
    const result=routeMessage(p,input.message);const handoff=result.type.endsWith('-draft')?store.handoff(p.id,result,input.message):null;return respond(200,{...result,handoff});
   }
   throw new ValidationError('Not found.',404);
  }catch(e){respond(e.status||500,{error:e instanceof ValidationError?e.message:'Local workbench error. No external action was attempted.'});}
 });
 return {server,store,close:()=>new Promise(r=>server.close(()=>{store.close();r();}))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.OWNER_OPS_PORT||4186);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Use a local port from 1024 to 65535.');
 const app=createOwnerServer({dataDir:process.env.OWNER_OPS_DATA_DIR?resolve(process.env.OWNER_OPS_DATA_DIR):join(root,'.local')});app.server.listen(port,'127.0.0.1',()=>console.log('AWC Owner Workbench: http://127.0.0.1:'+port+' — local only; synthetic examples; no paid providers or outreach.'));
}
