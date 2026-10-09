import {createHash,randomUUID} from 'node:crypto';

export const TEMPLATES={
 'home-services':{name:'Home services',niches:['cleaning'],eyebrow:'A clearer path from inquiry to service',cta:'Plan a service request',sections:['Services','Service area','A simpler next step']},
 'real-estate':{name:'Real estate',niches:['real-estate'],eyebrow:'Local expertise. A more useful first conversation.',cta:'Explore your next move',sections:['How we help','Local focus','Start a conversation']},
 'professional-services':{name:'Professional services',niches:['professional-services'],eyebrow:'Expertise made clear. Next steps made simple.',cta:'Discuss your needs',sections:['Services','Who we help','Let’s talk']}
};
export const ROLES=['Customer Experience','Lead Qualification','Scheduling','Support'];
export const CAPABILITIES=['answer_faq','qualify_interest','draft_booking_request','draft_quote_request','draft_handoff'];
export const ROLE_PERMISSIONS={
 'Customer Experience':['answer_faq','qualify_interest','draft_quote_request','draft_handoff'],
 'Lead Qualification':['answer_faq','qualify_interest','draft_handoff'],
 'Scheduling':['answer_faq','draft_booking_request','draft_handoff'],
 'Support':['answer_faq','draft_handoff']
};
export const SIGNALS={experience:20,response:25,workflow:25,reachability:10,evidence:20};
export const DEFAULT_CREW={name:'Jordan',role:'Customer Experience',tone:'Warm, clear and helpful',language:'en-US',voicePreference:'To be selected with the business',permissions:['answer_faq','qualify_interest','draft_handoff'],handoff:{scheduling:'Scheduling',support:'Support',human:'Owner review'}};
export class ValidationError extends Error {constructor(message,status=400){super(message);this.status=status;}}
const fail=m=>{throw new ValidationError(m);};
export const clean=(value,max=600)=>{if(typeof value!=='string'||value.trim().length>max)fail('Check the text length and format.');return value.trim();};
export function publicURL(value){const text=clean(value,1500);if(!text)return '';let url;try{url=new URL(text);}catch{fail('Use a full http or https public source URL.');}if(!['https:','http:'].includes(url.protocol)||url.username||url.password)fail('Use a public web URL without credentials.');return url.href;}
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function crewConfig(value){
 if(!plain(value)||!ROLES.includes(value.role))fail('Choose a supported specialist role.');
 const name=clean(value.name,60);if(!name)fail('Give this specialist its own name.');
 if(!Array.isArray(value.permissions)||value.permissions.some(x=>!ROLE_PERMISSIONS[value.role].includes(x)))fail('This role cannot use one of the requested capabilities.');
 const handoff=value.handoff;if(!plain(handoff)||handoff.scheduling!=='Scheduling'||handoff.support!=='Support'||!clean(handoff.human,80))fail('Configure scheduling, support and owner handoff destinations.');
 return {name,role:value.role,tone:clean(value.tone,160),language:clean(value.language,30),voicePreference:clean(value.voicePreference,160),permissions:[...new Set(value.permissions)],handoff:{scheduling:'Scheduling',support:'Support',human:clean(handoff.human,80)}};
}
export function sources(value){
 if(!Array.isArray(value)||value.length>12)fail('Use up to 12 public source records.');
 const result=value.map(v=>{if(!plain(v))fail('Invalid source.');const id=clean(v.id,60);if(!/^[a-z0-9_-]+$/i.test(id))fail('Use a simple source ID.');const url=publicURL(v.url);if(!url)fail('Every source needs a public web URL.');const capturedAt=clean(v.capturedAt,30);if(!/^\d{4}-\d{2}-\d{2}$/.test(capturedAt)||Number.isNaN(Date.parse(capturedAt)))fail('Use a valid source capture date.');return {id,url,title:clean(v.title,150),excerpt:clean(v.excerpt,3000),capturedAt,captureMethod:'manual-public-source',verified:false};});
 if(new Set(result.map(x=>x.id)).size!==result.length)fail('Source IDs must be unique.');return result;
}
export function facts(value,sourceList){
 if(!plain(value))fail('Invalid business facts.');const ids=new Set(sourceList.map(s=>s.id));
 function item(v,max=500){if(!plain(v))fail('Each fact needs a value and source reference.');const val=clean(v.value,max),sourceId=clean(v.sourceId,60);if(val&&!ids.has(sourceId))fail('Every fact must reference a captured source.');return {value:val,sourceId:val?sourceId:''};}
 if(!Array.isArray(value.services)||value.services.length>8||!Array.isArray(value.faqs)||value.faqs.length>8)fail('Use up to eight services and FAQs.');
 return {about:item(value.about,900),serviceArea:item(value.serviceArea,200),services:value.services.map(v=>item(v,160)).filter(v=>v.value),faqs:value.faqs.map(v=>{if(!plain(v))fail('Invalid FAQ.');const answer=item(v,650);return {...answer,question:clean(v.question,200)};}).filter(v=>v.value&&v.question)};
}
export function score(inputs,reviewed=false){
 if(!plain(inputs))fail('Invalid prospect signals.');const breakdown=Object.entries(SIGNALS).map(([key,weight])=>{const value=inputs[key];if(!Number.isInteger(value)||value<0||value>5)fail('Prospect signals must be whole numbers from 0 to 5.');return {key,value,weight,points:value/5*weight};});
 return {total:Math.round(breakdown.reduce((n,x)=>n+x.points,0)),status:reviewed?'Reviewed evidence':'Provisional',breakdown};
}
export function createProspect(input){
 if(!plain(input))fail('Invalid prospect.');const name=clean(input.name,100);if(!name)fail('Business name is required.');const niche=clean(input.niche,40);const template=Object.entries(TEMPLATES).find(([,t])=>t.niches.includes(niche))?.[0];if(!template)fail('Choose a supported niche.');
 return {id:randomUUID(),name,niche,website:publicURL(input.website||''),objective:clean(input.objective||'',600),nextAction:'Capture and review public business facts',notes:'',stage:'research',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),inputRevision:1,reviewedRevision:0,builtRevision:0,synthetic:input.synthetic===true,template,sources:[],facts:{about:{value:'',sourceId:''},serviceArea:{value:'',sourceId:''},services:[],faqs:[]},signals:{experience:0,response:0,workflow:0,reachability:0,evidence:0},crew:structuredClone(DEFAULT_CREW),artifact:null};
}
export function updateProspect(current,input){
 if(!plain(input))fail('Invalid prospect update.');const p=structuredClone(current);
 for(const key of ['objective','nextAction','notes'])if(key in input)p[key]=clean(input[key],key==='notes'?2000:600);
 if('name' in input){p.name=clean(input.name,100);if(!p.name)fail('Business name required.');}
 if('website' in input)p.website=publicURL(input.website);
 if('template' in input){if(!TEMPLATES[input.template])fail('Unknown template.');p.template=input.template;}
 if('signals' in input){score(input.signals);p.signals=Object.fromEntries(Object.keys(SIGNALS).map(k=>[k,input.signals[k]]));}
 if('sources' in input)p.sources=sources(input.sources);
 if('facts' in input||'sources' in input)p.facts=facts(input.facts||p.facts,p.sources);
 if('crew' in input)p.crew=crewConfig(input.crew);
 p.inputRevision++;p.reviewedRevision=0;p.sources=p.sources.map(s=>({...s,verified:false}));p.stage='research';p.updatedAt=new Date().toISOString();return p;
}
export function reviewProspect(current){
 const p=structuredClone(current);if(!p.sources.length||!p.facts.about.value||!p.facts.services.length)fail('Capture a source, a business summary and at least one service before review.');
 facts(p.facts,p.sources);crewConfig(p.crew);p.reviewedRevision=p.inputRevision;p.sources=p.sources.map(s=>({...s,verified:true}));p.stage='reviewed';p.updatedAt=new Date().toISOString();return p;
}
export const revisionHash=p=>createHash('sha256').update(JSON.stringify({name:p.name,niche:p.niche,template:p.template,revision:p.inputRevision,facts:p.facts,crew:p.crew})).digest('hex');
export function qa(p){return {passed:p.reviewedRevision===p.inputRevision&&p.builtRevision===p.inputRevision&&p.artifact?.inputHash===revisionHash(p),checks:[{label:'Business facts reviewed against captured sources',passed:p.reviewedRevision===p.inputRevision},{label:'Generated concept matches current facts and Crew configuration',passed:p.builtRevision===p.inputRevision&&p.artifact?.inputHash===revisionHash(p)},{label:'No external action tools enabled',passed:p.crew.permissions.every(x=>CAPABILITIES.includes(x))},{label:'Local preview only; noindex is not remote access protection',passed:true}],deployment:{mode:'loopback-only',remotePrivateAccessVerified:false,indexing:'X-Robots-Tag + meta noindex',outreachEnabled:false}};}
export function routeMessage(p,message){
 const result=routeCore(p,message);
 if(result.type.endsWith('-draft')&&!p.crew.permissions.includes(result.requiredCapability||'draft_handoff'))return {type:'permission-denied',role:p.crew.role,name:p.crew.name,answer:'This specialist does not have permission to prepare that draft. Ask the owner to review the configuration. Nobody has been contacted.',externalAction:false};
 return result;
}
function routeCore(p,message){
 const text=clean(message,800);if(!text)fail('Enter a demo question.');const lower=text.toLowerCase();
 const role=p.crew.role;
 const answer=(cap,body)=>p.crew.permissions.includes(cap)?{type:cap.startsWith('draft_')?'human-draft':'answer',role,name:p.crew.name,answer:body,requiredCapability:cap,destination:p.crew.handoff.human,externalAction:false}:{type:'permission-denied',role,name:p.crew.name,answer:'This specialist does not have permission for that task. Ask the owner to review its configuration. Nobody has been contacted.',externalAction:false};
 if(/payment|charge|invoice|refund|password|secret|credit card|medical|legal advice/.test(lower))return {type:'human-draft',role,name:p.crew.name,answer:'That needs a person’s review. This demo cannot take payments, issue invoices or handle sensitive details. No one has been contacted.',destination:p.crew.handoff.human,externalAction:false};
 if(/human|person|manager|complaint|escalat/.test(lower))return answer('draft_handoff','I can prepare a local owner-review draft. Nobody has been contacted.');
 if(/book|schedule|appointment|availability/.test(lower)){
  if(role!=='Scheduling')return {type:'specialist-draft',role,name:p.crew.name,answer:'A Scheduling Specialist would handle that next. This local handoff draft carries the request forward; no calendar or person has been contacted.',destination:'Scheduling',externalAction:false};
  return answer('draft_booking_request','I can prepare your scheduling request for review. This demo has no live calendar and cannot confirm an appointment.');
 }
 if(/support|technical|trouble|issue/.test(lower)&&role!=='Support')return {type:'specialist-draft',role,name:p.crew.name,answer:'A Support Specialist would review that next. This is a local handoff draft, not a live transfer or support ticket.',destination:'Support',externalAction:false};
 if(/quote|price|cost|estimate|proposal/.test(lower))return answer('draft_quote_request','Pricing needs the business’s confirmation. I can prepare a quote-request draft; this is not a price, proposal or accepted quote.');
 const stop=new Set(['what','where','when','does','your','about','offer','have','with','that','this','services','service','could','would','please','request','confirm']);
 const faq=p.facts.faqs.find(f=>{const words=f.question.toLowerCase().split(/\W+/).filter(w=>w.length>3&&!stop.has(w));return lower.includes(f.question.toLowerCase())||words.filter(w=>lower.includes(w)).length>=2;});
 if(faq)return answer('answer_faq',faq.value);
 if(/service|offer|help|what.*do/.test(lower))return answer('answer_faq','Based on the reviewed concept facts: '+p.facts.services.map(s=>s.value).join(', ')+'.');
 if(/area|location|where/.test(lower)&&p.facts.serviceArea.value)return answer('answer_faq',p.facts.serviceArea.value);
 if(/interested|looking for|inquiry|project|need.*help/.test(lower))return answer('qualify_interest','Which of the reviewed services are you interested in: '+p.facts.services.map(s=>s.value).join(', ')+'? A person still confirms fit, scope and availability.');
 if(/name|who.*you|crew/.test(lower))return {type:'answer',role,name:p.crew.name,answer:`I’m ${p.crew.name}, a demo AI ${role} Specialist configured for ${p.name}. This is an original concept, not the business’s official site or a live service.`,externalAction:false};
 return {type:'human-draft',role,name:p.crew.name,answer:'I don’t have a reviewed answer for that. This can be saved as a local owner-review draft. No one is contacted.',destination:p.crew.handoff.human,externalAction:false};
}
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderDemo(p){
 if(p.reviewedRevision!==p.inputRevision)fail('Review current facts and Crew configuration before generating a concept.');
 const e=escapeHTML,t=TEMPLATES[p.template];
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>${e(p.name)} · Private concept</title><link rel="stylesheet" href="/demo.css"><script src="/demo.js" defer></script></head><body data-prospect="${e(p.id)}"><div class="concept-notice">AW Creatives · Original private concept · ${p.synthetic?'Fictional business fixture':'Unofficial business concept'} · No live booking or payments</div><header><strong>${e(p.name)}</strong><a href="#crew">Meet ${e(p.crew.name)}</a></header><main><section class="concept-hero"><p class="eyebrow">${e(t.eyebrow)}</p><h1>${e(p.name)}.<br><em>A better way to begin.</em></h1><p>${e(p.facts.about.value)}</p><a class="button" href="#crew">${e(t.cta)} <span>↗</span></a><small>Illustrative experience built from reviewed facts. Your message stays in the local demo.</small></section><section class="services"><p class="eyebrow">${e(t.sections[0])}</p><h2>What you can explore.</h2><div class="service-grid">${p.facts.services.map((s,i)=>`<article><span>0${i+1}</span><h3>${e(s.value)}</h3><p>Ask our demo specialist about the next step.</p></article>`).join('')}</div></section><section class="area"><p class="eyebrow">${e(t.sections[1])}</p><h2>${e(p.facts.serviceArea.value||'A conversation built around your needs.')}</h2><p>${e(p.objective||'A clearer customer experience, from the first question to the next step.')}</p></section><section id="crew" class="crew"><div><p class="eyebrow">Crew by AW Creatives</p><h2>Meet ${e(p.crew.name)}.<br><em>Your first conversation.</em></h2><p>A demo ${e(p.crew.role)} Specialist shaped around this business concept. Custom name, role, tone and reviewed knowledge—not a copy of Autumn.</p><p class="quiet">${e(p.crew.tone)} · ${e(p.crew.language)}. Voice is not enabled. Handoffs create local drafts; nobody is contacted.</p></div><div class="chat"><div id="messages" role="log" aria-live="polite"><p class="message"><b>${e(p.crew.name)} · AI demo</b><span>Hi! Ask about the reviewed services, service area, or a scheduling request. Please use fictional details and avoid sensitive information.</span></p></div><form id="demo-chat"><label for="question">Your demo question</label><div class="composer"><input id="question" maxlength="800" required placeholder="What services do you offer?"><button>Ask</button></div><p id="chat-status" role="status"></p></form></div></section></main><footer>Concept by A. Wilcher Creatives · Digital experiences, business systems and custom digital teams.<br>Sources were manually reviewed; this concept is not endorsed by the business. No testimonials, revenue claims or invented availability.</footer></body></html>`;
}
