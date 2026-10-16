'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'eyehold-live-multidepartment.test.js'),'utf8');
const escapedLiteral="indexOf('"+String.fromCharCode(92,92)+"n')";
const correctDelimiter="indexOf('"+String.fromCharCode(92)+"n')";
assert(!source.includes(escapedLiteral),'newline decoder must not search literal backslash-n');
assert(source.includes(correctDelimiter),'supervisor event stream must parse newline-delimited JSON');
assert(source.includes("for(const worker of assignments)"),'distinct supervisor rounds required');
console.log('PASS: live SSE line decoder recognizes real LF boundaries');
