/* Eyehold physical layout planning guide. Never mutates the canonical WorldModel.
 * Building requires the Commander to place rooms in BUILD MODE so collisions,
 * door paths, persistence and undo remain under the original game rules.
 */
'use strict';
(function(root,factory){
 const v=factory();if(typeof module!=='undefined'&&module.exports)module.exports=v;else root.EyeholdRoomPlan=v;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const plan=Object.freeze([
  {id:'command',kind:'bridge',territory:'keep',instruction:'Place a BRIDGE near the existing central entrance; designate it the Command Keep.'},
  {id:'opportunities',kind:'lab',territory:'archive',instruction:'Place a LAB reachable by corridor; designate Raven Court.'},
  {id:'strategy',kind:'lab',territory:'astral',instruction:'Place a second LAB for Star Sages strategy.'},
  {id:'operations',kind:'factory',territory:'foundry',instruction:'Place a FOUNDRY for Iron Host operations.'},
  {id:'production',kind:'factory',territory:'forge',instruction:'Place another FOUNDRY for Deepforge production.'},
  {id:'quality',kind:'lab',territory:'moonleaf',instruction:'Place a LAB for Silver Bough quality checks.'},
  {id:'finance',kind:'storage',territory:'astral',instruction:'Place a STORAGE room for Treasury Watch read-only oversight.'}
 ].map(x=>Object.freeze(x)));
 return Object.freeze({plan});
});
