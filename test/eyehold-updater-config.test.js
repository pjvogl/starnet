'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const cfg=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../src-tauri/tauri.conf.json'),'utf8'));
assert.equal(cfg.productName,'The Eyehold');
assert.equal(cfg.bundle.createUpdaterArtifacts,false,'no auto-update artifacts before independent signing');
assert.deepEqual(cfg.plugins.updater.endpoints,[],'no upstream or invented update endpoint');
console.log('Eyehold development updater safety configuration OK (does not validate Tauri build)');
