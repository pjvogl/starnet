/* Eyehold truthful identity binding: a faction skin requires BOTH a real
 * specialty configured on the roster agent AND its actual capability-room
 * theme matching that specialty. This never changes tools or assignments. */
'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EyeholdAgentBinding=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const known=new Set(['keep','foundry','moonleaf','forge','archive','roost','astral']);
 function resolve(specialtyId,territory){
   if(typeof specialtyId!=='string'||typeof territory!=='string'||!known.has(territory))return null;
   return specialtyId==='eyehold-'+territory?territory:null;
 }
 return Object.freeze({resolve});
});
