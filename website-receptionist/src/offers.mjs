export const DRAFT_NOTICE = 'REVIEW DRAFT — unpublished proposed USD planning ranges. AWC must confirm scope and price in a written proposal; this is not a quote, booking or purchase.';
export const OFFERS = Object.freeze({
 clarity: {name:'Clarity Session',min:195,max:195,scope:'60-minute session and written prioritized action plan',timing:'Written plan in 3–5 business days after the session and completed intake; session date requires agreement',website:false},
 launch: {name:'Launch Website',min:1500,max:2500,scope:'Up to 5 pages, responsive design, contact inquiry form and 2 revision rounds',timing:'2–4 weeks after content readiness, approvals and agreed start',website:true},
 guide: {name:'Website + Inquiry Guide',min:2500,max:4000,scope:'Launch Website plus approved FAQs up to 30 topics, scoped deterministic estimator, email notification and private inbox',timing:'3–5 weeks after content readiness, approved FAQ rules and agreed start',website:true},
 workflow: {name:'Workflow Sprint',min:900,max:1800,scope:'One bounded workflow, at most 2 validated integrations and 2 revision rounds; feasibility first',timing:'1–3 weeks after feasibility, required access and agreed start',website:false}
});
export const CARE = 'Optional proposed care plan: $149/month, explicitly opt-in, up to 1 hour of minor updates and a monthly form check. No automatic enrollment, SLA, 24/7 support, unlimited work or vendor fees included.';
export const EXCLUSIONS = ['Domain, hosting, vendor subscriptions, third-party usage costs and applicable taxes or fees are separate.', 'Brand identity, e-commerce, custom applications, voice/phone, generative AI, calendar booking and payments require individual scope; they are not included in these estimates.', 'Optional care is separate and never added automatically.'];
export function estimate(input) {
 if(!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).some(k=>!['package','extraPages','copyPages'].includes(k)))throw new RangeError('Choose a supported package and valid page counts.');
 if(typeof input.package!=='string' || !Object.hasOwn(OFFERS,input.package))throw new RangeError('This project needs individual scoping. Choose a listed package.');
 const offer=OFFERS[input.package];const extraPages=input.extraPages??0,copyPages=input.copyPages??0;
 for(const value of [extraPages,copyPages])if(!Number.isInteger(value)||value<0||value>5)throw new RangeError('Page counts must be whole numbers from 0 to 5.');
 if(!offer.website&&(extraPages||copyPages))throw new RangeError('Page additions and copy help apply only to website packages.');
 const items=[{label:offer.name,min:offer.min,max:offer.max}];
 if(extraPages)items.push({label:extraPages+' extra pages',min:extraPages*150,max:extraPages*250});
 if(copyPages)items.push({label:'Copy help for '+copyPages+' pages',min:copyPages*100,max:copyPages*150});
 const min=items.reduce((n,x)=>n+x.min,0),max=items.reduce((n,x)=>n+x.max,0);
 const assumptions=[offer.scope,offer.timing,'Client supplies approved content, images and rights; additional scope or revision rounds require a revised proposal.', 'Additions may change timing; the studio confirms compatibility and availability.'];
 const range=(a,b)=>a===b?'$'+a:'$'+a+'–$'+b;
 const summary=[DRAFT_NOTICE,offer.name+': '+range(min,max),...items.map(x=>x.label+': '+range(x.min,x.max)),...assumptions,...EXCLUSIONS].join('\n');
 return {draft:true,currency:'USD',package:input.package,name:offer.name,min,max,items,assumptions,exclusions:EXCLUSIONS,notice:DRAFT_NOTICE,summary};
}
export function offerHTML(){return Object.entries(OFFERS).map(([id,o])=>`<article class="offer-card"><h3>${o.name}</h3><p class="offer-price">${o.min===o.max?'$'+o.min+' proposed session amount':'$'+o.min+'–$'+o.max+' proposed range'}</p><p>${o.scope}.</p><p>${o.timing}.</p><a href="#planning-estimate" data-offer="${id}">Explore this draft scope →</a></article>`).join('');}
