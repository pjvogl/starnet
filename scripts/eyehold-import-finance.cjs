#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {createFinanceStore}=require('../sidecar/eyehold-finance-store.js');
const args=process.argv.slice(2),rootAt=args.indexOf('--workspace-root');
if(rootAt<0||!args[rootAt+1]||!args.includes('--confirm-reviewed')){
 console.error('Usage: node scripts/eyehold-import-finance.cjs --workspace-root <sidecar workspace root> --confirm-reviewed receipt.json [...]\nReplaces the complete financial snapshot. Review all receipt amounts and include costs, fees and refunds before confirming.');process.exit(2);
}
const root=path.resolve(args[rootAt+1]);args.splice(rootAt,2);args.splice(args.indexOf('--confirm-reviewed'),1);
try{
 const receipts=args.map(file=>{const stat=fs.statSync(file);if(stat.size>65536)throw Error('Receipt exceeds 64 KiB');return fs.readFileSync(file,'utf8');});
 const report=createFinanceStore({file:path.join(root,'eyehold-finance.json')}).replaceReviewed(receipts,{confirmedReviewed:true});
 console.log(JSON.stringify(report,null,2));
}catch(e){console.error('Finance import rejected:',e.message);process.exitCode=1;}
