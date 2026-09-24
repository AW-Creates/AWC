const fs=require('fs'),vm=require('vm'),cp=require('child_process'),path=require('path'),crypto=require('crypto');
const root='C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC';
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');let count=0;for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){new vm.Script(match[1]);count++;}
const child=cp.spawn(process.execPath,[path.join(root,'scripts/serve.cjs')],{env:{...process.env,PORT:'4175',HOST:'0.0.0.0'},windowsHide:true});
const checks=[];
(async()=>{try{await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',code=>reject(new Error('Server exit '+code)));});
for(const [method,url,status]of [['GET','/',200],['GET','/index.html',200],['HEAD','/',200],['GET','/favicon.ico',204],['GET','/dist/index.html',404],['GET','/.env',404],['GET','/docs/PROJECT_STATE.md',404],['GET','/node_modules/',404],['POST','/',405]]){const r=await fetch('http://127.0.0.1:4175'+url,{method});const bytes=Buffer.from(await r.arrayBuffer());if(r.status!==status)throw new Error(method+url);if(method==='GET'&&status===200&&crypto.createHash('sha256').update(bytes).digest('hex')!=='941f908cfefcfe2d1a9e47a15af44210ed2ce247fb7b68d56e617d3ed3bb46a3')throw new Error('Served bytes mismatch');checks.push({method,url,status:r.status,bytes:bytes.length});}
console.log(JSON.stringify({inlineScriptsParsed:count,checks}));
}finally{child.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
