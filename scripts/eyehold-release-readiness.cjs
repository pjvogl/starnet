#!/usr/bin/env node
/* Local pilot prototype: evaluate imported evidence, never probe production,
 * deploy, attest authenticity, or claim that a customer paid for the report.
 */
'use strict';
const REQUIRED=['unit','integration','security-smoke','rollback-drill'];
function assess(input,{now=Date.now()}={}){
 const reasons=[];
 if(!input||typeof input!=='object'||Array.isArray(input))return {status:'HOLD',reasons:['invalid-input'],source:'imported-evidence-only',deploymentVerified:false};
 const release=input.release||{};
 if(!/^[a-f0-9]{40}$/.test(release.commit||''))reasons.push('exact-release-commit-required');
 if(!/^[a-f0-9]{64}$/.test(release.artifactSha256||''))reasons.push('artifact-sha256-required');
 const captured=typeof input.capturedAt==='string'?Date.parse(input.capturedAt):NaN;
 if(!Number.isFinite(captured)||captured>now+300000||now-captured>86400000)reasons.push('evidence-must-be-within-24-hours');
 const checks=Array.isArray(input.checks)?input.checks:[];
 for(const name of REQUIRED){
  const rows=checks.filter(c=>c&&c.id===name);
  if(rows.length!==1||rows[0].status!=='pass'||typeof rows[0].evidenceRef!=='string'||!rows[0].evidenceRef.trim())reasons.push(name+'-passing-evidence-required');
 }
 const samples=Array.isArray(input.healthSamples)?input.healthSamples:[];
 const valid=samples.length>=100&&samples.length<=10000&&samples.every(s=>s&&typeof s.ok==='boolean'&&Number.isFinite(s.latencyMs)&&s.latencyMs>=0);
 let p95=null,errors=null;
 if(!valid)reasons.push('100-to-10000-valid-health-samples-required');
 else{
  const times=samples.map(s=>s.latencyMs).sort((a,b)=>a-b);
  p95=times[Math.ceil(times.length*0.95)-1];errors=samples.filter(s=>!s.ok).length;
  if(errors!==0)reasons.push('health-errors-must-be-zero');
  if(p95>500)reasons.push('health-p95-must-not-exceed-500ms');
 }
 return {schema:'eyehold.release-readiness.v1',status:reasons.length?'HOLD':'READY_FOR_OWNER_REVIEW',source:'imported-evidence-only',deploymentVerified:false,
  release:{commit:release.commit||null,artifactSha256:release.artifactSha256||null},sampleCount:samples.length,p95LatencyMs:p95,errorCount:errors,reasons};
}
if(require.main===module){
 const fs=require('node:fs');
 try{
  if(process.argv.length!==3)throw Error('input-required');
  const file=process.argv[2];if(fs.statSync(file).size>2*1024*1024)throw Error('input-too-large');
  const report=assess(JSON.parse(fs.readFileSync(file,'utf8')));
  console.log(JSON.stringify(report,null,2));if(report.status==='HOLD')process.exitCode=1;
 }catch{console.error('Usage: node scripts/eyehold-release-readiness.cjs <evidence.json> (valid JSON, maximum 2 MiB)');process.exitCode=2}
}
module.exports={assess,REQUIRED};
