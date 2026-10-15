'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {EventEmitter}=require('node:events');
const {createCrownRuntime}=require('../sidecar/eyehold-crown-runtime.js');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'eye-host-runtime-'));
const events=new EventEmitter(),verified=new Set();
const run={id:'runA',agentId:'deepforge',taskId:'taskA',status:'running'};
const inputs={workspaceDir:dir,events,getRun:id=>id===run.id?run:null,verifyEvidence:c=>verified.has(c.goalEvidenceRef),getHistory:()=>[{agentId:'deepforge',verified:true,outcome:'accepted'}],getAgentIds:()=>['deepforge'],now:()=>123};
const decision={taskId:'taskA',deliverableId:'deliveryA',runId:'runA',goalId:'profit-1m',goalAdvanced:true,goalEvidenceRef:'proofA',evidenceRefs:['proofA'],verificationMethod:'objective-test',contributors:['deepforge'],quality:5,testPassed:true,predeclaredComplexity:1};
try{
 let runtime=createCrownRuntime(inputs);
 assert.equal(runtime.acceptVerifiedDeliverable(decision).ok,false,'unfinished agent cannot be accepted');
 run.status='completed';
 assert.equal(runtime.acceptVerifiedDeliverable(decision).ok,false,'unverified output cannot be accepted');
 verified.add('proofA');
 assert.equal(runtime.acceptVerifiedDeliverable(decision).accepted,true);
 assert.equal(runtime.crownTotals().deepforge,25);
 assert.equal(runtime.acceptVerifiedDeliverable(decision).ok,false,'idempotent acceptance');
 assert.equal(runtime.crownTotals().deepforge,25);
 runtime.close();
 runtime=createCrownRuntime(inputs);
 assert.equal(runtime.readAcceptance('taskA','deliveryA').accepted,true);
 assert.equal(runtime.crownTotals().deepforge,25,'restart persistence');
 runtime.close();
 console.log('Crown runtime composition and restart test OK');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
