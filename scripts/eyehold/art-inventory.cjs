#!/usr/bin/env node
/* Inventory is review preparation, never a redistribution-rights clearance. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function inventory(root){
 const files=[];
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
  const file=path.join(dir,e.name);
  if(e.isDirectory())walk(file);
  else if(e.isFile()&&/\.(png|webp|gif|jpe?g|svg|ico|icns|bmp)$/i.test(e.name))files.push({path:path.relative(root,file).split(path.sep).join('/'),bytes:fs.statSync(file).size,status:'review-required'});
 }}
 walk(path.join(root,'frontend/assets'));
 const dirs={};for(const f of files){const d=f.path.split('/').slice(0,4).join('/');dirs[d]=(dirs[d]||0)+1;}
 return {schema:'eyehold.runtime-art-inventory.v1',scope:'Image files under frontend/assets; excludes procedural renderer source and website imagery, which require separate review',status:'BLOCKED',imageCount:files.length,totalBytes:files.reduce((n,f)=>n+f.bytes,0),pathSetSha256:crypto.createHash('sha256').update(files.map(f=>f.path).join('\n')+'\n').digest('hex'),directories:dirs,files};
}
if(require.main===module){const result=inventory(path.resolve(__dirname,'../..'));if(!process.argv.includes('--full'))delete result.files;console.log(JSON.stringify(result,null,2));}
module.exports={inventory};
