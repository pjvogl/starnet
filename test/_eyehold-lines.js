'use strict';
// Decode transport chunks, including a final record without a trailing LF.
function lineDecoder(onLine, max=1048576) {
 const decoder=new TextDecoder(); let pending='';
 function drain(final=false) {
  let i; while((i=pending.indexOf('\n'))>=0){const line=pending.slice(0,i).trim();pending=pending.slice(i+1);if(line)onLine(line);}
  if(pending.length>max)throw Error('Event stream record exceeds limit');
  if(final&&pending.trim())onLine(pending.trim());
  if(final)pending='';
 }
 return {push(bytes){pending+=decoder.decode(bytes,{stream:true});drain();},end(){pending+=decoder.decode();drain(true);}};
}
module.exports={lineDecoder};
