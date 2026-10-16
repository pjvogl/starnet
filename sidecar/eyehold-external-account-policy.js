/* External commerce/banking permission policy for Eyehold.
 * Intent registry only. Never stores banking credentials or access tokens.
 * All money-moving actions fail closed until the sidecar has an authenticated
 * owner-specific connector and an explicit approval for that specific action.
 */
'use strict';
const integrations=Object.freeze({
 storefront:Object.freeze({providers:['shopify','etsy'],allowedWithoutApproval:['research','compare-fees','draft-listing','prepare-onboarding'],requiresOwnerApproval:['register-store','publish-listing','contact-customer','create-charge','issue-refund','change-payout-account','purchase-ads']}),
 finances:Object.freeze({providers:['read-only-account-aggregator','commerce-payment-reports'],allowedWithoutApproval:['draft-cashflow-report-from-verified-records'],requiresOwnerApproval:['link-account','transfer-funds','change-bank-details','withdraw','pay-vendor','file-tax-form']})
});
function authorizeAction({domain,action,operatorApproved=false,connectorVerified=false,readOnly=false}={}){
 const policy=integrations[domain];
 if(!policy||typeof action!=='string')return {allowed:false,reason:'unknown-capability'};
 if(policy.allowedWithoutApproval.includes(action))return {allowed:true,reason:'local-planning-only'};
 if(!policy.requiresOwnerApproval.includes(action))return {allowed:false,reason:'not-in-policy'};
 if(!operatorApproved||!connectorVerified)return {allowed:false,reason:'authenticated-owner-approval-and-verified-connector-required'};
 if(domain==='finances'&&readOnly)return {allowed:false,reason:'read-only-bank-integration-cannot-move-money'};
 return {allowed:true,reason:'approved-operation-requires-separate-audited-executor'};
}
module.exports={integrations,authorizeAction};
