/* Authenticated owner-only acceptance HTTP handler.
 * The sidecar must wire authorizeRequest to its EXISTING host-side auth and
 * inspectEvidence to a trusted artifact check. No request body may carry auth
 * identity or a pre-verified evidence boolean. Fail closed by default.
 */
'use strict';
const {createOwnerReviewRuntime}=require('./eyehold-owner-review-runtime.js');
const MAX_BODY=16384;
function createOwnerReviewHandler({authorizeRequest,inspectEvidence,...runtimeOptions}){
 if(typeof authorizeRequest!=='function'||typeof inspectEvidence!=='function')throw new TypeError('host authorization and independent evidence inspection required');
 const ticket=new WeakMap();
 const runtime=createOwnerReviewRuntime({...runtimeOptions,
  authenticateOperator:ctx=>!!ctx&&ticket.get(ctx)===true,
  inspectEvidence:(decision,run,ctx)=>inspectEvidence(decision,run,ctx)===true
 });
 async function handle(req,res){
  const send=(code,obj)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj))};
  if(req.method!=='POST')return send(405,{ok:false,error:'method-not-allowed'});
  const operator=await authorizeRequest(req);
  if(!operator||operator.authorized!==true||typeof operator.id!=='string'||!operator.id)return send(403,{ok:false,error:'owner-authorization-required'});
  let body='';
  try{
   for await(const chunk of req){body+=chunk.toString('utf8');if(Buffer.byteLength(body,'utf8')>MAX_BODY)return send(413,{ok:false,error:'too-large'})}
   const payload=JSON.parse(body);
   const decision=payload&&payload.decision;
   if(!decision||typeof decision!=='object'||Array.isArray(decision))return send(400,{ok:false,error:'invalid-decision'});
   // Server-derived review identity: no actorType, authenticated or evidence flag
   // accepted from HTTP JSON. Artifact check has to inspect authoritative data.
   const ctx={actorType:'operator',authenticated:true,operatorId:operator.id,
    reviewedRunId:decision.runId,reviewedGoalId:decision.goalId,
    reviewedEvidenceRef:decision.goalEvidenceRef};
   ticket.set(ctx,true);
   let outcome;
   try{outcome=runtime.approve(decision,ctx)}
   finally{ticket.delete(ctx)}
   return send(outcome.ok?200:422,outcome);
  }catch(e){return send(400,{ok:false,error:'invalid-review-request'})}
 }
 return Object.freeze({handle,readAcceptance:runtime.readAcceptance,crownTotals:runtime.crownTotals,close:runtime.close});
}
module.exports=Object.freeze({createOwnerReviewHandler});
