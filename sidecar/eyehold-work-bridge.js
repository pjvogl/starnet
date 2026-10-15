/* The Eyehold: server-side bridge from authoritative run + acceptance stores.
 * Only trusted sidecar code should construct this bridge. No client write API.
 */
'use strict';
const {openLedger}=require('./eyehold-productivity-ledger.js');
const {evaluateAgent}=require('./eyehold-productivity.js');
function createBridge({file,getRun,getAcceptance,getHistory}){
 if(typeof getRun!=='function'||typeof getAcceptance!=='function')throw new TypeError('authoritative stores required');
 const check=receipt=>{
  if(!receipt||typeof receipt!=='object')return false;
  const run=getRun(receipt.runId);
  const acceptance=getAcceptance(receipt.taskId,receipt.deliverableId);
  if(!run||!acceptance||run.id!==receipt.runId||run.taskId!==receipt.taskId)return false;
  if(run.status!=='completed'||run.agentId==null||acceptance.accepted!==true)return false;
  if(acceptance.goalAdvanced!==true||typeof acceptance.goalId!=='string'||typeof acceptance.goalEvidenceRef!=='string')return false;
  if(receipt.goalAdvanced!==acceptance.goalAdvanced||receipt.goalId!==acceptance.goalId||receipt.goalEvidenceRef!==acceptance.goalEvidenceRef)return false;
  if(!Array.isArray(acceptance.evidenceRefs)||!acceptance.evidenceRefs.includes(acceptance.goalEvidenceRef))return false;
  if(acceptance.runId!==receipt.runId||acceptance.taskId!==receipt.taskId||acceptance.deliverableId!==receipt.deliverableId)return false;
  if(!Array.isArray(acceptance.evidenceRefs)||!acceptance.evidenceRefs.length)return false;
  if(JSON.stringify(acceptance.evidenceRefs)!==JSON.stringify(receipt.evidenceRefs))return false;
  if(acceptance.verificationMethod!==receipt.verificationMethod||acceptance.quality!==receipt.quality||acceptance.testPassed!==receipt.testPassed||acceptance.predeclaredComplexity!==receipt.predeclaredComplexity)return false;
  if(!Array.isArray(receipt.contributors)||!receipt.contributors.includes(run.agentId))return false;
  if(JSON.stringify([...receipt.contributors].sort())!==JSON.stringify([...(acceptance.contributors||[])].sort()))return false;
  if((receipt.acceptanceRevision||1)!==(acceptance.acceptanceRevision||1))return false;
  return true;
 };
 const ledger=openLedger(file,{verifyReceipt:check});
 function credit(taskId,deliverableId){
  const a=getAcceptance(taskId,deliverableId);
  if(!a||!a.accepted)return {ok:false,reason:'no-accepted-deliverable'};
  const run=getRun(a.runId);
  if(!run)return {ok:false,reason:'run-not-found'};
  const receipt={verified:true,accepted:true,goalId:a.goalId,goalAdvanced:a.goalAdvanced,goalEvidenceRef:a.goalEvidenceRef,taskId,deliverableId,runId:a.runId,verificationMethod:a.verificationMethod,evidenceRefs:a.evidenceRefs,quality:a.quality,testPassed:a.testPassed,predeclaredComplexity:a.predeclaredComplexity,contributors:a.contributors,acceptanceRevision:a.acceptanceRevision||1};
  return ledger.record(receipt);
 }
 function evaluate(agentId){
  if(typeof getHistory!=='function')return {action:'observe',reason:'no-authoritative-history'};
  return evaluateAgent(getHistory(agentId));
 }
 return Object.freeze({credit,evaluate,totals:ledger.totals,snapshot:ledger.snapshot});
}
module.exports=Object.freeze({createBridge});
