/* Eyehold pure productivity and taskmaster policy.
 * Decisions only: NEVER executes work, grants permission, or mints spend.
 * Caller must pass server-verified receipts, not frontend claims.
 */
'use strict';
const ID=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/;
const valid=x=>typeof x==='string'&&ID.test(x);
const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
function creditedPool(receipt){
 if(!receipt||receipt.verified!==true||receipt.accepted!==true||!valid(receipt.taskId)||!valid(receipt.deliverableId)||!valid(receipt.runId))return 0;
 if(!['user','objective-test','external'].includes(receipt.verificationMethod))return 0;
 if(!Array.isArray(receipt.evidenceRefs)||!receipt.evidenceRefs.length||!receipt.evidenceRefs.every(valid))return 0;
 const quality=integer(receipt.quality,1,5)?receipt.quality:0;
 const bonus=receipt.testPassed===true?5:0;
 const complexity=integer(receipt.predeclaredComplexity,1,2)?receipt.predeclaredComplexity:1;
 return Math.round((10+bonus+quality*2)*complexity);
}
function score(receipt){
 const pool=creditedPool(receipt);
 if(!pool)return Object.freeze({crowns:0,allocations:[],reason:'not-verified-and-accepted'});
 const ids=Array.isArray(receipt.contributors)?receipt.contributors:[];
 if(!ids.length||!ids.every(valid)||new Set(ids).size!==ids.length)return Object.freeze({crowns:0,allocations:[],reason:'invalid-contributors'});
 const sorted=[...ids].sort();
 const base=Math.floor(pool/sorted.length),remaining=pool%sorted.length;
 return Object.freeze({crowns:pool,allocations:sorted.map((agentId,i)=>({agentId,crowns:base+(i<remaining?1:0)})),reason:'verified'});
}
function apply(ledger,receipt){
 const events=Array.isArray(ledger)?ledger:[];
 const result=score(receipt);
 if(!result.crowns)return {events:events.slice(),result};
 const revision=integer(receipt.acceptanceRevision,1,100000)?receipt.acceptanceRevision:1;
 const key=[receipt.taskId,receipt.deliverableId,revision].join('|');
 if(events.some(e=>e&&e.key===key))return {events:events.slice(),result:{crowns:0,allocations:[],reason:'duplicate'}};
 const event={key,taskId:receipt.taskId,runId:receipt.runId,deliverableId:receipt.deliverableId,acceptanceRevision:revision,verificationMethod:receipt.verificationMethod,evidenceRefs:receipt.evidenceRefs.slice(),crowns:result.crowns,allocations:result.allocations};
 return {events:[...events,event],result};
}
function evaluateAgent(history){
 const records=Array.isArray(history)?history.filter(x=>x&&x.verified===true):[];
 const recent=records.slice(-10);
 const failures=recent.filter(x=>x.outcome==='failed').length;
 const accepted=recent.filter(x=>x.outcome==='accepted').length;
 const rejected=recent.filter(x=>x.outcome==='rejected').length;
 const completed=accepted+failures+rejected;
 // Abstain with too little evidence; never penalize offline/awaiting approvals.
 if(completed<3)return {action:'observe',reason:'insufficient-verified-history',completed,accepted,failures};
 const last3=recent.slice(-3);
 if(last3.length===3&&last3.every(x=>x.outcome==='failed'))return {action:'request-review',reason:'three-consecutive-failures',completed,accepted,failures};
 if(failures+rejected>=3&&accepted/completed<0.5)return {action:'recommend-reassignment',reason:'low-verified-success-rate',completed,accepted,failures};
 if(failures>=2)return {action:'recommend-diagnosis',reason:'repeated-failures',completed,accepted,failures};
 return {action:'observe',reason:'within-range',completed,accepted,failures};
}
module.exports=Object.freeze({score,apply,evaluateAgent});
