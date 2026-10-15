#!/usr/bin/env node
/* Turn a real delegated output into an inspectable operator review packet.
 * This is a structural QA gate, NOT business-goal verification or approval.
 * No Crowns, sales, or USD are minted by this script.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function review(dir){
 const manifestPath=path.join(dir,'review-manifest.json'),deliverablePath=path.join(dir,'deepforge-deliverable.md');
 const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 const output=fs.readFileSync(deliverablePath,'utf8');
 const checks={
  validUnapprovedManifest:manifest?.approved===false&&manifest?.earnedCrowns===0&&manifest?.kind==='unreviewed-agent-output',
  realDelegation:manifest?.delegatedBy==='agent'&&typeof manifest?.workerRunId==='string'&&manifest.workerRunId.length>0,
  taskSpecified:typeof manifest?.assignment==='string'&&manifest.assignment.trim().length>=15,
  substantiveDeliverable:output.trim().length>=80,
  outputNotPlaceholder:!/(^|\n)\s*(?:TODO|TBD|PLACEHOLDER)\s*(?:\n|$)/i.test(output)
 };
 const contentSha256=crypto.createHash('sha256').update(output).digest('hex');
 const packet={schema:'eyehold.review-packet.v1',status:'awaiting-human-review',approved:false,earnedCrowns:0,workerRunId:manifest.workerRunId||null,assignment:manifest.assignment||null,contentSha256,checks,structuralChecksPassed:Object.values(checks).every(Boolean),note:'Automated structural checks are not acceptance, independent fact verification or revenue evidence.'};
 fs.writeFileSync(path.join(dir,'quality-check.json'),JSON.stringify(packet,null,2)+'\n');
 const checklist=[
  '# Eyehold — deliverable review',
  '',
  '**Not yet approved. No Crowns awarded. No revenue claimed.**',
  '',
  '## Requested work',
  manifest.assignment||'(missing)',
  '',
  '## Review this actual output',
  'Open `deepforge-deliverable.md`, then consider:',
  '- [ ] Does it actually answer the assigned task?',
  '- [ ] Are factual claims and references checked independently?',
  '- [ ] Is it useful, accurate, legal, and safe to deliver?',
  '- [ ] Does it advance a specific approved business goal, with verifiable evidence?',
  '- [ ] Is the quality acceptable without additional edits?',
  '',
  '## Traceability',
  '- Worker run ID: `'+String(manifest.workerRunId||'unknown')+'`',
  '- SHA-256 of output: `'+contentSha256+'`',
  '- Structural QA: '+(packet.structuralChecksPassed?'passed':'needs attention'),
  '',
  'These files are an operator review package, not an automatic approval mechanism.',
  ''
 ].join('\n');
 fs.writeFileSync(path.join(dir,'REVIEW_ME.md'),checklist);
 if(!packet.structuralChecksPassed)throw Error('Deliverable structural QA failed: '+Object.entries(checks).filter(([,v])=>!v).map(([k])=>k).join(', '));
 return packet;
}
if(require.main===module){
 const dir=process.argv[2];if(!dir)throw Error('Usage: node scripts/eyehold-review-packet.cjs <artifact-directory>');
 const packet=review(path.resolve(dir));
 console.log('Human review packet ready:',packet.contentSha256);
}
module.exports={review};
