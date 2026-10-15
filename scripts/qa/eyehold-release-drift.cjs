#!/usr/bin/env node
/* Read-only report of release-surface drift; NEVER approves a release or updates claims.json. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..');
function git(args){return cp.execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}).trim();}
function hash(s){return crypto.createHash('sha256').update(s).digest('hex');}
function inspect(){
 const ledger=JSON.parse(fs.readFileSync(path.join(root,'qa/product-perfect/claims.json'),'utf8'));
 const locked=new Map(ledger.releaseSurface.files.map(r=>[r.path,r]));
 const paths=git(['ls-files','-z']).split('\0').filter(Boolean).filter(p=>(p.startsWith('frontend/')&&/\.(css|js|html)$/i.test(p))||['INSTALL.md','PRIVACY.md','README.md','RELEASE_NOTES.md','TERMS.md','docs/DOWNLOAD_PAGE.md','docs/RELEASE_NOTES_v1.0.0_DRAFT.md'].includes(p)).sort();
 const added=paths.filter(p=>!locked.has(p));
 const removed=[...locked.keys()].filter(p=>!paths.includes(p));
 const changed=paths.filter(p=>locked.has(p)).filter(p=>{
   const buf=fs.readFileSync(path.join(root,p));const info=locked.get(p);
   return buf.length!==info.bytes||hash(buf)!==info.sha256;
 });
 return {baseline:ledger.releaseSurface.sourceCommit,candidate:git(['rev-parse','HEAD']),added,removed,changed,blocked:added.length+removed.length+changed.length>0};
}
if(require.main===module){
 const r=inspect();
 const summary=[
 '# Eyehold release surface drift (diagnostic only)','',
 'Baseline: `'+r.baseline+'`  ',
 'Candidate: `'+r.candidate+'`','',
 '**Release review required:** '+(r.blocked?'YES':'No surface drift detected (not a release approval)'),'',
 ...[['New frontend/release files',r.added],['Changed locked files',r.changed],['Removed locked files',r.removed]].flatMap(([name,arr])=>['## '+name,'',...(arr.length?arr.map(x=>'- `'+x+'`'):['None']),'']),
 'Do not regenerate the authoritative claims ledger without verifying licensing, source claims, and tested behavior.',''
 ].join('\n');
 if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(r,null,2)+'\n');
 else process.stdout.write(summary);
 // Reporting drift is successful diagnostic execution; gate ownership stays with existing tests.
}
module.exports={inspect};
