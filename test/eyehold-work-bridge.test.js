'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createBridge}=require('../sidecar/eyehold-work-bridge.js');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'eye-bridge-'));
let status='running';
const acceptance={accepted:true,goalId:'profit-1m',goalAdvanced:true,goalEvidenceRef:'artifact1',taskId:'t1',deliverableId:'d1',runId:'run1',verificationMethod:'user',evidenceRefs:['artifact1'],contributors:['agent1'],acceptanceRevision:1,predeclaredComplexity:1,quality:5,testPassed:true};
try{
const make=()=>createBridge({file:path.join(dir,'ledger.json'),getRun:id=>({id,taskId:'t1',agentId:'agent1',status}),getAcceptance:()=>acceptance,getHistory:()=>[{verified:true,outcome:'failed'},{verified:true,outcome:'failed'},{verified:true,outcome:'failed'}]});
let bridge=make();
assert.equal(bridge.credit('t1','d1').ok,false);
status='completed';
assert.equal(bridge.credit('t1','d1').credited,true);
assert.equal(bridge.credit('t1','d1').credited,false);
assert.equal(bridge.evaluate('agent1').action,'request-review');
bridge=make();assert.equal(bridge.credit('t1','d1').credited,false);
assert.equal(bridge.totals().agent1,25);
console.log('Eyehold trusted execution bridge OK');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
