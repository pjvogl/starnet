/* Native Eyehold milestone decorations.
 * This module cannot authorize itself: caller must supply an authenticated,
 * server-derived verified tier. Never use client netProfitUSD as proof.
 * Uses actual WorldModel addProp/persist, not fake screenshots.
 */
'use strict';
(function(root,factory){const v=factory();if(typeof module!=='undefined'&&module.exports)module.exports=v;else root.EyeholdNativeLoot=v;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const ROOM_PREFIX={command:'The Eye',opportunities:'Raven Court',strategy:'Star Sages',operations:'Iron Host',production:'Deepforge',quality:'Silver Bough',finance:'Treasury Watch'};
 // Genuine native catalog props; new fantasy illustrations require separate art.
 const PROPS={1000000:'plant',10000000:'shelf',100000000:'vault'};
 function plan(station,tier){
  if(!Object.prototype.hasOwnProperty.call(PROPS,String(tier)))throw Error('unsupported tier');
  const doc=station.serialize(),rooms=Object.values(doc.rooms||{});
  return Object.entries(ROOM_PREFIX).map(([department,prefix])=>{
   const room=rooms.find(r=>r.kind!=='corridor'&&String(r.name||'').startsWith(prefix));
   if(!room)throw Error('missing physical room for '+department);
   const rect=(room.rects||[])[0];if(!rect)throw Error('missing geometry '+department);
   const centerX=Math.floor((rect.x1+rect.x2)/2),y=rect.y1+4+([1000000,10000000,100000000].indexOf(tier));
   return {department,tier,t:PROPS[tier],x:centerX,y,w:1,h:1};
  });
 }
 function applyTrustedMilestone({station,tier,attestation,verifyAttestation,persist}){
  if(typeof verifyAttestation!=='function'||verifyAttestation(attestation,tier)!==true)
   throw Error('Trusted milestone attestation required; agents and client UI cannot self-award');
  if(!station||typeof station.addProp!=='function'||typeof station.serialize!=='function')throw Error('native station required');
  const planned=plan(station,tier),results=[];
  let changed=false;
  const existing=station.serialize().props||[];
  for(const item of planned){
   // Do not modify any occupied tile or overwrite player layout.
   const lootId='Eyehold:'+String(tier)+':'+item.department;
   if(existing.some(p=>p.label===lootId||(!p.label&&p.t===item.t&&p.x===item.x&&p.y===item.y))){
    results.push({department:item.department,ok:true,alreadyPresent:true});continue;
   }
   const result=station.addProp({t:item.t,x:item.x,y:item.y,w:item.w,h:item.h,block:false});
   if(result?.ok){changed=true;const prop=typeof station.props==='function'&&station.props().find(p=>p.id===result.id);if(prop)prop.label=lootId;}
   results.push({department:item.department,ok:!!result?.ok,error:result?.error||null,propId:result?.id||null});
  }
  if(changed&&typeof persist==='function')persist();
  return {tier,results,complete:results.every(r=>r.ok)};
 }
 return Object.freeze({plan,applyTrustedMilestone});
});
