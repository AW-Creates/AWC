import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
import {fixtures} from './fixtures.mjs';
export function openStore(file,{seed=true}={}){
 if(file!==':memory:')mkdirSync(dirname(file),{recursive:true});const db=new DatabaseSync(file);db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS prospects(id TEXT PRIMARY KEY, payload TEXT NOT NULL); CREATE TABLE IF NOT EXISTS handoffs(id TEXT PRIMARY KEY, prospect_id TEXT NOT NULL REFERENCES prospects(id), payload TEXT NOT NULL);');
 const get=id=>{const r=db.prepare('SELECT payload FROM prospects WHERE id=?').get(id);return r?JSON.parse(r.payload):null;};
 const save=p=>{db.prepare('INSERT INTO prospects(id,payload) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').run(p.id,JSON.stringify(p));return p;};
 if(seed&&db.prepare('SELECT COUNT(*) n FROM prospects').get().n===0)fixtures().forEach(save);
 return {db,get,save,list(){return db.prepare('SELECT payload FROM prospects ORDER BY rowid').all().map(r=>JSON.parse(r.payload));},handoffs(id){return db.prepare('SELECT payload FROM handoffs WHERE prospect_id=? ORDER BY rowid DESC').all(id).map(r=>JSON.parse(r.payload));},handoff(id,result,message){const h={id:randomUUID(),prospectId:id,createdAt:new Date().toISOString(),type:result.type,destination:result.destination||'Owner review',request:message,status:'local-draft',contacted:false,externalAction:false};db.prepare('INSERT INTO handoffs(id,prospect_id,payload) VALUES(?,?,?)').run(h.id,id,JSON.stringify(h));return h;},close(){db.close();}};
}
