/* Evidence-only business finance report.
 * Distinguishes zero from missing records; never synthesizes transactions.
 */
'use strict';
const PROFIT_MILESTONES_USD=Object.freeze([1000000,10000000,100000000]);
function milestoneState(netProfitUSD){
 if(netProfitUSD===null)return {currentMilestoneUSD:PROFIT_MILESTONES_USD[0],completedMilestonesUSD:[],remainingToNextUSD:null,ultimateMilestoneReached:false};
 const completedMilestonesUSD=PROFIT_MILESTONES_USD.filter(goal=>netProfitUSD>=goal);
 const next=PROFIT_MILESTONES_USD.find(goal=>netProfitUSD<goal);
 return {currentMilestoneUSD:next??PROFIT_MILESTONES_USD.at(-1),completedMilestonesUSD,remainingToNextUSD:next===undefined?0:Math.max(0,next-netProfitUSD),ultimateMilestoneReached:next===undefined};
}
function reportBusinessProfit({records,goalUSD=1000000}={}){
 if(!Array.isArray(records)||!records.length)return Object.freeze({status:'unavailable',reason:'No verified revenue or expense records connected',netProfitUSD:null,remainingUSD:null,goalUSD,...milestoneState(null)});
 let revenue=0,expenses=0;
 for(const r of records){
  if(!r||r.verified!==true||!['revenue','expense','refund','fee','model-cost'].includes(r.type)||!Number.isSafeInteger(r.cents)||r.cents<0||!r.evidenceRef) return Object.freeze({status:'unavailable',reason:'Record unverified, malformed or lacking evidence',netProfitUSD:null,remainingUSD:null,goalUSD,...milestoneState(null)});
  if(r.type==='revenue')revenue+=r.cents;else expenses+=r.cents;
 }
 if(!Number.isSafeInteger(revenue)||!Number.isSafeInteger(expenses))throw Error('Financial totals exceed safe integer range');
 const netProfitUSD=(revenue-expenses)/100;
 return Object.freeze({status:'verified-records-only',netProfitUSD,remainingUSD:Math.max(0,goalUSD-netProfitUSD),goalUSD,recordCount:records.length,...milestoneState(netProfitUSD),scope:'Only supplied verified business records; not a reconciled bank balance'});
}
module.exports={reportBusinessProfit,PROFIT_MILESTONES_USD,milestoneState};
