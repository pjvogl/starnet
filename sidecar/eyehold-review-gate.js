/* Human-only review authorization. This does not grant an agent permission to
 * approve itself. The host must provide a real operator authentication
 * decision and an independently verified artifact reference.
 */
'use strict';
function makeReviewGate({authenticateOperator,inspectEvidence}){
 if(typeof authenticateOperator!=='function'||typeof inspectEvidence!=='function')throw new TypeError('trusted operator auth and evidence inspector required');
 function verify(decision,run,context){
  if(!context||context.actorType!=='operator'||context.authenticated!==true)return false;
  if(authenticateOperator(context)!==true)return false;
  if(!decision||!run||decision.goalAdvanced!==true||decision.runId!==run.id||decision.taskId!==run.taskId)return false;
  if(!Array.isArray(decision.evidenceRefs)||!decision.evidenceRefs.includes(decision.goalEvidenceRef))return false;
  if(context.reviewedRunId!==run.id||context.reviewedGoalId!==decision.goalId||context.reviewedEvidenceRef!==decision.goalEvidenceRef)return false;
  return inspectEvidence(decision,run,context)===true;
 }
 return Object.freeze({verify});
}
module.exports=Object.freeze({makeReviewGate});
