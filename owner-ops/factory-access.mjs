import {randomBytes,createHash} from 'node:crypto';
import {ValidationError,revisionHash} from './model.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
export function factoryAccess(store){
 const db=store.db;
 db.exec('CREATE TABLE IF NOT EXISTS factory_sessions(token TEXT PRIMARY KEY,demo_id TEXT NOT NULL,revision_hash TEXT NOT NULL,expires INTEGER NOT NULL,messages INTEGER NOT NULL DEFAULT 0)');
 const name=p=>'factory_'+p.id.replaceAll('-','');
 const token=(p,cookies)=>cookies.split(';').map(x=>x.trim()).find(x=>x.startsWith(name(p)+'='))?.slice(name(p).length+1)||'';
 function current(p,cookies){const t=token(p,cookies);if(!/^[A-Za-z0-9_-]{43}$/.test(t))return null;const row=db.prepare('SELECT * FROM factory_sessions WHERE token=? AND demo_id=?').get(hash(t),p.id);return row&&row.revision_hash===revisionHash(p)&&row.expires>Date.now()?row:null;}
 function visit(p,cookies){
  if(current(p,cookies))return null;
  const g=p.demoConfig.guardrails;const t=randomBytes(32).toString('base64url');
  db.exec('BEGIN IMMEDIATE');try{const count=db.prepare('SELECT COUNT(*) n FROM factory_sessions WHERE demo_id=?').get(p.id).n;if(count>=g.max_sessions)throw new ValidationError('This demo has reached its finite session limit. Operator review is required.',429);
   const expires=Math.min(Date.now()+g.max_session_seconds*1000,Date.parse(p.expiresAt));db.prepare('INSERT INTO factory_sessions(token,demo_id,revision_hash,expires) VALUES(?,?,?,?)').run(hash(t),p.id,revisionHash(p),expires);db.exec('COMMIT');
   return `${name(p)}=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.max(1,Math.floor((expires-Date.now())/1000))}`;
  }catch(e){db.exec('ROLLBACK');throw e;}
 }
 function message(p,cookies){const row=current(p,cookies);if(!row)throw new ValidationError('Open this demo to start a valid private chat session.',401);
  const result=db.prepare('UPDATE factory_sessions SET messages=messages+1 WHERE token=? AND messages<? AND expires>?').run(row.token,p.demoConfig.guardrails.max_chat_requests,Date.now());if(!result.changes)throw new ValidationError('This chat has reached its finite request limit. No automatic renewal.',429);
 }
 return {visit,message};
}
