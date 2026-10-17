/* Separate owner authority for human reviews. Only a SHA256 of a randomly
 * generated 256-bit key is stored; no HTTP setup/read-key route exists.
 * Same-OS-user processes remain within the app's existing local trust boundary.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const authFile=root=>path.join(root,'.secrets','eyehold-owner.json');
const hash=key=>crypto.createHash('sha256').update(key).digest('hex');
function provision(root){
 if(!path.isAbsolute(root))throw Error('absolute workspace root required');
 const file=authFile(root),key=crypto.randomBytes(32).toString('base64url');
 fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});
 // Refuse to silently replace an existing owner. Removing this file is a
 // deliberate local recovery action; never reachable through a model/API.
 fs.writeFileSync(file,JSON.stringify({schema:'eyehold.owner.v1',id:crypto.randomUUID(),keyHash:hash(key)}),{mode:0o600,flag:'wx'});
 return key;
}
function authenticate(root,req){
 const key=req?.headers?.['x-eyehold-owner-key'];
 if(typeof key!=='string'||!/^[-_A-Za-z0-9]{43}$/.test(key))return null;
 try{
  const file=authFile(root),st=fs.lstatSync(file);
  if(!st.isFile()||st.size>2048||(process.platform!=='win32'&&(st.mode&0o077)!==0))return null;
  const row=JSON.parse(fs.readFileSync(file,'utf8'));
  if(row.schema!=='eyehold.owner.v1'||typeof row.id!=='string'||!/^[a-f0-9]{64}$/.test(row.keyHash))return null;
  return crypto.timingSafeEqual(Buffer.from(hash(key),'hex'),Buffer.from(row.keyHash,'hex'))?{authorized:true,id:row.id}:null;
 }catch{return null}
}
module.exports={authFile,provision,authenticate};
