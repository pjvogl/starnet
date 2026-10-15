'use strict';
const assert=require('node:assert/strict');
const Specialties=require('../frontend/app/specialties.js');
const ids=['keep','foundry','moonleaf','forge','archive','roost','astral'];
for(const id of ids){
 const spec=Specialties.get('eyehold-'+id);
 assert(spec,'deployable Eyehold role missing: '+id);
 assert(Specialties.list().some(s=>s.id===spec.id));
 assert.deepEqual(spec.kit,[],'theme must not grant hardware capability');
 assert.deepEqual(spec.skills,[],'theme must not grant skills');
 assert.equal(spec.custom,false);
 assert(Specialties.compose(spec).manual.includes('permissions actually granted'));
}
assert.equal(Specialties.get('eyehold-unknown'),null);
console.log('Eyehold specialist deployment through existing Specialties interface OK');
