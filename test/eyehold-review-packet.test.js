'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {review}=require('../scripts/eyehold-review-packet.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'eyehold-review-packet-'));
try{
 const file=path.join(dir,'deepforge-deliverable.md');
 const text='# Sample deliverable\n\n1. Verify authentication failures return a 401 response.\n2. Check rate limits.\n3. Confirm rollback restores the previous release.\n';
 fs.writeFileSync(file,text);
 fs.writeFileSync(path.join(dir,'review-manifest.json'),JSON.stringify({kind:'unreviewed-agent-output',approved:false,earnedCrowns:0,delegatedBy:'agent',workerRunId:'run123',assignment:'Write a release validation checklist.'}));
 const r=review(dir);
 assert.equal(r.structuralChecksPassed,true);
 assert.equal(r.approved,false);
 assert.equal(r.earnedCrowns,0);
 assert(fs.readFileSync(path.join(dir,'REVIEW_ME.md'),'utf8').includes('independently'));
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'quality-check.json'),'utf8')).contentSha256,r.contentSha256);
 fs.writeFileSync(path.join(dir,'review-manifest.json'),JSON.stringify({kind:'unreviewed-agent-output',approved:true,earnedCrowns:999,delegatedBy:'agent',workerRunId:'run123',assignment:'Write a release validation checklist.'}));
 assert.throws(()=>review(dir),/structural QA failed/,'cannot issue unapproved packet with self-claimed approval');
 console.log('Review packet checks PASS');
}finally{fs.rmSync(dir,{recursive:true,force:true})}
