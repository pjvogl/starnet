'use strict';
const assert=require('node:assert/strict');
const os=require('node:os'),fs=require('node:fs'),path=require('node:path');
const {openLedger}=require('../sidecar/eyehold-productivity-ledger.js');
const home=fs.mkdtempSync(path.join(os.tmpdir(),'eye-ledger-')),file=path.join(home,'credits.json');
const receipt={verified:true,accepted:true,goalId:'profit-1m',goalAdvanced:true,goalEvidenceRef:'file1',taskId:'task1',deliverableId:'artifact1',runId:'run1',verificationMethod:'user',evidenceRefs:['file1'],contributors:['eye','forge']};
try{
 assert.throws(()=>openLedger(file),/verifyReceipt/);
 const bad=openLedger(file,{verifyReceipt:()=>false});
 assert.equal(bad.record(receipt).ok,false);
 assert.equal(fs.existsSync(file),false);
 const ledger=openLedger(file,{verifyReceipt:r=>r.runId==='run1'&&r.accepted===true});
 assert.equal(ledger.record({...receipt,goalAdvanced:false}).ok,false,'no rewards for non-goal work');
 assert.equal(ledger.record({...receipt,goalEvidenceRef:null}).ok,false,'goal evidence required');
 assert.equal(ledger.record(receipt).credited,true);
 assert.equal(ledger.record(receipt).credited,false);
 assert.equal(ledger.snapshot().length,1);
 const reopened=openLedger(file,{verifyReceipt:()=>true});
 assert.deepEqual(reopened.totals(),ledger.totals());
 assert.equal(reopened.snapshot().length,1);
 const tampered=path.join(home,'tampered.json');
 fs.writeFileSync(tampered,JSON.stringify({schema:'eyehold.productivity.v1',events:[...ledger.snapshot(),...ledger.snapshot()]}));
 assert.throws(()=>openLedger(tampered,{verifyReceipt:()=>true}),/invalid productivity ledger entries/);
 const forged=path.join(home,'forged.json');
 fs.writeFileSync(forged,JSON.stringify({schema:'eyehold.productivity.v1',events:[{...ledger.snapshot()[0],crowns:999}]}));
 assert.throws(()=>openLedger(forged,{verifyReceipt:()=>true}),/invalid productivity ledger entries/);
 console.log('Eyehold durable ledger tests OK');
}finally{fs.rmSync(home,{recursive:true,force:true});}
