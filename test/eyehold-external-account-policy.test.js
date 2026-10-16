'use strict';
const assert=require('node:assert/strict');
const {authorizeAction}=require('../sidecar/eyehold-external-account-policy.js');
for(const [domain,action] of [['storefront','register-store'],['storefront','publish-listing'],['storefront','change-payout-account'],['finances','transfer-funds'],['finances','link-account']]){
 assert.equal(authorizeAction({domain,action}).allowed,false,domain+': '+action+' must fail closed');
 assert.equal(authorizeAction({domain,action,operatorApproved:true}).allowed,false,'approval cannot bypass connector');
}
assert.equal(authorizeAction({domain:'storefront',action:'research'}).allowed,true);
assert.equal(authorizeAction({domain:'storefront',action:'draft-listing'}).allowed,true);
assert.equal(authorizeAction({domain:'finances',action:'transfer-funds',operatorApproved:true,connectorVerified:true,readOnly:true}).allowed,false);
assert.equal(authorizeAction({domain:'finances',action:'bank-password'}).allowed,false);
console.log('PASS: unauthorized storefront, bank transfer and payout changes are refused by the policy module.');
console.log('PENDING: wire these checks at the actual connector execution boundary before enabling integrations.');
