'use strict';
const assert=require('node:assert/strict');
const E=require('../frontend/app/eyehold-environments.js');
const calls=[];
const ctx=new Proxy({save(){},restore(){},beginPath(){},stroke(){},closePath(){},moveTo(){},lineTo(){},ellipse(){},strokeRect(){calls.push('border')},fillRect(){calls.push('fill')}},{set(o,k,v){o[k]=v;return true;}});
for(const id of Object.keys(E.PALETTES)){calls.length=0;assert.equal(E.draw(ctx,id,{x:0,y:0,w:170,h:120},12),true);assert(calls.length>0);}
assert.equal(E.draw(ctx,'keep',{x:0,y:0,w:100,h:100},12),false);
assert.equal(E.draw(ctx,'forge',{x:0,y:0,w:10,h:10},12),false);
console.log('Eyehold themed floor motifs: OK');
