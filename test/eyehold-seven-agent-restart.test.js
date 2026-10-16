/* Manual, zero-provider-spend integration test:
 * prove real sidecar accepts seven roster members and retains persistent
 * workspace state through a process restart. Does not call /api/run.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawn}=require('node:child_process');
const {bootToken}=require('./_httpToken.js');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'eye-seven-persist-'));
const port=21000+Math.floor(Math.random()*16000),base='http://127.0.0.1:'+port;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let child=null;
async function start(){
 child=spawn(process.execPath,[path.resolve(__dirname,'../sidecar/index.js')],{env:{...process.env,SKYNET_PORT:String(port),SKYNET_WORKSPACES:dir,SKYNET_BUDGET_GLOBAL:'0',SKYNET_BUDGET_PER_DAY:'0'},stdio:'ignore'});
 for(let i=0;i<70;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}if(i===69)throw Error('sidecar start failed');await sleep(150)}
 const token=await bootToken(base,base);assert(token,'sidecar token is required');
 return {'X-StarNet-Token':token,Origin:base,'Content-Type':'application/json'};
}
async function stop(){
 if(!child)return;const proc=child;child=null;
 proc.kill('SIGTERM');
 await Promise.race([new Promise(resolve=>{if(proc.exitCode!==null||proc.signalCode!==null)resolve();else proc.once('exit',resolve)}),sleep(4000)]);
 if(proc.exitCode===null&&proc.signalCode===null)proc.kill('SIGKILL');
 await sleep(250);
}
const ids=['agent','raven','sages','iron','deepforge','silver','treasury'];
const specialties=['eyehold-keep','eyehold-archive','eyehold-astral','eyehold-foundry','eyehold-forge','eyehold-moonleaf','eyehold-astral'];
const roster=ids.map((agentId,i)=>({agentId,name:agentId.toUpperCase(),model:'openai/gpt-4.1-mini',provider:'openrouter',specialtyId:specialties[i],system:'Offline roster persistence verification only. No external actions.'}));
async function run(){
 let headers=await start();
 let r=await fetch(base+'/api/roster',{method:'POST',headers,body:JSON.stringify({agents:roster,updatedAt:Date.now()})});
 assert.equal(r.status,200,'sidecar must accept seven agents: '+await r.text());
 r=await fetch(base+'/api/roster',{headers});
 assert(r.ok,'roster must be readable');let body=await r.json();
 const agents=Array.isArray(body.agents)?body.agents:Array.isArray(body.roster)?body.roster:[];
 assert(ids.every(id=>agents.some(a=>(a.agentId||a.id)===id)),'all seven real roster entries visible');
 await stop();
 headers=await start();
 r=await fetch(base+'/api/roster',{headers});assert(r.ok,'roster accessible after restart');
 body=await r.json();
 const saved=Array.isArray(body.agents)?body.agents:Array.isArray(body.roster)?body.roster:[];
 assert(ids.every(id=>saved.some(a=>(a.agentId||a.id)===id)),'seven roster records must survive process restart');
 console.log('PASS: seven real sidecar roster entries persisted across restart with no provider traffic');
}
run().catch(e=>{console.error('Persistence BLOCKED:',e);process.exitCode=1}).finally(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true,maxRetries:5,retryDelay:200})});
