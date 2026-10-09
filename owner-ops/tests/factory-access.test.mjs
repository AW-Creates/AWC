import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {openStore} from '../store.mjs';
import {factoryAccess} from '../factory-access.mjs';
import {buildDemo} from '../factory.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const config=()=>JSON.parse(readFileSync(join(root,'proofs/1-editorial-luxury.json'),'utf8'));
test('Finite chat caps persist, cookies bind to demo and revision, stale sessions expire',()=>{
 const dir=mkdtempSync(join(tmpdir(),'awc-access-'));let store;
 try{
  let c=config();c.guardrails.max_sessions=1;c.guardrails.max_chat_requests=1;const p=buildDemo(c).prospect;
  store=openStore(join(dir,'test.sqlite'),{seed:false});let a=factoryAccess(store);const cookie=a.visit(p,'');assert.match(cookie,/HttpOnly; SameSite=Strict/);assert.equal(a.visit(p,cookie),null);a.message(p,cookie);assert.throws(()=>a.message(p,cookie),/finite request limit/);
  assert.throws(()=>a.visit(p,''),/finite session limit/);
  store.close();store=openStore(join(dir,'test.sqlite'),{seed:false});a=factoryAccess(store);assert.throws(()=>a.message(p,cookie),/finite request limit/);assert.throws(()=>a.visit(p,''),/finite session limit/);
  assert.throws(()=>a.message({...p,id:'other'},cookie),/valid private chat session/);
  assert.throws(()=>a.message({...p,inputRevision:p.inputRevision+1},cookie),/valid private chat session/);
  store.db.prepare('UPDATE factory_sessions SET expires=0').run();assert.throws(()=>a.message(p,cookie),/valid private chat session/);assert.throws(()=>a.visit(p,cookie),/finite session limit/);
 }finally{store?.close();assert.equal(dirname(resolve(dir)),resolve(tmpdir()));rmSync(dir,{recursive:true});}
});
