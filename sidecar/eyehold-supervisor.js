/* Eyehold supervisor snapshot. Read-only; no grants, retries or synthetic runs.
 * Caller supplies trusted backend ledger and outcome records, not UI claims.
 */
'use strict';
const {evaluateAgent}=require('./eyehold-productivity.js');
const ID=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/;
function snapshot({ledger,agentIds,getHistory,now}){
 if(!ledger||typeof ledger.totals!=='function'||!Array.isArray(agentIds)||typeof getHistory!=='function'||!Number.isFinite(now))
   throw new TypeError('trusted ledger, agent ids, history reader and timestamp required');
 const totals=ledger.totals(), seen=new Set(),agents=[];
 for(const id of agentIds){
  if(typeof id!=='string'||!ID.test(id)||seen.has(id))continue;
  seen.add(id);
  const history=getHistory(id);
  const verified=Array.isArray(history)?history.filter(e=>e&&e.verified===true&&e.agentId===id):[];
  const complete=verified.filter(e=>['accepted','rejected','failed'].includes(e.outcome));
  const accepted=complete.filter(e=>e.outcome==='accepted').length;
  const failed=complete.filter(e=>e.outcome==='failed').length;
  const rejected=complete.filter(e=>e.outcome==='rejected').length;
  const policy=evaluateAgent(verified);
  const crowns=totals[id];
  agents.push({
   agentId:id,crowns:Number.isSafeInteger(crowns)&&crowns>=0?crowns:0,
   verifiedOutcomes:complete.length,accepted,failed,rejected,
   acceptanceRate:complete.length?accepted/complete.length:null,
   advice:{action:policy.action,reason:policy.reason},
   // Without a backend live-presence source, never call a worker running or idle.
   executionStatus:'unknown',
  });
 }
 return {asOf:now,source:'authoritative-ledger-and-verified-history',agents};
}
module.exports=Object.freeze({snapshot});
