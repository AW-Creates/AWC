import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimate,OFFERS} from '../src/offers.mjs';
import {guideAnswer} from '../src/facts.mjs';
test('draft estimator calculates bounded itemized additions',()=>{
 const d=estimate({package:'launch',extraPages:2,copyPages:3});
 assert.deepEqual([d.min,d.max],[2100,3450]);assert.equal(d.items.length,3);assert.equal(d.draft,true);assert.match(d.summary,/Preliminary/);assert.match(d.summary,/taxes/);
 assert.deepEqual([estimate({package:'clarity'}).min,estimate({package:'clarity'}).max],[195,195]);
 const cap=estimate({package:'guide',extraPages:5,copyPages:5});assert.deepEqual([cap.min,cap.max],[3750,6000]);
});
test('unsupported or malformed scope cannot generate an estimate',()=>{
 for(const input of [null,[],{package:'__proto__'},{package:'voice'},{package:'launch',extraPages:-1},{package:'launch',extraPages:6},{package:'launch',copyPages:0.5},{package:'launch',copyPages:'2'},{package:'workflow',extraPages:1},{package:'clarity',copyPages:1},{package:'launch',min:1}])assert.throws(()=>estimate(input),RangeError);
});
test('guide facts agree with authoritative draft scope and route commitments to people',()=>{
 for(const offer of Object.values(OFFERS)){const answer=guideAnswer('What are your prices?');assert.ok(answer.includes(offer.name));assert.ok(answer.includes('$'+offer.min));}
 assert.match(guideAnswer('How long does it take?'),/after the session and completed intake/);
 assert.match(guideAnswer('maintenance'),/No automatic enrollment/);
 assert.match(guideAnswer('Who owns the website? ownership'),/written proposal/);
 assert.match(guideAnswer('Phone receptionist'),/deferred/);
 assert.match(guideAnswer('privacy'),/24 hours.*90 days/);
 assert.match(guideAnswer('revisions'),/2 revision rounds/);
 assert.match(guideAnswer('integration'),/at most 2/);
 assert.match(guideAnswer('book consultation'),/not a confirmed appointment/);
});
