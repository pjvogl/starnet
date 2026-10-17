'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {packagePlay}=require('../scripts/eyehold/package-windows-play.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'eye-play-pack-')),out=path.join(root,'output');
try{
 for(const d of ['sidecar/.secrets','sidecar/workspaces/agent','frontend','shared','node_modules','scripts/eyehold'])fs.mkdirSync(path.join(root,d),{recursive:true});
 const files={'fake-node.exe':'MZfixture','sidecar/index.js':'fixture','sidecar/.secrets/owner.json':'PRIVATE','sidecar/workspaces/agent/data.txt':'PRIVATE','sidecar/.env':'PRIVATE','frontend/index.html':'fixture','shared/schema.js':'fixture','node_modules/dependency.js':'fixture','scripts/eyehold-owner-key.cjs':'fixture','scripts/eyehold/windows-play-launcher.cjs':'fixture','package.json':'{}','LICENSE':'fixture','NOTICE.md':'fixture'};
 for(const [p,text] of Object.entries(files))fs.writeFileSync(path.join(root,p),text);
 packagePlay({root,out,nodeExecutable:path.join(root,'fake-node.exe'),platform:'win32'});
 assert(fs.existsSync(path.join(out,'runtime/node.exe')));
 assert(fs.existsSync(path.join(out,'sidecar/index.js')));
 assert(!fs.existsSync(path.join(out,'sidecar/.secrets')));assert(!fs.existsSync(path.join(out,'sidecar/workspaces')));assert(!fs.existsSync(path.join(out,'sidecar/.env')));
 assert.match(fs.readFileSync(path.join(out,'PLAY-EYEHOLD.cmd'),'utf8'),/runtime\\node\.exe/);
 assert.match(fs.readFileSync(path.join(out,'RUN-ME-FIRST.txt'),'utf8'),/localhost:8787/);
 assert.throws(()=>packagePlay({root,out,nodeExecutable:path.join(root,'fake-node.exe'),platform:'win32'}),/already exists/);
 console.log('PASS: Windows play package includes runtime and game, preserves notices, excludes user workspaces and secret files, and refuses overwriting an existing output');
}finally{fs.rmSync(root,{recursive:true,force:true})}
