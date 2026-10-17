/* Eyehold trusted business-goal acceptance store.
 * Call ONLY from the server's authorized reviewer/verification process.
 * No agent- or frontend-supplied receipt can independently mint Crowns.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const ID=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/;
const valid=x=>typeof x==='string'&&ID.test(x);
const methods=new Set(['user','objective-test','external']);
function openAcceptanceStore({file,getRun,verifyEvidence,events}){
 if(typeof file!=='string'||!path.isAbsolute(file)||typeof getRun!=='function'||typeof verifyEvidence!=='function'||!events||typeof events.emit!=='function')throw new TypeError('trusted persistence, run lookup, evidence verification and emitter required');
 const read=()=>{if(!fs.existsSync(file))return [];const raw=JSON.parse(fs.readFileSync(file,'utf8'));if(raw?.schema!=='eyehold.acceptance.v1'||!Array.isArray(raw.records))throw Error('invalid acceptance store');return raw.records;};
 let records=read();
 const get=(taskId,deliverableId)=>records.find(x=>x.taskId===taskId&&x.deliverableId===deliverableId)||null;
 function accept(candidate){
  if(!candidate||!valid(candidate.taskId)||!valid(candidate.deliverableId)||!valid(candidate.runId)||!valid(candidate.goalId)||!valid(candidate.goalEvidenceRef))return {ok:false,reason:'invalid-ids'};
  if(candidate.goalAdvanced!==true||!methods.has(candidate.verificationMethod)||!Array.isArray(candidate.evidenceRefs)||!candidate.evidenceRefs.includes(candidate.goalEvidenceRef)||!candidate.evidenceRefs.length||!candidate.evidenceRefs.every(valid))return {ok:false,reason:'unverified-goal'};
  if(!Array.isArray(candidate.contributors)||!candidate.contributors.length||!candidate.contributors.every(valid)||new Set(candidate.contributors).size!==candidate.contributors.length)return {ok:false,reason:'invalid-contributors'};
  if(!Number.isInteger(candidate.quality)||candidate.quality<1||candidate.quality>5||![1,2].includes(candidate.predeclaredComplexity)||typeof candidate.testPassed!=='boolean')return {ok:false,reason:'invalid-scoring'};
  const run=getRun(candidate.runId);
  if(!run||run.id!==candidate.runId||run.taskId!==candidate.taskId||run.status!=='completed'||!candidate.contributors.includes(run.agentId))return {ok:false,reason:'unverified-run'};
  if(verifyEvidence(candidate,run)!==true)return {ok:false,reason:'evidence-not-verified'};
  const current=get(candidate.taskId,candidate.deliverableId);
  if(current)return {ok:false,reason:'already-accepted'};
  const entry={accepted:true,taskId:candidate.taskId,deliverableId:candidate.deliverableId,runId:candidate.runId,goalId:candidate.goalId,goalAdvanced:true,goalEvidenceRef:candidate.goalEvidenceRef,verificationMethod:candidate.verificationMethod,evidenceRefs:[...candidate.evidenceRefs],contributors:[...candidate.contributors],quality:candidate.quality,testPassed:candidate.testPassed,predeclaredComplexity:candidate.predeclaredComplexity,acceptanceRevision:1};
  if(typeof candidate.reviewedBy==='string'&&valid(candidate.reviewedBy))entry.reviewedBy=candidate.reviewedBy;
  if(Number.isSafeInteger(candidate.reviewedAt)&&candidate.reviewedAt>0)entry.reviewedAt=candidate.reviewedAt;
  if(typeof candidate.goalText==='string')entry.goalText=candidate.goalText.slice(0,280);
  if(typeof candidate.goalDigest==='string'&&valid(candidate.goalDigest))entry.goalDigest=candidate.goalDigest;
  const next=[...records,entry],dir=path.dirname(file);
  fs.mkdirSync(dir,{recursive:true,mode:0o700});
  const tmp=file+'.'+process.pid+'.'+Date.now()+'.tmp';
  try{fs.writeFileSync(tmp,JSON.stringify({schema:'eyehold.acceptance.v1',records:next}),{mode:0o600,flag:'wx'});fs.renameSync(tmp,file)}catch(e){try{fs.unlinkSync(tmp)}catch{}throw e}
  records=next;
  // Emit only after durable write; subscribers MUST re-read authoritative store.
  events.emit('deliverable.accepted',{taskId:entry.taskId,deliverableId:entry.deliverableId});
  return {ok:true,accepted:true};
 }
 return Object.freeze({get,accept,list:()=>JSON.parse(JSON.stringify(records))});
}
module.exports=Object.freeze({openAcceptanceStore});
