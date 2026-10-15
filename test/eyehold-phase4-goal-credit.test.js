'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createBridge}=require('../sidecar/eyehold-work-bridge.js');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'eye-phase4-'));
let status='running',accepted=false,goalAdvanced=false,goalEvidenceRef='artifact-1';
const acceptance=()=>({accepted,goalId:'profit-1m',goalAdvanced,goalEvidenceRef,taskId:'task-1',deliverableId:'deliver-1',runId:'run-1',verificationMethod:'objective-test',evidenceRefs:['artifact-1'],contributors:['deepforge'],acceptanceRevision:1,predeclaredComplexity:1,quality:5,testPassed:true});
const bridge=createBridge({file:path.join(dir,'ledger.json'),getRun:id=>id==='run-1'?{id,taskId:'task-1',agentId:'deepforge',status}:null,getAcceptance:(t,d)=>t==='task-1'&&d==='deliver-1'?acceptance():null,getHistory:()=>[]});
try{
 assert.equal(bridge.credit('task-1','deliver-1').ok,false,'unaccepted run must not earn Crowns');
 accepted=true;status='completed';
 assert.equal(bridge.credit('task-1','deliver-1').ok,false,'accepted busywork must not earn Crowns');
 goalAdvanced=true;goalEvidenceRef='fabricated-proof';
 assert.equal(bridge.credit('task-1','deliver-1').ok,false,'unattached goal evidence must not earn Crowns');
 goalEvidenceRef='artifact-1';
 const award=bridge.credit('task-1','deliver-1');
 assert.equal(award.ok,true);assert.equal(award.credited,true);
 assert.equal(award.crowns,25);
 const replay=bridge.credit('task-1','deliver-1');
 assert.equal(replay.credited,false,'duplicate award must be blocked');
 assert.equal(bridge.totals().deepforge,25);
 assert.equal(bridge.snapshot()[0].goalId,'profit-1m');
 const reopened=createBridge({file:path.join(dir,'ledger.json'),getRun:id=>({id,taskId:'task-1',agentId:'deepforge',status}),getAcceptance:()=>acceptance(),getHistory:()=>[]});
 assert.equal(reopened.credit('task-1','deliver-1').credited,false,'restart must not duplicate award');
 assert.equal(reopened.totals().deepforge,25);
 console.log('Eyehold Phase 4 goal-aligned accepted-deliverable credit proof OK');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
