'use strict';
const assert=require('node:assert/strict');
const WorldModel=require('../frontend/app/worldmodel.js');
const {buildEyeholdStation}=require('../scripts/eyehold-seven-room-starter.cjs');
const {applyTrustedMilestone,plan}=require('../frontend/app/eyehold-native-loot.js');
const station=WorldModel.deserialize(buildEyeholdStation().doc);
let saves=0;
const args={station,persist:()=>saves++,verifyAttestation:(proof,tier)=>proof?.trusted===true&&proof?.atUSD===tier};
assert.equal(plan(station,1000000).length,7,'seven rooms get native prop placements');
assert.throws(()=>applyTrustedMilestone({...args,tier:1000000,attestation:{trusted:false,atUSD:1000000}}),/Trusted milestone attestation/);
assert.equal(saves,0,'untrusted client must not change world');
for(const tier of [1000000,10000000,100000000]){
 const result=applyTrustedMilestone({...args,tier,attestation:{trusted:true,atUSD:tier}});
 assert.equal(result.complete,true,'all seven room decorations place for '+tier+': '+JSON.stringify(result.results));
 const repeat=applyTrustedMilestone({...args,tier,attestation:{trusted:true,atUSD:tier}});
 assert.equal(repeat.complete,true);
 assert(repeat.results.every(x=>x.alreadyPresent),'repeated confirmation does not duplicate props');
}
const restored=WorldModel.deserialize(station.serialize()).serialize();
const placed=restored.props.filter(p=>['rug','plant','lamp'].includes(p.t));
assert(placed.length>=21,'all 21 real station cosmetics survive native WorldModel serialization');
assert(saves>=3);
console.log('PASS: all 21 real WorldModel room decorations persist and untrusted milestone calls fail closed');
console.log('PENDING: production host attestation and native fantasy-specific art assets');
