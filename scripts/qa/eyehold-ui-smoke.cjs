/* Real browser + real sidecar, isolated fixture station, zero model calls.
 * Requires playwright and Chromium (EYEHOLD_CHROME may point to installed Chrome).
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const {buildEyeholdStation}=require('../eyehold-seven-room-starter.cjs');
const {createFinanceStore}=require('../../sidecar/eyehold-finance-store.js');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const root=fs.mkdtempSync(path.join(os.tmpdir(),'eye-ui-smoke-'));
const port=21000+Math.floor(Math.random()*16000),base='http://127.0.0.1:'+port;
const output=process.argv[2]?path.resolve(process.argv[2]):null;
let browser,child;
async function run(){
 const childEnv={...process.env,SKYNET_PORT:String(port),SKYNET_WORKSPACES:root,SKYNET_BUDGET_GLOBAL:'0',SKYNET_BUDGET_PER_DAY:'0'};
 for(const name of Object.keys(childEnv))if(/KEY|TOKEN|SECRET/.test(name))delete childEnv[name];
 child=spawn(process.execPath,[path.resolve(__dirname,'../../sidecar/index.js')],{env:childEnv,stdio:'ignore'});
 for(let i=0;i<70;i++){try{if((await fetch(base+'/api/health')).ok)break;}catch{}if(i===69)throw Error('Sidecar failed to start');await sleep(150);}
 browser=await chromium.launch({headless:true,...(process.env.EYEHOLD_CHROME?{executablePath:process.env.EYEHOLD_CHROME}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 // Test browser cannot send prompts to a provider even if a boot regression tries.
 await page.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
 await page.route('**/api/run',route=>{errors.push('Unexpected model run requested');return route.abort();});
 const seed={schema:'starnet.save',version:6,updatedAt:Date.now(),agent:{id:'agent',name:'THE EYE',createdAt:Date.now(),awakened:true,specialtyId:'eyehold-keep'},station:buildEyeholdStation().doc,workstreams:[]};
 await page.addInitScript(doc=>{if(!localStorage.getItem('starnet.save'))localStorage.setItem('starnet.save',JSON.stringify(doc));},seed);
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/');await page.waitForFunction(()=>typeof App!=='undefined'&&!!App.station?.(),null,{timeout:30000});
 await page.getByRole('button',{name:'WORK BOARD',exact:true}).click();
 await page.getByText('TREASURY — PROFIT MILESTONES',{exact:true}).click();
 await page.getByRole('button',{name:'CHECK TREASURY',exact:true}).click();
 await page.getByText(/Profit unavailable:/).waitFor();
 assert.equal(await page.locator('[data-eye-loot] h4').count(),3);
 const store=createFinanceStore({file:path.join(root,'eyehold-finance.json')});
 // Synthetic evidence exists ONLY in this disposable fixture. No production earnings.
 store.replaceReviewed([JSON.stringify({id:'ui-fixture',currency:'USD',type:'revenue',cents:100000000})],{confirmedReviewed:true});
 await page.getByRole('button',{name:'CHECK TREASURY',exact:true}).click();
 await page.getByRole('heading',{name:/Guild Ascendant \(INSTALLED\)/}).waitFor();
 assert.equal(await page.evaluate(()=>App.station().props().filter(p=>String(p.label||'').startsWith('Eyehold:')).length),7);
 await page.reload();await page.waitForFunction(()=>typeof App!=='undefined'&&!!App.station?.());
 await page.getByRole('button',{name:'WORK BOARD',exact:true}).click();await page.getByText('TREASURY — PROFIT MILESTONES',{exact:true}).click();await page.getByRole('button',{name:'CHECK TREASURY',exact:true}).click();
 await page.getByRole('heading',{name:/Guild Ascendant \(INSTALLED\)/}).waitFor();
 assert.equal(await page.evaluate(()=>App.station().props().filter(p=>String(p.label||'').startsWith('Eyehold:')).length),7,'reload cannot duplicate markers');
 if(output){fs.mkdirSync(output,{recursive:true});await page.screenshot({path:path.join(output,'work-board-desktop.png')});}
 await page.setViewportSize({width:390,height:844});
 const box=await page.locator('#eyehold-workboard').boundingBox();assert(box&&box.x>=0&&box.x+box.width<=391,'work board fits mobile viewport');
 if(output)await page.screenshot({path:path.join(output,'work-board-mobile.png')});
 assert.deepEqual(errors,[],'no page errors or model calls');
 console.log('PASS: real app Treasury missing-data state, fixture unlock, seven native props, reload and mobile board; no paid inference');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(child){const c=child;c.kill('SIGTERM');await Promise.race([new Promise(r=>c.exitCode!==null?r():c.once('exit',r)),sleep(4000)]);if(c.exitCode===null&&c.signalCode===null)c.kill('SIGKILL');}fs.rmSync(root,{recursive:true,force:true,maxRetries:5,retryDelay:200});});
