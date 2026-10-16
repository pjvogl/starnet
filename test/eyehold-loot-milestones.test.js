'use strict';
const assert=require('node:assert/strict');
const {milestoneState,PROFIT_MILESTONES_USD}=require('../sidecar/eyehold-finance-truth.js');
const loot=require('../frontend/app/eyehold-room-loot.js');
const roles=require('../frontend/app/eyehold-roles.js');
assert.deepEqual([...PROFIT_MILESTONES_USD],loot.tiers.map(t=>t.atUSD));
assert.equal(loot.tiers.length,3);
for(const tier of loot.tiers)assert.equal(Object.keys(tier.roomAdditions).length,7,'each department earns a distinct upgrade');
assert.deepEqual(loot.awardedForVerifiedProfit(100000000,false),[],'unverified claims never unlock loot');
assert.deepEqual(loot.awardedForVerifiedProfit(null,true),[],'missing financial data never unlocks loot');
assert.deepEqual(loot.awardedForVerifiedProfit(1000000,true),[1000000]);
assert.deepEqual(loot.awardedForVerifiedProfit(10000000,true),[1000000,10000000]);
assert.equal(milestoneState(1000000).currentMilestoneUSD,10000000);
for(const role of ['keep','foundry','moonleaf','forge','archive','roost','astral']){
 const prompt=roles.compose(role).manual;
 assert(prompt.includes('Eternal Dominion'),role+' missing aspirational loot instructions');
 assert(prompt.includes('never justifies'),role+' missing safety protections');
}
console.log('PASS: verified profit tiers, seven-room preview catalog, shared agent loot motivation');
console.log('Financial import/host auth/native persistence are covered by finance integration tests; custom fantasy art remains planned');
