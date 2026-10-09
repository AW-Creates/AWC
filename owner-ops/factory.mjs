import {createProspect,updateProspect,reviewProspect,renderDemo,revisionHash,qa,escapeHTML,ValidationError} from './model.mjs';
import {resolveRoute} from '../website-receptionist/src/crew-routing.mjs';
export const THEMES=['editorial-luxury','modern-architectural','personal-brand'];
export const APPROVED_ASSETS=['/estate-courtyard.webp','/estate-neighborhood.webp','/showcase-estate.png','/showcase-interior.png'];
const fail=m=>{throw new ValidationError('Factory: '+m);};
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const text=(v,max=2000)=>typeof v==='string'&&v.length<=max;
const keys=(v,allowed)=>{if(!object(v)||Object.keys(v).some(k=>!allowed.includes(k)))fail('Unknown or invalid configuration field.');};
const secret=/(?:sk-[A-Za-z0-9]{12,}|(?:api[_ -]?key|password|secret|token|authorization)\s*[:=]\s*\S+|-----BEGIN .*PRIVATE KEY-----)/i;
export function validateConfig(input,{now=Date.now()}={}){
 const c=structuredClone(input);keys(c,['schema_version','demo_id','business','niche','sources','facts','branding','assets','specialist','disclosure','visual_direction','expires_at','status','analytics_namespace','guardrails','channels','actions','operator_review']);
 if(secret.test(JSON.stringify(c)))fail('Secrets are forbidden.');
 if(c.schema_version!==1||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(c.demo_id||''))fail('Use schema version 1 and a stable UUID demo_id.');
 keys(c.business,['name','website','fictional']);if(!text(c.business.name,100)||!c.business.name.trim()||typeof c.business.fictional!=='boolean')fail('Business identity required.');
 if(c.niche!=='real-estate'||!THEMES.includes(c.visual_direction))fail('Choose a supported real-estate direction.');
 if(c.analytics_namespace!=='demo_'+c.demo_id)fail('Analytics namespace must match demo_id.');
 if(!['active','revoked'].includes(c.status)||!Number.isFinite(Date.parse(c.expires_at))||Date.parse(c.expires_at)<=now||Date.parse(c.expires_at)>now+31*86400000)fail('Use active/revoked status and expiry within 31 days.');
 if(!Array.isArray(c.sources)||!c.sources.length||c.sources.length>12)fail('Provide public source records.');
 const sourceIds=new Set();for(const s of c.sources){keys(s,['id','url','title','excerpt','capturedAt','kind']);if(!text(s.id,60)||!s.id||sourceIds.has(s.id)||!text(s.excerpt,3000)||!['public','fictional'].includes(s.kind))fail('Invalid source record.');sourceIds.add(s.id);if(!/^\d{4}-\d{2}-\d{2}$/.test(s.capturedAt||'')||!Number.isFinite(Date.parse(s.capturedAt))||new Date(s.capturedAt).toISOString().slice(0,10)!==s.capturedAt||Date.parse(s.capturedAt)>now)fail('Valid past source capture date required.');let u;try{u=new URL(s.url);}catch{fail('Invalid source URL.');}if(!['http:','https:'].includes(u.protocol)||u.username||u.password||/^(localhost|127\.|0\.|\[|10\.|192\.168\.|169\.254\.)/.test(u.hostname)||/^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname))fail('Sources must be credential-free public URLs.');if(s.kind==='fictional'&&(!c.business.fictional||!u.hostname.endsWith('.example')))fail('Fictional source requires .example and fictional business.');if(c.business.fictional&&s.kind!=='fictional')fail('Proof fixtures must use declared fictional sources.');}
 if(!c.business.fictional&&!c.sources.some(s=>s.kind==='public'&&s.excerpt.includes(c.business.name)&&new URL(s.url).origin===new URL(c.business.website).origin))fail('Real business identity/website requires source-bound public evidence.');
 keys(c.facts,['about','serviceArea','services','faqs','hours','team']);
 const omitted=[];const fact=(f,label)=>{keys(f,['value','sourceId','review','question']);if(!text(f.value,900)||!['approved','uncertain','unsupported'].includes(f.review))fail('Invalid fact.');if(f.review!=='approved'){omitted.push(label);return null;}const s=c.sources.find(s=>s.id===f.sourceId);if(!s||!s.excerpt.includes(f.value)||!f.value)fail('Approved fact must occur in its source excerpt: '+label);if(f.question!==undefined&&!text(f.question,200))fail('Invalid FAQ question.');return f;};
 const approved={};for(const k of ['about','serviceArea'])approved[k]=fact(c.facts[k],k)||{value:'',sourceId:''};for(const k of ['services','faqs','hours','team']){if(!Array.isArray(c.facts[k])||c.facts[k].length>8)fail('Limit fact collections to eight.');approved[k]=c.facts[k].map((f,i)=>fact(f,k+'.'+i)).filter(Boolean);}
 if(!approved.about.value||!approved.services.length)fail('Approved summary and service required.');
 keys(c.operator_review,['confirmed','reviewer']);if(c.operator_review.confirmed!==true||!text(c.operator_review.reviewer,100)||!c.operator_review.reviewer)fail('Operator source/configuration review required.');
 if(!text(c.disclosure,600)||!/concept|demo/i.test(c.disclosure)||!/AI|automated/i.test(c.disclosure))fail('Disclosure must identify concept and AI specialist.');
 keys(c.specialist,['id','name','role','personality','permissions','tools','handoffs']);if(c.specialist.id!=='demo_'+c.demo_id+'_concierge'||!text(c.specialist.personality,160)||!Array.isArray(c.specialist.tools)||JSON.stringify(c.specialist.tools)!==JSON.stringify(c.specialist.permissions))fail('Specialist identity/tools must be scoped to demo.');
 keys(c.channels,['chat','talk_here','call_me']);if(c.channels.chat!==true||c.channels.talk_here!=='disabled'||c.channels.call_me!=='disabled')fail('Factory defaults require chat and disabled paid channels.');
 keys(c.actions,['booking','payments']);if(c.actions.booking!==false||c.actions.payments!==false)fail('Live booking/payments require a separate approved implementation.');
 keys(c.guardrails,['max_sessions','max_chat_requests','max_session_seconds','paid_budget_usd','max_paid_sessions','private_access']);if(!Number.isInteger(c.guardrails.max_sessions)||c.guardrails.max_sessions<1||c.guardrails.max_sessions>20||!Number.isInteger(c.guardrails.max_chat_requests)||c.guardrails.max_chat_requests<1||c.guardrails.max_chat_requests>40||!Number.isInteger(c.guardrails.max_session_seconds)||c.guardrails.max_session_seconds<30||c.guardrails.max_session_seconds>900||c.guardrails.paid_budget_usd!==0||c.guardrails.max_paid_sessions!==0||c.guardrails.private_access!=='loopback-only')fail('Finite local-only guardrails required.');
 if(!Array.isArray(c.assets)||c.assets.length>8)fail('Invalid assets.');for(const a of c.assets){keys(a,['path','kind','label']);if(!['concept','generated'].includes(a.kind)||!text(a.label,150)||!/concept|generated/i.test(a.label)||!APPROVED_ASSETS.includes(a.path))fail('Use approved local assets labeled concept/generated.');}if(!['/estate-courtyard.webp','/estate-neighborhood.webp'].every(path=>c.assets.some(a=>a.path===path)))fail('Configure the two shared concept image assets.');
 keys(c.branding,['mode','logo','surface']);if(c.branding.logo)keys(c.branding.logo,c.branding.logo.kind==='builtin'?['kind','asset']:['kind','hash','width','height']);keys(c.specialist.handoffs,['scheduling','support','human']);
 const p=createProspect({name:c.business.name,niche:c.niche,website:c.business.website,synthetic:c.business.fictional});updateProspect(p,{sources:c.sources,facts:approved,branding:c.branding,crew:{name:c.specialist.name,role:c.specialist.role,tone:c.specialist.personality,language:'en-US',voicePreference:'Disabled for factory proofs',permissions:c.specialist.permissions,handoff:c.specialist.handoffs}});
 return {config:c,approved,omitted};
}
export function prospectFromConfig(input,options={}){
 const {config:c,approved,omitted}=validateConfig(input,options);let p=createProspect({name:c.business.name,niche:c.niche,website:c.business.website,synthetic:c.business.fictional});p.id=c.demo_id;
 p=reviewProspect(updateProspect(p,{sources:c.sources,facts:approved,branding:c.branding,crew:{name:c.specialist.name,role:c.specialist.role,tone:c.specialist.personality,language:'en-US',voicePreference:'Disabled for factory proofs',permissions:c.specialist.permissions,handoff:c.specialist.handoffs}}));
 p.demoConfig=c;p.themeId=c.visual_direction;p.status=c.status;p.expiresAt=c.expires_at;p.analyticsNamespace=c.analytics_namespace;p.omittedFacts=omitted;return p;
}
export function preflight(p,html){
 const checks=[];const check=(label,passed)=>checks.push({label,passed:!!passed});let route=null;try{validateConfig(p.demoConfig);route=resolveRoute({surface:'private_demo',prospect:p,reviewed:true});}catch{}
 check('Identity, provenance, expiry and finite guardrails',route&&route.demo_id===p.id&&route.business===p.name&&p.name===p.demoConfig.business.name&&p.id===p.demoConfig.demo_id&&p.themeId===p.demoConfig.visual_direction&&p.expiresAt===p.demoConfig.expires_at&&p.status===p.demoConfig.status);
 check('Specialist role and tools',route&&route.specialist.name===p.crew.name&&JSON.stringify(route.specialist.allowed_tools)===JSON.stringify(p.crew.permissions));
 check('Analytics isolation',route?.analytics_namespace===p.demoConfig.analytics_namespace);
 check('Reviewed artifact',qa(p).passed);
 check('Noindex and responsive viewport',/name="robots" content="noindex/.test(html)&&/name="viewport"/.test(html));
 check('Theme selected',THEMES.includes(p.themeId)&&html.includes(p.themeId));
 check('Concept disclosure',/concept/i.test(html)&&html.includes(escapeHTML(p.demoConfig.disclosure)));
 check('Paid channels disabled',p.demoConfig.channels.talk_here==='disabled'&&p.demoConfig.channels.call_me==='disabled');
 check('No secrets',!secret.test(html)&&!secret.test(JSON.stringify(p.demoConfig)));
 return {passed:checks.every(c=>c.passed),checks,omitted:p.omittedFacts,route:p.artifact?.previewPath,visualReviewRequired:true};
}
export function buildDemo(input){const p=prospectFromConfig(input);const html=renderDemo(p);p.builtRevision=p.inputRevision;p.artifact={generatedAt:new Date().toISOString(),inputHash:revisionHash(p),previewPath:'/demo/'+p.id,access:'loopback-only',remoteURL:null};p.stage='concept-ready';const report=preflight(p,html);if(!report.passed)fail('Preflight failed: '+report.checks.filter(c=>!c.passed).map(c=>c.label).join(', '));return {prospect:p,html,report};}
