'use strict';
const assert=require('node:assert/strict');
const S=require('../frontend/app/eyehold-factions.js');
const ctx={save(){},restore(){},fillRect(){this.count++},count:0};
for(const [id,rec] of Object.entries(S.sprites)){assert(S.validate(rec),id+' must be a valid 16x18 grid');ctx.count=0;const r=S.draw(ctx,{px:80,py:100},0,id);assert(r&&r.top===83);assert(ctx.count>50);}
assert.equal(S.draw(ctx,{px:80,py:100},0,'unknown'),null);
console.log('Eyehold six faction sprites OK');
