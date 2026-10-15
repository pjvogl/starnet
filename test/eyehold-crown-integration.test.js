'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {EventEmitter}=require('node:events');
const {installCrownIntegration}=require('../sidecar/eyehold-crown-integration.js');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'eye-integration-'));
const events=new EventEmitter();
let accepted=false,goalAdvanced=false,runStatus='running';
const run={id:'run1',taskId:'task1',agentId:'deepforge'};
const receipt=()=>({
 accepted,taskId:'task1',deliverableId:'delivery1',runId:'run1',goalId:'profit-1m',
 goalAdvanced,goalEvidenceRef:'verifiedArtifact1',
 verificationMethod:'user',evidenceRefs:['verifiedArtifact1'],quality:5,
 testPassed:true,predeclaredComplexity:1,contributors:['deepforge'],acceptanceRevision:1
});
const opts={workspaceDir:root,events,runs:{get:id=>id==='run1'?{...run,status:runStatus}:null},
 acceptances:{get:(taskId,deliverableId)=>taskId==='task1'&&deliverableId==='delivery1'?receipt():null},
 history:{forAgent:()=>[{agentId:'deepforge',verified:true,outcome:'accepted'}]},
 agentIds:()=>['deepforge'],now:()=>1000};
try{
 let service=installCrownIntegration(opts);
 events.emit('run.end',{runId:'run1'});
 assert.equal(service.totals().deepforge,undefined,'run end is not award');
 runStatus='completed';accepted=true;
 events.emit('deliverable.accepted',{taskId:'task1',deliverableId:'delivery1'});
 assert.equal(service.totals().deepforge,undefined,'accepted task without profit-goal progress is not award');
 goalAdvanced=true;
 events.emit('deliverable.accepted',{taskId:'task1',deliverableId:'delivery1'});
 assert.equal(service.totals().deepforge,25,'goal-aligned accepted artifact earns reward');
 events.emit('deliverable.accepted',{taskId:'task1',deliverableId:'delivery1'});
 assert.equal(service.totals().deepforge,25,'replay does not earn reward');
 assert.equal(service.supervisor().agents[0].crowns,25);
 service.close();service.close();
 assert.equal(events.listenerCount('deliverable.accepted'),0);
 service=installCrownIntegration(opts);
 assert.equal(service.totals().deepforge,25,'award persisted across process reinstallation');
 events.emit('deliverable.accepted',{taskId:'task1',deliverableId:'delivery1'});
 assert.equal(service.totals().deepforge,25,'replayed event after restart is not award');
 service.close();
 console.log('Eyehold trusted event-bus to durable Crown ledger integration OK');
}finally{fs.rmSync(root,{recursive:true,force:true});}
