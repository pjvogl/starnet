'use strict';
// Development-only provenance guard. This test passes only when the release is
// explicitly acknowledged as BLOCKED pending original desktop artwork.
// It does NOT certify that files have been replaced or licensed.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'src-tauri/tauri.conf.json'),'utf8'));
const audit=fs.readFileSync(path.join(root,'docs/EYEHOLD_DESKTOP_ART_AUDIT.md'),'utf8');
const referenced=[...(config.bundle.icon||[]),config.bundle.windows?.nsis?.installerIcon,config.bundle.windows?.nsis?.headerImage,config.bundle.windows?.nsis?.sidebarImage,config.bundle.macOS?.dmg?.background].filter(Boolean);
for(const relative of referenced){
 assert(fs.existsSync(path.join(root,'src-tauri',relative)),'missing configured installer asset: '+relative);
 assert(audit.includes('src-tauri/'+relative),'unreviewed installer asset in brand provenance ledger: '+relative);
}
assert.match(audit,/BLOCKED for distribution/);
console.log('Eyehold asset inventory complete; distribution remains BLOCKED pending replacement');
