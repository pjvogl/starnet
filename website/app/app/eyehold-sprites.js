/* Eyehold original procedural pixel character — no third-party sprite assets.
 * Presentation only. Its animation derives from existing agent state, never invents work.
 */
'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EyeholdSprites=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const rows=[
    '......GGGG......',
    '....GKKKKG......',
    '...GKKKKKKG.....',
    '...KKBEEBKK.....',
    '..KKKKEEKKKK....',
    '..KRRKKKKRRK....',
    '.KKRRRRRRRRKK...',
    '.KRRCCRRCCRRK...',
    'KKRCCCCCCCCRKK..',
    'KKRRCCCCCCRRKK..',
    '.KKRRCCCCRRKK...',
    '..KKRRRRRRKK....',
    '...KRRRRRRK.....',
    '..KKKRRRRKKK....',
    '.KK.KK..KK.KK...',
    'KK..KK..KK..KK..',
    'K...KK..KK...K..',
    '....KK..KK......'
  ];
  const palette={G:'#b77d38',K:'#202129',B:'#5a5964',E:'#ee9d45',R:'#5d353c',C:'#30333c'};
  function draw(ctx,body,now){
    if(!ctx||!body||!Number.isFinite(body.px)||!Number.isFinite(body.py))return null;
    const x=Math.round(body.px)-8, y=Math.round(body.py)-17;
    const moving=!!(body.path&&body.path.length)||!!body.walking;
    const bob=moving?Math.round(Math.sin(now/125)):0;
    ctx.save();
    ctx.imageSmoothingEnabled=false;
    for(let yy=0;yy<rows.length;yy++)for(let xx=0;xx<rows[yy].length;xx++){
      const c=rows[yy][xx];if(c==='.')continue;
      ctx.fillStyle=palette[c];ctx.fillRect(x+xx,y+yy+bob,1,1);
    }
    ctx.restore();
    return {top:y+bob};
  }
  return Object.freeze({draw});
});