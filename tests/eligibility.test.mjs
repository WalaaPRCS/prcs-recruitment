import test from 'node:test';import assert from 'node:assert/strict';import {mergePeriods,checkEligibility} from '../lib/eligibility.mjs';
test('overlapping experience is counted once',()=>{const days=mergePeriods([{start:'2020-01-01',end:'2020-12-31'},{start:'2020-06-01',end:'2020-12-31'}]);assert.equal(days,366)});
test('mandatory specialization blocks ineligible applicants',()=>{const r=checkEligibility({educations:[{specializationId:'history',level:3}]},[{type:'specialization',acceptedIds:['nursing'],required:true}]);assert.equal(r.eligible,false)});
test('preferred condition does not block submission',()=>{const r=checkEligibility({},[{type:'license',licenseType:'CCNA',required:false}]);assert.equal(r.eligible,true)});
test('unknown mandatory requirement fails closed',()=>{assert.equal(checkEligibility({},[{type:'unknown',required:true}]).eligible,false)});
