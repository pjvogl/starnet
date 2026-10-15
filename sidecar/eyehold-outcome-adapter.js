/* Eyehold backend outcome adapter. Install this only on the trusted sidecar
 * event bus. Events are wake-up hints, not evidence or acceptance receipts.
 * Every credit is independently checked against authoritative run and
 * acceptance stores by createBridge; no client-facing award endpoint.
 */
'use strict';
const {createBridge}=require('./eyehold-work-bridge.js');
const {snapshot}=require('./eyehold-supervisor.js');
const ID=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/;
function createOutcomeAdapter({file,getRun,getAcceptance,getHistory,getAgentIds,now}){
 if(typeof getAgentIds!=='function'||typeof getHistory!=='function'||typeof now!=='function')throw new TypeError('trusted history, roster and clock required');
 const bridge=createBridge({file,getRun,getAcceptance,getHistory});
 const valid=x=>typeof x==='string'&&ID.test(x);
 function acceptedHint(event){
  if(!event||!valid(event.taskId)||!valid(event.deliverableId))return {ok:false,reason:'invalid-event-keys'};
  // The event says only *which* authoritative record to check, not whether
  // acceptance occurred. A forged client event cannot mint Crowns alone.
  return bridge.credit(event.taskId,event.deliverableId);
 }
 function runEndedHint(event){
  if(!event||!valid(event.runId))return {ok:false,reason:'invalid-run-id'};
  const run=getRun(event.runId);
  if(!run||run.id!==event.runId||run.status!=='completed'||!valid(run.taskId))return {ok:false,reason:'run-not-completed'};
  // Deliverable IDs must come from trusted acceptance storage; do not
  // infer acceptance from run.end or invent a deliverable ID.
  return {ok:true,credited:false,reason:'awaiting-authoritative-deliverable-acceptance',taskId:run.taskId};
 }
 function supervisor(){
  return snapshot({ledger:bridge,agentIds:getAgentIds(),getHistory,now:now()});
 }
 return Object.freeze({acceptedHint,runEndedHint,supervisor,totals:bridge.totals});
}
module.exports=Object.freeze({createOutcomeAdapter});
