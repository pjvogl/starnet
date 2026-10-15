'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const source=fs.readFileSync(path.join(__dirname,'eyehold-live-delegation.test.js'),'utf8');
// The writer must append a single escaped JS newline, not a literal
// backslash followed by n into a .json artifact.
const manifestWriter=source.match(/fs\.writeFileSync\(path\.join\(dest,'review-manifest\.json'\),([^;]+);/);
assert(manifestWriter,'live worker must emit a review manifest');
assert(manifestWriter[1].includes("+'\\n'"),'manifest must write an actual newline');
assert(!manifestWriter[1].includes("+'\\\\n'"),'manifest must not write a literal backslash-n');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'eyehold-manifest-'));
try{
 const file=path.join(tmp,'review-manifest.json');
 const sample={approved:false,earnedCrowns:0,delegatedBy:'agent'};
 fs.writeFileSync(file,JSON.stringify(sample,null,2)+'\n');
 assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')),sample);
 console.log('Eyehold review artifact newline/JSON regression check OK');
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
