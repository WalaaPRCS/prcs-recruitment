import test from 'node:test';import assert from 'node:assert/strict';import {validateRequirements} from '../lib/requirements.mjs';
test('rejects empty requirements',()=>assert.ok(validateRequirements([]).length));
test('rejects unknown condition',()=>assert.ok(validateRequirements([{kind:'custom',mandatory:true,config:{}}]).length));
test('rejects malformed experience',()=>assert.ok(validateRequirements([{kind:'experience',mandatory:true,config:{minimumYears:-1}}]).length));
test('accepts configured degree',()=>assert.deepEqual(validateRequirements([{kind:'degree',mandatory:true,config:{minimumLevel:3}}]),[]));
