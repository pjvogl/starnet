/* Eyehold operator's live work board.
 * Read-only view of actual sidecar run history; never simulates runs or awards.
 * The station/world animation remains handled by the original runtime.
 */
'use strict';
(function(){
 if(typeof document==='undefined')return;
 const setup=()=>{
  if(document.getElementById('eyehold-workboard'))return;
  const toggle=document.createElement('button');
  toggle.type='button';toggle.textContent='WORK BOARD';toggle.setAttribute('aria-controls','eyehold-workboard');
  toggle.style.cssText='position:fixed;bottom:18px;right:18px;z-index:995;padding:9px 13px;border:1px solid #aa8d5c;border-radius:5px;background:#1b1719;color:#e7d8b8;font:14px monospace;cursor:pointer';
  const board=document.createElement('section');
  board.id='eyehold-workboard';board.setAttribute('aria-label','Eyehold work board');
  board.hidden=true;
  board.style.cssText='position:fixed;bottom:57px;right:18px;z-index:995;width:min(420px,calc(100vw - 36px));max-height:55vh;overflow:auto;padding:14px;border:1px solid #aa8d5c;border-radius:6px;background:#171518;color:#e7d8b8;font:13px/1.5 monospace;box-shadow:0 8px 35px #000b';
  const heading=document.createElement('h2');heading.textContent='THE EYE — WORK BOARD';heading.style.cssText='font:17px monospace;margin:0 0 8px';
  const description=document.createElement('p');description.textContent='Live sidecar run history. Finished work must still be reviewed; no Crowns are implied.';description.style.margin='0 0 9px';
  const status=document.createElement('p');status.textContent='Open to load real run records.';status.setAttribute('role','status');
  const list=document.createElement('ol');list.style.cssText='padding-left:20px;margin:8px 0';
  const refresh=document.createElement('button');refresh.textContent='REFRESH';refresh.type='button';
  refresh.style.cssText='background:#33272a;color:#f0d6a8;border:1px solid #806c4f;padding:6px 10px;cursor:pointer';
  const detail=document.createElement('section');detail.setAttribute('aria-label','Selected agent deliverable');detail.hidden=true;detail.style.cssText='border-top:1px solid #665741;margin-top:12px;padding-top:10px';
  const detailHead=document.createElement('h3');detailHead.textContent='WORK DETAIL';
  const detailBody=document.createElement('pre');detailBody.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;max-height:30vh;overflow:auto';
  detail.append(detailHead,detailBody);
  const assign=document.createElement('button');assign.type='button';assign.textContent='ASSIGN WORK IN COMMS';assign.style.cssText='margin:0 8px 8px 0;background:#33272a;color:#f0d6a8;border:1px solid #806c4f;padding:6px 10px;cursor:pointer';
  assign.addEventListener('click',()=>{board.hidden=true;toggle.setAttribute('aria-expanded','false');const target=document.querySelector('#chat-input, #chat-textarea, textarea[placeholder*=\"message\" i]');if(target){target.focus();status.textContent='Enter your assignment in COMMS. Nothing was sent automatically.';}else{status.textContent='Open COMMS to assign work; no job was started.';if(typeof StationUI!==\'undefined\'&&StationUI.openTerm)StationUI.openTerm(\'comms\');}});
  const departments=document.createElement('details');
  const deptHeading=document.createElement('summary');deptHeading.textContent='BUSINESS DEPARTMENTS — responsibilities and handoffs';
  departments.appendChild(deptHeading);
  const definitions=(typeof EyeholdDepartments!=='undefined'&&EyeholdDepartments.rooms)||[];
  for(const room of definitions){
   const section=document.createElement('article');section.style.cssText='border-top:1px solid #453c35;margin-top:8px;padding-top:8px';
   const label=document.createElement('strong');label.textContent=room.name;
   const note=document.createElement('p');note.textContent=room.mission+' '+room.handoff;
   const state=document.createElement('small');state.textContent='Role plan only — room/agent activation not yet verified; '+room.authority;
   section.append(label,note,state);departments.appendChild(section);
  }
  const buildGuide=document.createElement('details');
  const buildSummary=document.createElement('summary');buildSummary.textContent='BUILD THE SEVEN PHYSICAL ROOMS';
  buildGuide.appendChild(buildSummary);
  const guideIntro=document.createElement('p');guideIntro.textContent='Use the existing BUILD MODE to place and connect real rooms. The plan never creates geometry or agents automatically.';
  buildGuide.appendChild(guideIntro);
  const roomPlan=(typeof EyeholdRoomPlan!=='undefined'&&EyeholdRoomPlan.plan)||[];
  for(const step of roomPlan){
   const item=document.createElement('p');item.textContent=step.instruction+' Room type: '+step.kind+'. Territory: '+step.territory+'.';
   buildGuide.appendChild(item);
  }
  departments.appendChild(buildGuide);
  const coverage=document.createElement('p');coverage.setAttribute('role','status');
  coverage.textContent='Crew assignments not checked.';
  departments.appendChild(coverage);
  const crewCheck=document.createElement('button');crewCheck.type='button';crewCheck.textContent='CHECK LIVE CREW';crewCheck.style.cssText='margin:8px 0;background:#33272a;color:#f0d6a8;border:1px solid #806c4f;padding:6px 10px;cursor:pointer';
  departments.appendChild(crewCheck);
  crewCheck.addEventListener('click',async()=>{
   coverage.textContent='Checking actual roster and workstation assignments…';
   try{
    if(typeof App==='undefined'||typeof App.agents!=='function'||typeof App.station!=='function')throw Error('game not yet initialized');
    const agents=App.agents(),station=App.station();
    if(!station||typeof station.serialize!=='function')throw Error('station document missing');
    const doc=station.serialize(),rooms=Object.values(doc.rooms||{}).filter(r=>r.kind!=='corridor');
    const expected=[
     ['RAVEN COURT','Raven Court','eyehold-archive'],
     ['STAR SAGES','Star Sages','eyehold-astral'],
     ['IRON HOST','Iron Host','eyehold-foundry'],
     ['DEEPFORGE','Deepforge','eyehold-forge'],
     ['SILVER BOUGH','Silver Bough','eyehold-moonleaf'],
     ['TREASURY WATCH','Treasury Watch','eyehold-astral']];
    const matched=expected.filter(([name,prefix,specialty])=>{
     const agent=agents.find(a=>String(a.name||'').toUpperCase()===name&&a.specialtyId===specialty);
     const room=rooms.find(r=>String(r.name||'').startsWith(prefix));
     if(!agent||!room)return false;
     return (doc.props||[]).some(p=>p.t==='desk'&&p.agentId===agent.id&&room.rects.some(q=>p.x>=q.x1&&p.x<=q.x2&&p.y>=q.y1&&p.y<=q.y2));
    });
    const hero=agents.find(a=>a.id==='agent');
    const command=hero&&rooms.some(r=>r.eyeTerritory==='keep');
    coverage.textContent=(matched.length+(command?1:0))+' of 7 departments have a real agent and a suitable room; '+matched.length+' specialist workstations verified. A room's presence alone does not prove model activity.';
   }catch(e){coverage.textContent='Cannot verify staffing: '+e.message}
  });
  board.append(heading,description,departments,assign,refresh,status,list,detail);
  document.body.append(toggle,board);
  let loading=false;
  // Reflect actual live sidecar records while this panel is visible.
  const poll=setInterval(()=>{if(!board.hidden&&document.visibilityState==='visible')load()},5000);
  window.addEventListener('pagehide',()=>clearInterval(poll),{once:true});
  async function load(){
   if(loading||board.hidden)return;
   loading=true;status.textContent='Reading real run records…';
   try{
    const response=await fetch('/api/runs?agent=*&limit=20',{cache:'no-store'});
    if(!response.ok)throw Error('Run history unavailable (HTTP '+response.status+')');
    const data=await response.json();const runs=Array.isArray(data.runs)?data.runs:[];
    list.replaceChildren();
    for(const run of runs.slice(0,20)){
     const li=document.createElement('li');
     const agent=String(run.agentId||'Unknown agent').slice(0,60);
     const name=String(run.title||run.deliveryText||run.runId||'Untitled run').replace(/\s+/g,' ').slice(0,100);
     const outcome=run.reason==='done'?'Completed':run.reason?String(run.reason).slice(0,40):'Recorded';
     const open=document.createElement('button');open.type='button';open.textContent=agent+' — '+name+' ['+outcome+']';
     open.style.cssText='background:none;color:#ead6ad;text-align:left;border:0;text-decoration:underline;cursor:pointer;font:inherit';
     open.addEventListener('click',()=>showDetails(run));li.appendChild(open);
     li.style.marginBottom='8px';list.appendChild(li);
    }
    status.textContent=runs.length?runs.length+' recent run records; open existing sessions or OUTBOX to inspect content.':'No run records in this sidecar workspace yet.';
   }catch(e){list.replaceChildren();status.textContent='Unable to load run history. Start or reconnect the local sidecar. '+e.message}
   finally{loading=false}
  }
  async function showDetails(run){
   detail.hidden=false;detailHead.textContent='WORK DETAIL — '+String(run.agentId||'Agent').slice(0,60);
   detailBody.textContent='Loading recorded output…';
   const agent=String(run.agentId||'agent');const stream=String(run.streamId||'');
   if(!/^[A-Za-z0-9_-]{1,100}$/.test(stream)){detailBody.textContent='This run has no available transcript stream. Open its original session or OUTBOX to inspect work.';return}
   try{
    const url='/api/transcript?agent='+encodeURIComponent(agent)+'&stream='+encodeURIComponent(stream)+'&limit=150';
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok)throw Error('Transcript unavailable (HTTP '+response.status+')');
    const data=await response.json();const turns=Array.isArray(data.turns)?data.turns:[];
    const messages=turns.filter(t=>t&&t.role==='assistant'&&typeof t.content==='string'&&t.content.trim());
    detailBody.textContent=messages.length?messages.map(t=>t.content).join('\n\n').slice(0,30000):'No saved assistant output found for this run. It may be available in the original session or OUTBOX.';
   }catch(e){detailBody.textContent='Unable to read this saved work: '+e.message}
  }
  toggle.addEventListener('click',()=>{board.hidden=!board.hidden;toggle.setAttribute('aria-expanded',String(!board.hidden));if(!board.hidden)load()});
  refresh.addEventListener('click',load);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!board.hidden){board.hidden=true;toggle.setAttribute('aria-expanded','false')}});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
