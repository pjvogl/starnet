'use strict';
// Provenance guard for replaced installer assets. Wider distribution review
// remains blocked; hashes do not grant third-party artwork rights.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'src-tauri/tauri.conf.json'),'utf8'));
const audit=fs.readFileSync(path.join(root,'docs/EYEHOLD_DESKTOP_ART_AUDIT.md'),'utf8');
const crypto=require('node:crypto');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/eyehold-desktop-assets.json'),'utf8'));
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
assert.equal(digest(manifest.generator),manifest.generatorSha256,'generator source is recorded');
const referenced=[...(config.bundle.icon||[]),config.bundle.windows?.nsis?.installerIcon,config.bundle.windows?.nsis?.headerImage,config.bundle.windows?.nsis?.sidebarImage,config.bundle.macOS?.dmg?.background].filter(Boolean);
for(const relative of referenced){
 assert(fs.existsSync(path.join(root,'src-tauri',relative)),'missing configured installer asset: '+relative);
 assert(audit.includes('src-tauri/'+relative),'unreviewed installer asset in brand provenance ledger: '+relative);
 const row=manifest.files.find(r=>r.path==='src-tauri/'+relative);
 assert(row,'configured asset missing from generated provenance manifest');
 assert.equal(digest(row.path),row.sha256,'configured asset matches original generated output');
}
assert.match(audit,/BLOCKED for distribution/);
console.log('Eyehold configured installer images match recorded procedural outputs; broader art audit and distribution remain BLOCKED');
