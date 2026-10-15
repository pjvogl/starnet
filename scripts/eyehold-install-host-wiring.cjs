/* Usage: node scripts/eyehold-install-host-wiring.cjs
 * Guarded one-time patch for the production sidecar entrypoint. Fails on any
 * unexpected source version; re-runnable with no duplicate insertion.
 * Installs a safe dormant Crown runtime with no accept/award HTTP endpoint.
 * Independent evidence authorization is intentionally fail-closed until a
 * reviewer-approved verification path is implemented.
 * Production CI installs only after JS syntax and Crown unit tests pass.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const source=path.resolve(__dirname,'../sidecar/index.js');
const before=fs.readFileSync(source,'utf8');
const anchor="const runStore = makeRunStore({ io: runsIo, clock: { now: () => Date.now() }, completionAuthority });";
const marker="/* EYEHOLD_TRUSTED_CROWN_RUNTIME_START */";
if(before.includes(marker)){console.log('Eyehold host wiring already present');process.exit(0)}
if(before.split(anchor).length!==2)throw Error('Production runStore anchor drift: refusing automated edit');
const insert=`
/* EYEHOLD_TRUSTED_CROWN_RUNTIME_START */
/* The real run ledger is authoritative. Crown awards stay blocked until a
 * separately authorized reviewer validates an actual business milestone. */
const eyeholdCrownEvents = new (require('node:events').EventEmitter)();
const eyeholdReadRun = require('./eyehold-runstore-adapter.js').makeEyeholdRunReader(runStore);
const eyeholdCrownRuntime = require('./eyehold-crown-runtime.js').createCrownRuntime({
  workspaceDir: WORKSPACES,
  events: eyeholdCrownEvents,
  getRun: eyeholdReadRun,
  // Fail closed: no agent or local API request can invent economic progress.
  verifyEvidence: () => false,
  getHistory: () => [],
  getAgentIds: () => Array.from(new Set((runStore.all() || []).map(r => r.agentId).filter(Boolean))),
  now: () => Date.now()
});
/* EYEHOLD_TRUSTED_CROWN_RUNTIME_END */
`;
const after=before.replace(anchor,anchor+insert);
if(after===before||!after.includes(marker))throw Error('Host splice failed');
fs.writeFileSync(source,after);
console.log('Installed fail-closed Crown runtime after authoritative runStore initialization');
