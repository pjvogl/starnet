/* The Eyehold durable productivity ledger — backend-only dependency.
 * Does not expose an HTTP write endpoint. The server must independently validate
 * run completion/acceptance before passing a verified receipt to record().
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const productivity=require('./eyehold-productivity.js');
function openLedger(filename,options={}){
 if(typeof filename!=='string'||!path.isAbsolute(filename))throw new TypeError('absolute ledger path required');
 const verify=options.verifyReceipt;
 if(typeof verify!=='function')throw new TypeError('authoritative verifyReceipt callback required');
 let events=[];
 if(fs.existsSync(filename)){
   const raw=JSON.parse(fs.readFileSync(filename,'utf8'));
   if(!raw||raw.schema!=='eyehold.productivity.v1'||!Array.isArray(raw.events)||raw.events.length>100000)throw new Error('invalid productivity ledger');
   events=raw.events;
 }
 function snapshot(){return JSON.parse(JSON.stringify(events));}
 function totals(){
  const counts=Object.create(null);
  for(const e of events)for(const a of e.allocations||[]){
    if(!a||typeof a.agentId!=='string'||!Number.isSafeInteger(a.crowns)||a.crowns<0)continue;
    counts[a.agentId]=(counts[a.agentId]||0)+a.crowns;
  }
  return {...counts};
 }
 function record(receipt){
  // Fail closed: a client-provided 'verified: true' is never sufficient.
  if(verify(receipt)!==true)return {ok:false,reason:'receipt-not-authoritatively-verified'};
  const result=productivity.apply(events,receipt);
  if(result.result.reason==='duplicate')return {ok:true,credited:false,reason:'duplicate'};
  if(!result.result.crowns)return {ok:false,reason:result.result.reason};
  const next=result.events;
  const dir=path.dirname(filename);fs.mkdirSync(dir,{recursive:true,mode:0o700});
  const tmp=filename+'.'+process.pid+'.tmp';
  try{
   fs.writeFileSync(tmp,JSON.stringify({schema:'eyehold.productivity.v1',events:next}),{mode:0o600,flag:'wx'});
   fs.renameSync(tmp,filename);
  }catch(err){try{fs.unlinkSync(tmp)}catch(_){};throw err;}
  events=next;
  return {ok:true,credited:true,crowns:result.result.crowns,allocations:result.result.allocations};
 }
 return Object.freeze({record,snapshot,totals});
}
module.exports=Object.freeze({openLedger});
