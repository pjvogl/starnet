'use strict';
const assert=require('node:assert/strict'),Binding=require('../frontend/app/eyehold-agent-binding.js');
for(const k of ['keep','foundry','moonleaf','forge','archive','roost','astral']){
 assert.equal(Binding.resolve('eyehold-'+k,k),k);
 assert.equal(Binding.resolve('eyehold-'+k,'generic'),null);
}
assert.equal(Binding.resolve('engineer','forge'),null);
assert.equal(Binding.resolve('eyehold-archive','forge'),null);
assert.equal(Binding.resolve(null,'forge'),null);
assert.equal(Binding.resolve('eyehold-__proto__','__proto__'),null);
console.log('Eyehold agent role/room bindings OK');
