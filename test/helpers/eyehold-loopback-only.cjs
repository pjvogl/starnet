/* Preload for credential-free Eyehold offline tests. Deny remote destinations
 * before fetch/HTTP/socket activity, including boot-time model catalog refresh.
 * Inherited NODE_OPTIONS applies this policy to spawned sidecars as well.
 */
'use strict';
const net=require('node:net');
function local(host){return ['127.0.0.1','localhost','::1','[::1]'].includes(String(host||'localhost').toLowerCase());}
function denied(){const e=new Error('Offline Eyehold test forbids non-loopback network access');e.code='EYEHOLD_OFFLINE_NETWORK';return e;}
const original=net.Socket.prototype.connect;
net.Socket.prototype.connect=function(...args){
 const value=Array.isArray(args[0])?args[0][0]:args[0];
 if(value&&typeof value==='object'&&!value.path&&!local(value.host||value.hostname))throw denied();
 if((typeof value==='number'||typeof value==='string'&&/^\d+$/.test(value))&&typeof args[1]==='string'&&!local(args[1]))throw denied();
 return original.apply(this,args);
};
if(globalThis.fetch){const raw=globalThis.fetch;globalThis.fetch=async function(input,init){const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);if(!local(url.hostname))throw denied();return raw(input,init);};}
