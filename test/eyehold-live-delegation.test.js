/* Live, opt-in Eyehold lead-to-Deepforge proof. Requires real OpenRouter
 * credits. No browser or fabricated mock AI completions. Fail closed if the
 * provider declines to dispatch; never award Crowns from this proof. */
'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawn}=require('node:child_process');
const {bootToken,sseQuery}=require('./_httpToken.js');
const key=process.env.SKYNET_OPENROUTER_KEY||process.env.STARNET_OPENROUTER_KEY||process.env.OPENROUTER_API_KEY;
const model=process.env.EYEHOLD_DELEGATION_MODEL||process.env.STARNET_SMOKE_MODEL||'openai/gpt-4.1-mini';
if(!key){console.error('Missing real provider key');process.exit(2);}
const root=fs.mkdtempSync(path.join(os.tmpdir(),'eyehold-live-delegate-'));
const port=12000+Math.floor(Math.random()*20000);
const base='http://127.0.0.1:'+port;
const child=spawn(process.execPath,[path.resolve(__dirname,'../sidecar/index.js')],{env:{...process.env,SKYNET_PORT:String(port),SKYNET_WORKSPACES:root,SKYNET_BUDGET_PER_RUN:'0.20',SKYNET_BUDGET_PER_AGENT:'0.40',SKYNET_BUDGET_PER_DAY:'1.00',SKYNET_BUDGET_GLOBAL:'1.00'},stdio:'ignore'});
const sleep=n=>new Promise(r=>setTimeout(r,n));
const wait=async()=>{for(let i=0;i<50;i++){try{const r=await fetch(base+'/api/health');if(r.ok)return;}catch{}await sleep(250);}throw Error('Sidecar did not become healthy');};
let sseController;
async function run(){
 await wait();const token=await bootToken(base,base);
 const headers={'Content-Type':'application/json','X-StarNet-Token':token,Origin:base};
 const roster=await fetch(base+'/api/roster',{method:'POST',headers,body:JSON.stringify({agents:[
  {agentId:'agent',name:'THE EYE',model,provider:'openrouter',system:'You are The Eye, supervisor. Delegate the specified engineering task to DEEPFORGE using team_dispatch. Do not claim a result unless its worker run completed.'},
  {agentId:'deepforge',name:'DEEPFORGE',model,provider:'openrouter',specialtyId:'eyehold-forge',system:'Deepforge engineer. Answer the delegated task concisely. Never claim tools ran unless they actually did.'}
 ],updatedAt:Date.now()})});if(!roster.ok)throw Error('Roster rejected: HTTP '+roster.status);
 // A remote delegated worker needs a connected station client for lifecycle
 // acknowledgments. No commands are silently approved; known coordination
 // messages only get bounded acknowledgements.
 sseController=new AbortController();
 const station=[];let ready;
 ready=fetch(base+'/api/channels/events?'+sseQuery(token),{signal:sseController.signal}).then(async res=>{
  if(!res.ok)throw Error('Event connection failed');
  const reader=res.body.getReader(),dec=new TextDecoder();let buf='';
  (async()=>{try{while(true){const {value,done}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});let nl;while((nl=buf.indexOf('\n'))>=0){const line=buf.slice(0,nl).trim();buf=buf.slice(nl+1);if(!line.startsWith('data:'))continue;let ev;try{ev=JSON.parse(line.slice(5));}catch{continue;}if(ev?.name!=='station.command')continue;const p=ev.payload||{};station.push(p.verb);let response={ok:false,error:'unsupported station command'};if(p.verb==='station.sessions')response={ok:true,result:{sessions:[{id:'ws_deepforge',title:'engineering',agentId:'deepforge'}]}};if(p.verb==='station.deliver')response={ok:true,result:{folded:true,session:'engineering'}};if(['station.dispatch_start','station.dispatch_end'].includes(p.verb))response={ok:true,result:{session:'engineering'}};await fetch(base+'/api/station/ack',{method:'POST',headers,body:JSON.stringify({id:p.id,...response})}).catch(()=>{});}}}catch{} })();return true;
 });
 await ready;await sleep(250);
 const prompt='Delegate exactly ONE small task to agentId deepforge via team_dispatch: write a two-sentence description of one safe test to verify a Node.js module loads successfully. Use the engineering session if available. Do not invent the worker result or do the work yourself. Report the actual worker output.';
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),120000);
 let events=[];
 try{const res=await fetch(base+'/api/run',{method:'POST',headers,signal:ctrl.signal,body:JSON.stringify({key,model,agentId:'agent',isTask:true,messages:[{role:'user',content:prompt}]})});if(!res.ok)throw Error('Agent run HTTP '+res.status);const reader=res.body.getReader(),dec=new TextDecoder();let b='';while(true){const {done,value}=await reader.read();if(done)break;b+=dec.decode(value,{stream:true});let j;while((j=b.indexOf('\n'))>=0){const line=b.slice(0,j).trim();b=b.slice(j+1);if(!line)continue;try{events.push(JSON.parse(line));}catch{}}}}finally{clearTimeout(timer);}
 const runs=await(await fetch(base+'/api/runs?agent=deepforge&limit=20',{headers})).json();
 const children=(runs.runs||[]).filter(r=>r.agentId==='deepforge');
 const success=children.some(r=>r.runId&&r.deliveryText&&String(r.deliveryText).length>20);
 const summary={leadStart:events.some(e=>e.name==='agent.run.start'),leadEnd:events.filter(e=>e.name==='agent.run.end').map(e=>e.payload?.reason),deepforgeRunCount:children.length,deepforgeDeliverableVerified:success,stationCommands:station.filter(x=>x&&x.startsWith('station.')).length,model};
 console.log(JSON.stringify(summary,null,2));
 if(!success)throw Error('Live Deepforge child-run deliverable not established');
}
run().catch(e=>{console.error('Live delegation BLOCKED:',e.message);process.exitCode=1;}).finally(()=>{try{sseController?.abort()}catch{};child.kill();fs.rmSync(root,{recursive:true,force:true});});
