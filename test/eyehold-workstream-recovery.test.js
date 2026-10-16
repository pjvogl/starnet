'use strict';
// Tests actual persisted workstream records, not provider-generated transcripts.
// This is the client-side state rehydrated to the sidecar after restart.
const assert=require('node:assert/strict');
const Workstreams=require('../frontend/app/workstreams.js');
Workstreams.reset();
const specs=[
 ['raven','research'],['sages','strategy'],['iron','operations'],
 ['deepforge','engineering'],['silver','quality'],['treasury','finance']];
const records=specs.map(([agentId,title])=>Workstreams.create(title,{agentId,activate:false}));
for(const [i,w] of records.entries())assert(Workstreams.appendRun(w.id,'verified-test-run-'+i,1750000000000+i));
const snapshot=JSON.parse(JSON.stringify(Workstreams.serialize()));
Workstreams.reset();
Workstreams.init(snapshot);
for(let i=0;i<records.length;i++){
 const restored=Workstreams.get(records[i].id);
 assert(restored,'persisted department session missing');
 assert.equal(restored.agentId,specs[i][0]);
 assert.equal(restored.title,specs[i][1]);
 assert(restored.runIds.includes('verified-test-run-'+i),'persistent run reference missing');
}
console.log('PASS: all six specialist session records and associated run references survive save + restore.');
console.log('NOT PROVED: server-owned transcript durability or completed real model sessions.');
