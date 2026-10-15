/* Trusted owner-review bridge for the Eyehold Crown runtime.
 * This is NOT an HTTP endpoint. The real sidecar must authenticate its owner
 * first and pass an opaque, server-issued operator context. Never pass client
 * assertions as authentication or artifact verification.
 */
'use strict';
const {createCrownRuntime}=require('./eyehold-crown-runtime.js');
const {makeReviewGate}=require('./eyehold-review-gate.js');
function createOwnerReviewRuntime({authenticateOperator,inspectEvidence,...runtimeArgs}){
 const gate=makeReviewGate({authenticateOperator,inspectEvidence});
 let active=null;
 const runtime=createCrownRuntime({...runtimeArgs,verifyEvidence:(decision,run)=>{
  if(!active||active.decision!==decision)return false;
  return gate.verify(decision,run,active.context);
 }});
 function approve(decision,context){
  if(active)throw Error('nested review is forbidden');
  // A single in-process synchronous operation controls the temporary
  // capability. The runtime/ledger emit only after durable acceptance.
  active={decision,context};
  try{return runtime.acceptVerifiedDeliverable(decision)}
  finally{active=null}
 }
 return Object.freeze({
  approve,
  readAcceptance:runtime.readAcceptance,
  crownTotals:runtime.crownTotals,
  supervisor:runtime.supervisor,
  close:runtime.close
 });
}
module.exports=Object.freeze({createOwnerReviewRuntime});
