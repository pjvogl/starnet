/* Cosmetic room-loot previews. Unlocked state is NEVER inferred from client data.
 * No authoritative finance/acceptance connection exists yet; previews only.
 */
'use strict';
(function(){
 if(typeof document==='undefined')return;
 function mount(){
  const board=document.getElementById('eyehold-workboard');
  if(!board||!globalThis.EyeholdRoomLoot||board.querySelector('[data-eye-loot]'))return;
  const panel=document.createElement('details');panel.dataset.eyeLoot='1';
  const heading=document.createElement('summary');heading.textContent='TREASURY LOOT — FUTURE ROOM UPGRADES';panel.appendChild(heading);
  const note=document.createElement('p');note.textContent='All upgrades LOCKED pending independently verified net USD profit. Preview only; no assets or rewards are installed automatically.';panel.appendChild(note);
  for(const tier of EyeholdRoomLoot.tiers){
   const section=document.createElement('section');const h=document.createElement('h4');
   h.textContent='$'+tier.atUSD.toLocaleString('en-US')+' — '+tier.name+' (LOCKED)';section.appendChild(h);
   const list=document.createElement('ul');
   for(const [room,addition] of Object.entries(tier.roomAdditions)){
    const li=document.createElement('li');li.textContent=room+': '+addition;list.appendChild(li);
   }
   section.appendChild(list);panel.appendChild(section);
  }
  board.appendChild(panel);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
