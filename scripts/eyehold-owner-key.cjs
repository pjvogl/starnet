#!/usr/bin/env node
'use strict';
const path=require('node:path');
const {provision}=require('../sidecar/eyehold-owner-auth.js');
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--workspace-root'||!path.isAbsolute(args[1])){
 console.error('Usage: node scripts/eyehold-owner-key.cjs --workspace-root <absolute sidecar workspace root>');process.exit(2);
}
try{
 const key=provision(args[1]);
 console.log('Owner review key (shown once; store privately and never give to an agent):');
 console.log(key);
 console.log('Enter this key only in the local Work Board owner review form. No restart is needed.');
}catch(e){console.error(e.code==='EEXIST'?'Owner already provisioned. Existing authority was preserved.':'Could not provision owner review authority.');process.exitCode=1}
