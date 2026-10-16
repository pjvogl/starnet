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
  {agentId:'agent',name:'THE EYE',model,provider:'openrouter',system:'You are The Eye, supervisor. Delegate the requested assignment to BOTH RAVEN COURT (research session) and DEEPFORGE (engineering session) using team_dispatch with workers. The session property is mandatory for each worker. Do not claim a result unless its worker run completed.'},
  {agentId:'deepforge',name:'DEEPFORGE',model,provider:'openrouter',specialtyId:'eyehold-forge',system:'Deepforge engineer. Answer the delegated technical task concisely; check the research context provided by the lead.'},
  {agentId:'raven',name:'RAVEN COURT',model,provider:'openrouter',specialtyId:'eyehold-archive',system:'Raven Court researcher. Produce a concise evidence-aware opportunity assessment. Avoid unsupported figures and invented citations.'}
 ],updatedAt:Date.now()})});if(!roster.ok)throw Error('Roster rejected: HTTP '+roster.status);
 // A remote delegated worker needs a connected station client for lifecycle
 // acknowledgments. No commands are silently approved; known coordination
 // messages only get bounded acknowledgements.
 sseController=new AbortController();
 const station=[];let ready;
 ready=fetch(base+'/api/channels/events?'+sseQuery(token),{signal:sseController.signal}).then(async res=>{
  if(!res.ok)throw Error('Event connection failed');
  const reader=res.body.getReader(),dec=new TextDecoder();let buf='';
  (async()=>{try{while(true){const {value,done}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});let nl;while((nl=buf.indexOf('\n'))>=0){const line=buf.slice(0,nl).trim();buf=buf.slice(nl+1);if(!line.startsWith('data:'))continue;let ev;try{ev=JSON.parse(line.slice(5));}catch{continue;}if(ev?.name!=='station.command')continue;const p=ev.payload||{};station.push({verb:p.verb,args:p.verb==='station.deliver'?{agentId:p.args?.agentId,runId:p.args?.runId,textLength:String(p.args?.text||'').length}:null});let response={ok:false,error:'unsupported station command'};if(p.verb==='station.sessions')response={ok:true,result:{sessions:[{id:'ws_deepforge',title:'engineering',agentId:'deepforge'},{id:'ws_raven',title:'research',agentId:'raven'}]}};if(p.verb==='station.deliver')response={ok:true,result:{folded:true,session:p.args?.agentId==='raven'?'research':'engineering'}};if(['station.dispatch_start','station.dispatch_end'].includes(p.verb))response={ok:true,result:{session:p.args?.agentId==='raven'?'research':'engineering'}};await fetch(base+'/api/station/ack',{method:'POST',headers,body:JSON.stringify({id:p.id,...response})}).catch(()=>{});}}}catch{} })();return true;
 });
 await ready;await sleep(250);
 const assignment=String(process.env.EYEHOLD_ASSIGNMENT||'Write a two-sentence description of one safe test to verify a Node.js module loads successfully.').trim();
 if(assignment.length<15||assignment.length>1800)throw Error('Assignment must be 15-1800 characters');
 const prompt='Use team_dispatch with exactly this JSON shape: '+JSON.stringify({workers:[{agentId:'raven',prompt:'Research the customer need, commercial assumptions, limitations and validation requirements for: '+assignment,session:'research'},{agentId:'deepforge',prompt:'Draft a practical technical deliverable for: '+assignment,session:'engineering'}]})+'. Delegate both tasks to RAVEN COURT and DEEPFORGE in their named sessions. Do not invent their results or do the work yourself. Summarize the actual work of each specialist.';
 // Two real delegated worker runs can take substantially longer than a single agent.
 // Keep a bounded deadline while allowing both departments to finish.
 const deadlineMs=Number(process.env.EYEHOLD_HANDOFF_TIMEOUT_MS)||210000;
 if(deadlineMs<75000||deadlineMs>240000)throw Error('Handoff timeout outside permitted bounds');
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),deadlineMs);
 let events=[],approvedPromptIds=new Set(),runId='';
 try{const res=await fetch(base+'/api/run',{method:'POST',headers,signal:ctrl.signal,body:JSON.stringify({key,model,agentId:'agent',isTask:true,messages:[{role:'user',content:prompt}]})});if(!res.ok)throw Error('Agent run HTTP '+res.status);const reader=res.body.getReader(),dec=new TextDecoder();let b='';while(true){const {done,value}=await reader.read();if(done)break;b+=dec.decode(value,{stream:true});let j;while((j=b.indexOf('\n'))>=0){const line=b.slice(0,j).trim();b=b.slice(j+1);if(!line)continue;try{
 const ev=JSON.parse(line);events.push(ev);
 if(ev.name==='agent.run.start'&&ev.payload?.runId)runId=ev.payload.runId;
 if(ev.name==='permission.prompt'){
   const id=ev.payload?.promptId;
   // Approval is ONLY for this isolated, operator-initiated delegation proof,
   // never persisted and never applied to unrelated future runs.
   if(id&&runId&&!approvedPromptIds.has(id)){
     approvedPromptIds.add(id);
     const permission=await fetch(base+'/api/consent',{method:'POST',headers,
       body:JSON.stringify({runId,promptId:id,decision:'once'})});
     console.log('Ephemeral run consent:',JSON.stringify({ok:permission.ok,status:permission.status,promptCount:approvedPromptIds.size}));
     if(!permission.ok)throw Error('Run consent rejected: HTTP '+permission.status);
   }
 }
}catch(e){if(e.message?.startsWith('Run consent rejected'))throw e;}}}}catch(e){
   const names=events.map(x=>x.name).filter(Boolean);
   console.error('Delegation stream diagnosis:',JSON.stringify({eventCount:events.length,eventNames:[...new Set(names)].slice(0,20),runStart:names.includes('agent.run.start'),toolCalls:names.filter(n=>n==='agent.tool_call').length,stationCommands:station.slice(-12),permissionsAnswered:approvedPromptIds.size,timedOut:e?.name==='AbortError'}));
   if(e?.name!=='AbortError')throw e;
   console.error('Supervisor timed out; inspecting saved worker runs before marking proof failed.');
 }finally{clearTimeout(timer);}
 const runs=await(await fetch(base+'/api/runs?agent=*&limit=60',{headers})).json();
 const children=(runs.runs||[]).filter(r=>['raven','deepforge'].includes(r.agentId));
 const details=[];
 for(const worker of children){
   let transcriptText='';
   if(worker.streamId){
     const tr=await fetch(base+'/api/transcript?agent='+encodeURIComponent(worker.agentId)+'&stream='+encodeURIComponent(worker.streamId)+'&limit=80',{headers});
     if(tr.ok){
       const payload=await tr.json();
       transcriptText=(payload.turns||[]).filter(t=>t.role==='assistant').map(t=>typeof t.content==='string'?t.content:'').join(' ').trim();
     }
   }
   const deliverable=String((String(worker.deliveryText||'').length>=String(transcriptText||'').length?worker.deliveryText:transcriptText)||'').trim();
   if(process.env.EYEHOLD_DELIVERABLE_DIR&&worker.delegatedBy==='agent'&&deliverable.length>20){
     const dest=path.resolve(process.env.EYEHOLD_DELIVERABLE_DIR);
     fs.mkdirSync(dest,{recursive:true,mode:0o700});
     const safeText=deliverable.slice(0,32000);
     fs.writeFileSync(path.join(dest,worker.agentId+'-deliverable.md'),'# '+worker.agentId+' deliverable\n\n'+safeText+'\n',{mode:0o600});
     fs.writeFileSync(path.join(dest,worker.agentId+'-review-manifest.json'),JSON.stringify({kind:'unreviewed-agent-output',agentId:worker.agentId,approved:false,earnedCrowns:0,assignment,workerRunId:worker.runId,delegatedBy:worker.delegatedBy,model},null,2)+'\n',{mode:0o600});
   }
   details.push({agentId:worker.agentId,runId:worker.runId,delegatedBy:worker.delegatedBy,streamIdPresent:!!worker.streamId,deliveryTextLength:String(worker.deliveryText||'').length,transcriptTextLength:transcriptText.length,reason:worker.reason||worker.status||null,outputVerified:!!worker.runId&&worker.delegatedBy==='agent'&&(String(worker.deliveryText||'').length>20||transcriptText.length>20)});
 }
 const success=['raven','deepforge'].every(id=>details.some(d=>d.agentId===id&&d.outputVerified));
 const summary={leadStart:events.some(e=>e.name==='agent.run.start'),leadEnd:events.filter(e=>e.name==='agent.run.end').map(e=>e.payload?.reason),specialistRunCount:children.length,bothDepartmentsProducedDeliverables:success,specialistEvidence:details,dispatchToolCalls:events.filter(e=>e.name==='agent.tool_call').map(e=>{
   const p=e.payload||{};
   const raw=p.arguments||p.args||p.input||{};
   let args=raw;
   if(typeof raw==='string'){try{args=JSON.parse(raw)}catch{args={parseError:true}}}
   const workers=Array.isArray(args?.workers)?args.workers:[];
   return {name:p.name||null,argumentsAvailable:!!(p.arguments||p.args||p.input),workerCount:workers.length,targetAgentIds:workers.map(w=>w.agentId).filter(Boolean),targetSessionTitles:workers.map(w=>w.session||null)};
 }),stationCommands:station.filter(x=>x?.verb?.startsWith('station.')).length,stationVerbs:station.map(x=>x.verb),toolResults:events.filter(e=>e.name==='agent.tool_result').map(e=>({isError:!!e.payload?.isError,fields:Object.keys(e.payload||{}).filter(k=>!['content','text','result','output'].includes(k))})),delivered:station.filter(x=>x.verb==='station.deliver'),model};
 console.log(JSON.stringify(summary,null,2));
 if(!success)throw Error('Incomplete multi-department handoff: '+JSON.stringify(details.map(d=>({agentId:d.agentId,verified:d.outputVerified,reason:d.reason})))+'; preserve completed worker evidence and retry only after diagnosis');
}
run().catch(e=>{console.error('Multi-department delegation BLOCKED:',e.message);process.exitCode=1;}).finally(async()=>{
 try{sseController?.abort()}catch{}
 try{child.kill('SIGTERM')}catch{}
 // The sidecar writes run journals asynchronously. Wait for process exit
 // before deleting the isolated scratch workspace; ENOTEMPTY is cleanup only.
 if(child.exitCode===null&&child.signalCode===null){
   await Promise.race([new Promise(resolve=>child.once('exit',resolve)),sleep(5000)]);
 }
 if(child.exitCode===null&&child.signalCode===null){try{child.kill('SIGKILL')}catch{}}
 for(let i=0;i<4;i++){
   try{fs.rmSync(root,{recursive:true,force:true,maxRetries:3,retryDelay:250});break}
   catch(e){if(i===3)console.warn('Scratch cleanup deferred:',e.code);else await sleep(300)}
 }
});
