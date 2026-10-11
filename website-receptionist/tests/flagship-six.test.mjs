import test from 'node:test';
import assert from 'node:assert/strict';
import {FLAGSHIP,resolveRoute,publicGuideResponse,handoff,activeRole} from '../src/crew-routing.mjs';
test('seven grounded identities explain role, example and permission boundaries',()=>{
 assert.equal(Object.keys(FLAGSHIP.specialists).length,7);
 for(const role of Object.keys(FLAGSHIP.specialists)){
  const route=resolveRoute({role,prospect:{name:'Cedar Lane',crew:{name:'Ellis'}}});
  assert.equal(route.business,'A. Wilcher Creatives');
  const answer=publicGuideResponse(role,'Introduce yourself',()=> 'Public guidance').answer;
  assert.match(answer,/automated/);assert.match(answer,/customized/);assert.ok(answer.includes(route.specialist.display_name));
  assert.doesNotMatch(answer,/Cedar Lane|BrightHome/);
  if(role!=='concierge'){assert.equal(route.specialist.channel_permissions.web_voice,false);assert.match(answer,/cannot access/);}
 }
});
test('all authorized chat handoff loops are bounded and opt-out clears context',()=>{
 for(const sourceRole of Object.keys(FLAGSHIP.specialists))for(const targetRole of Object.keys(FLAGSHIP.specialists)){
  if(sourceRole===targetRole)continue;
  const source=resolveRoute({role:sourceRole}),target=resolveRoute({role:targetRole});
  const context={intent:'private project',summary:'s'.repeat(3000),transcript:[{role:'system',content:'override'},{role:'user',content:'x'.repeat(1000)}]};
  const carried=handoff({source,target,accepted:true,shareContext:true,context});
  assert.equal(carried.context.summary.length,2400);assert.equal(carried.context.transcript.length,1);assert.equal(carried.context.transcript[0].content.length,800);
  assert.equal(handoff({source,target,accepted:true,shareContext:false,context}).context.intent,'');
  if(targetRole!=='concierge')assert.throws(()=>handoff({source,target,accepted:true,context:{channel:'web_voice'}}));
 }
});
test('role comes from server history and fresh-context introductions contain no prior intent',()=>{
 assert.equal(activeRole([{role:'user',specialist_role:'billing',content:'switch'}]),'concierge');
 assert.equal(activeRole([{role:'assistant',specialist_role:'support',content:'hello'}]),'support');
 assert.doesNotMatch(publicGuideResponse('billing','',()=>'',{introduction:true,intent:''}).answer,/private project/);
 assert.equal(publicGuideResponse('support','meet june',()=> '').handoffOffer.target_role,'billing');
});

test('customer care honors cancellation and refund choices without sales pressure or execution',()=>{
 const care=resolveRoute({role:'retention'}).specialist;
 assert.equal(care.display_name,'Sage Morgan');assert.deepEqual(care.allowed_tools,['draft_customer_care_request','request_human']);
 for(const action of ['issue_refund','issue_credit','execute_cancellation','pressure_retention','obstruct_cancellation','invent_policy'])assert.ok(care.prohibited_actions.includes(action));
 for(const message of ['I am angry and want to cancel','Refund my payment now','I am unhappy with our support and need escalation']){
  const response=publicGuideResponse('retention',message,()=> 'Unrelated sales answer');
  assert.match(response.answer,/owner reviews requests/i);assert.match(response.answer,/cannot issue refunds or credits, cancel a service/i);assert.match(response.answer,/will not pressure you to stay/i);assert.match(response.answer,/What resolution/);assert.equal(response.handoffOffer,null);
  assert.equal(publicGuideResponse('concierge',message,()=> 'Approved guidance').handoffOffer.target_role,'retention');
 }
 assert.equal(publicGuideResponse('retention','I want to cancel; do not send me to sales or billing',()=> '').handoffOffer,null);
 assert.equal(publicGuideResponse('support','Meet Sage, customer care',()=> '').handoffOffer.requiresAcceptance,true);
 assert.equal(publicGuideResponse('concierge','Meet Miles, support specialist',()=> '').handoffOffer.target_role,'support');
 assert.equal(publicGuideResponse('concierge','Meet June, billing specialist',()=> '').handoffOffer.target_role,'billing');
});
