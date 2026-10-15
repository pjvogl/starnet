'use strict';
const assert=require('node:assert/strict');
const os=require('node:os'),fs=require('node:fs'),path=require('node:path');
const {openLedger}=require('../sidecar/eyehold-productivity-ledger.js');
const home=fs.mkdtempSync(path.join(os.tmpdir(),'eye-ledger-')),file=path.join(home,'credits.json');
const receipt={verified:true,accepted:true,taskId:'task1',deliverableId:'artifact1',runId:'run1',verificationMethod:'user',evidenceRefs:['file1'],contributors:['eye','forge']};
try{
 assert.throws(()=>openLedger(file),/verifyReceipt/);
 const bad=openLedger(file,{verifyReceipt:()=>false});
 assert.equal(bad.record(receipt).ok,false);
 assert.equal(fs.existsSync(file),false);
 const ledger=openLedger(file,{verifyReceipt:r=>r.runId==='run1'&&r.accepted===true});
 assert.equal(ledger.record(receipt).credited,true);
 assert.equal(ledger.record(receipt).credited,false);
 assert.equal(ledger.snapshot().length,1);
 const reopened=openLedger(file,{verifyReceipt:()=>true});
 assert.deepEqual(reopened.totals(),ledger.totals());
 assert.equal(reopened.snapshot().length,1);
 console.log('Eyehold durable ledger tests OK');
}finally{fs.rmSync(home,{recursive:true,force:true});}
