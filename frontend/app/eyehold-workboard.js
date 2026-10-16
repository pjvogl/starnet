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
  board.append(heading,description,refresh,status,list);
  document.body.append(toggle,board);
  let loading=false;
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
     li.textContent=agent+' — '+name+' ['+outcome+']';
     li.style.marginBottom='8px';list.appendChild(li);
    }
    status.textContent=runs.length?runs.length+' recent run records; open existing sessions or OUTBOX to inspect content.':'No run records in this sidecar workspace yet.';
   }catch(e){list.replaceChildren();status.textContent='Unable to load run history. Start or reconnect the local sidecar. '+e.message}
   finally{loading=false}
  }
  toggle.addEventListener('click',()=>{board.hidden=!board.hidden;toggle.setAttribute('aria-expanded',String(!board.hidden));if(!board.hidden)load()});
  refresh.addEventListener('click',load);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!board.hidden){board.hidden=true;toggle.setAttribute('aria-expanded','false')}});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
