'use strict';
const assert=require('node:assert/strict');
const {makeEyeholdRunReader}=require('../sidecar/eyehold-runstore-adapter.js');
const rows=[
 {runId:'finished1',agentId:'deepforge',reason:'done'},
 {runId:'failed1',agentId:'theeye',reason:'error'},
 {runId:'budget1',agentId:'deepforge',reason:'budget'}
];
const read=makeEyeholdRunReader({all:()=>rows});
assert.deepEqual(read('finished1'),{id:'finished1',taskId:'finished1',agentId:'deepforge',status:'completed'});
assert.equal(read('failed1').status,'failed');
assert.equal(read('budget1').status,'failed');
assert.equal(read('missing'),null);
assert.equal(read('../escape'),null);
assert.throws(()=>makeEyeholdRunReader({}),/runStore/);
console.log('Eyehold real run-store acceptance adapter OK');
