/* User-triggered multi-room crew activation. Relies only on the
 * application's existing authenticated roster, summon and WorldModel desk APIs.
 * No model calls, schedules, tool grants, financial actions or account creation.
 */
'use strict';
(function(){
 if(typeof document==='undefined')return;
 const definitions=[
  ['RAVEN COURT','eyehold-archive','Raven Court'],
  ['STAR SAGES','eyehold-astral','Star Sages'],
  ['IRON HOST','eyehold-foundry','Iron Host'],
  ['DEEPFORGE','eyehold-forge','Deepforge'],
  ['SILVER BOUGH','eyehold-moonleaf','Silver Bough'],
  ['TREASURY WATCH','eyehold-astral','Treasury Watch']
 ];
 function mount(){
  const board=document.getElementById('eyehold-workboard');if(!board||board.querySelector('[data-eye-staff]'))return;
  const box=document.createElement('details');box.dataset.eyeStaff='1';
  const title=document.createElement('summary');title.textContent='STAFF THE PHYSICAL DEPARTMENTS';box.appendChild(title);
  const message=document.createElement('p');message.textContent='Requires the seven-room station to be installed. Summons six visible specialists with existing model configuration; no tasks run and no paid provider calls start automatically.';
  const action=document.createElement('button');action.type='button';action.textContent='SUMMON & ASSIGN SIX SPECIALISTS';
  const status=document.createElement('p');status.setAttribute('role','status');
  box.append(message,action,status);board.appendChild(box);
  action.addEventListener('click',()=>{
   if(action.disabled)return;
   if(typeof App==='undefined'||typeof App.station!=='function'||typeof App.summonAgent!=='function'||typeof App.agents!=='function'||typeof Specialties==='undefined') {status.textContent='Start the station and its roster first.';return}
   const station=App.station();if(!station||typeof station.assignDesk!=='function'){status.textContent='Canonical WorldModel unavailable.';return}
   const doc=station.serialize();const rooms=Object.values(doc.rooms||{}).filter(r=>r.kind!=='corridor');
   if(rooms.length!==7){status.textContent='This station does not have the seven-room layout. Install or build it first.';return}
   if(!window.confirm('Summon and assign up to six real specialist agents? This updates the roster and places agents in the current world. It does not launch model calls, create business accounts or authorize spending.'))return;
   action.disabled=true;
   const reports=[];
   try{
    for(const [name,specialtyId,roomPrefix] of definitions){
     const room=rooms.find(r=>String(r.name||'').startsWith(roomPrefix));
     if(!room){reports.push(name+': room missing');continue}
     const desk=(doc.props||[]).find(p=>p.t==='desk'&&!p.agentId&&room.rects.some(q=>p.x>=q.x1&&p.x<=q.x2&&p.y>=q.y1&&p.y<=q.y2));
     const existing=App.agents().find(a=>String(a.name||'').toUpperCase()===name);
     if(existing){reports.push(name+': already on roster');continue}
     if(!desk){reports.push(name+': unoccupied desk not found');continue}
     const spec=Specialties.get(specialtyId);
     if(!spec){reports.push(name+': specialty not available');continue}
     const newAgent=App.summonAgent({...spec,agentName:name},{desk:false});
     if(!newAgent||!newAgent.id){reports.push(name+': summon refused');continue}
     const bind=station.assignDesk(desk.id,newAgent.id);
     reports.push(name+': '+(bind&&bind.ok?'summoned and desk assigned':'summoned; desk binding needs attention'));
    }
    if(typeof App.persist==='function')App.persist();
    if(typeof App.pushRoster==='function')App.pushRoster();
    status.textContent=reports.join(' | ');
   }catch(e){status.textContent='Some assignments may have succeeded; review roster: '+e.message+' — '+reports.join(' | ')}
   finally{action.disabled=false}
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
