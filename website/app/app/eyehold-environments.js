/* THE EYEHOLD — original procedural fantasy floor motifs. Presentation only.
 * No changes to floor geometry, world serialization, pathfinding or capabilities.
 * Used by both the desktop renderer and its remote-view stills.
 */
'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EyeholdEnvironments=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const PALETTES=Object.freeze({
    foundry:['#733e30','#ef8d42','#312429'],
    moonleaf:['#527f6d','#b1d8be','#203d3a'],
    forge:['#98704b','#f3c16e','#34303d'],
    archive:['#52587e','#97a5cd','#252637'],
    roost:['#a56d4c','#e8bb86','#3d3540'],
    astral:['#656ba6','#c5b7f4','#232540'],
    generic:['#756b64','#d4bda0','#313036']
  });
  const isEnvironment=id=>Object.prototype.hasOwnProperty.call(PALETTES,id);
  function draw(ctx,environmentId,rect,tile){
    if(!ctx||!rect||!isEnvironment(environmentId))return false;
    const [edge,glow,shadow]=PALETTES[environmentId];
    const {x,y,w,h}=rect;if(![x,y,w,h].every(Number.isFinite)||w<40||h<40)return false;
    const cx=x+w/2,cy=y+h/2;
    const d=Math.max(15,Math.min(w,h)*.13);
    ctx.save();
    ctx.fillStyle=shadow;ctx.globalAlpha=.18;ctx.fillRect(x+14,y+14,w-28,h-28);
    ctx.globalAlpha=.75;ctx.strokeStyle=edge;ctx.lineWidth=2;
    ctx.strokeRect(x+16,y+16,w-32,h-32);
    ctx.strokeStyle=glow;ctx.globalAlpha=.48;ctx.lineWidth=1;
    ctx.strokeRect(x+20,y+20,w-40,h-40);
    ctx.globalAlpha=.9;
    if(environmentId==='foundry'){
      for(let i=-1;i<=1;i++){ctx.fillStyle=edge;ctx.fillRect(cx-26,cy+i*10-3,52,6);ctx.fillStyle=glow;ctx.fillRect(cx-22,cy+i*10-1,44,2);}
    }else if(environmentId==='moonleaf'){
      ctx.strokeStyle=glow;
      for(let i=0;i<7;i++){const a=i*Math.PI*2/7;ctx.beginPath();ctx.ellipse(cx+Math.cos(a)*d*.7,cy+Math.sin(a)*d*.7,8,3,a,0,Math.PI*2);ctx.stroke();}
    }else if(environmentId==='forge'){
      ctx.fillStyle=edge;ctx.fillRect(cx-24,cy-7,48,14);ctx.fillStyle=glow;ctx.fillRect(cx-14,cy-4,28,8);ctx.fillStyle=shadow;ctx.fillRect(cx-6,cy-4,12,8);
    }else if(environmentId==='archive'){
      ctx.strokeStyle=glow;
      for(let i=-2;i<=2;i++){ctx.strokeRect(cx+i*8-3,cy-16,6,32);}
    }else if(environmentId==='roost'){
      ctx.strokeStyle=glow;ctx.beginPath();ctx.moveTo(cx,cy-d);ctx.lineTo(cx+d,cy);ctx.lineTo(cx,cy+d);ctx.lineTo(cx-d,cy);ctx.closePath();ctx.stroke();
      ctx.fillStyle=edge;ctx.fillRect(cx-3,cy-3,6,6);
    }else if(environmentId==='astral'){
      ctx.strokeStyle=glow;ctx.beginPath();ctx.ellipse(cx,cy,d,d*.67,0,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.fillStyle=glow;ctx.fillRect(cx+Math.cos(a)*d-1,cy+Math.sin(a)*d*.67-1,3,3);}
    }else{
      ctx.strokeStyle=glow;ctx.beginPath();ctx.moveTo(cx,cy-12);ctx.lineTo(cx+12,cy);ctx.lineTo(cx,cy+12);ctx.lineTo(cx-12,cy);ctx.closePath();ctx.stroke();
    }
    ctx.restore();
    return true;
  }
  return Object.freeze({PALETTES,isEnvironment,draw});
});
