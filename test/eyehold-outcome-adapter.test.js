'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {EventEmitter}=require('node:events');
const {createOutcomeAdapter}=require('../sidecar/eyehold-outcome-adapter.js');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'eye-outcome-'));
let runStatus='running',accepted=false;
const a={accepted:false,taskId:'task1',deliverableId:'deliver1',runId:'run1',verificationMethod:'user',evidenceRefs:['artifact1'],contributors:['agent1'],acceptanceRevision:1,predeclaredComplexity:1,quality:5,testPassed:true};
try {
 const adapter=createOutcomeAdapter({file:path.join(dir,'ledger.json'),getRun:id=>id==='run1'?{id,agentId:'agent1',taskId:'task1',status:runStatus}:null,getAcceptance:(t,d)=>(t==='task1'&&d==='deliver1')?{...a,accepted}:null,getHistory:()=>[{agentId:'agent1',verified:true,outcome:'accepted'}],getAgentIds:()=>['agent1'],now:()=>123});
 assert.equal(adapter.runEndedHint({runId:'run1'}).ok,false);
 assert.equal(adapter.acceptedHint({taskId:'task1',deliverableId:'deliver1',accepted:true}).credited,undefined);
 runStatus='completed';
 assert.equal(adapter.runEndedHint({runId:'run1'}).credited,false);
 assert.equal(adapter.totals().agent1,undefined);
 accepted=true;
 assert.equal(adapter.acceptedHint({taskId:'task1',deliverableId:'deliver1'}).credited,true);
 assert.equal(adapter.acceptedHint({taskId:'task1',deliverableId:'deliver1'}).credited,false);
 const bus=new EventEmitter();
 const detach=adapter.subscribe(bus);
 bus.emit('run.end',{runId:'run1'});
 bus.emit('deliverable.accepted',{taskId:'task1',deliverableId:'deliver1'});
 assert.equal(bus.listenerCount('deliverable.accepted'),1);
 detach();detach();
 assert.equal(bus.listenerCount('deliverable.accepted'),0);
 assert.equal(adapter.supervisor().agents[0].crowns,25);
 assert.equal(adapter.supervisor().agents[0].executionStatus,'unknown');
 assert.equal(adapter.acceptedHint({taskId:'../bad',deliverableId:'deliver1'}).ok,false);
 console.log('Eyehold event adapter requires accepted backend evidence and idempotently credits it');
} finally {fs.rmSync(dir,{recursive:true,force:true});}
