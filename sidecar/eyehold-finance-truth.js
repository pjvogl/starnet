/* Evidence-only business finance report.
 * Distinguishes zero from missing records; never synthesizes transactions.
 */
'use strict';
function reportBusinessProfit({records,goalUSD=1000000}={}){
 if(!Array.isArray(records)||!records.length)return Object.freeze({status:'unavailable',reason:'No verified revenue or expense records connected',netProfitUSD:null,remainingUSD:null,goalUSD});
 let revenue=0,expenses=0;
 for(const r of records){
  if(!r||r.verified!==true||!['revenue','expense','refund','fee','model-cost'].includes(r.type)||!Number.isSafeInteger(r.cents)||r.cents<0||!r.evidenceRef) return Object.freeze({status:'unavailable',reason:'Record unverified, malformed or lacking evidence',netProfitUSD:null,remainingUSD:null,goalUSD});
  if(r.type==='revenue')revenue+=r.cents;else expenses+=r.cents;
 }
 if(!Number.isSafeInteger(revenue)||!Number.isSafeInteger(expenses))throw Error('Financial totals exceed safe integer range');
 const netProfitUSD=(revenue-expenses)/100;
 return Object.freeze({status:'verified-records-only',netProfitUSD,remainingUSD:Math.max(0,goalUSD-netProfitUSD),goalUSD,recordCount:records.length,scope:'Only supplied verified business records; not a reconciled bank balance'});
}
module.exports={reportBusinessProfit};
