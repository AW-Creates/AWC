// Local draft preview only: synthetic data, no email or AI credentials.
import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import worker from '../dist/server/index.js';
const db=new DatabaseSync(':memory:');
for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')))db.exec(readFileSync('drizzle/'+file,'utf8'));
const DB={prepare(sql){let args=[];return {bind(...a){args=a;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return db.prepare(sql).run(...args);}};},async batch(items){return Promise.all(items.map(x=>x.run()));}};
const env={DB,SESSION_SECRET:'local-preview-only',LOCAL_PREVIEW:'true',AI_ENABLED:'false',OWNER_EMAIL:'owner@example.test'};
createServer(async(req,res)=>{try{
 const parts=[];for await(const part of req)parts.push(part);
 const method=req.method||'GET';const request=new Request('http://127.0.0.1:4191'+req.url,{method,headers:req.headers,...(!['GET','HEAD'].includes(method)?{body:Buffer.concat(parts)}:{})});
 const response=await worker.fetch(request,env,{waitUntil(p){p.catch(()=>{});}});
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
}catch{res.writeHead(500);res.end('Local preview error');}}).listen(4191,'127.0.0.1',()=>console.log('Draft preview: http://127.0.0.1:4191 — synthetic data only, no paid providers'));
