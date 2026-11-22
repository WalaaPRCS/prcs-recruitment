/** Pure preliminary eligibility rules. Human review is required for supporting documents. */
export function mergePeriods(periods) {
  const valid = periods.map(p=>[new Date(p.start).getTime(),new Date(p.end).getTime()]).filter(([a,b])=>Number.isFinite(a)&&Number.isFinite(b)&&b>=a).sort((a,b)=>a[0]-b[0]);
  const merged=[];
  for(const [a,b] of valid){const last=merged[merged.length-1];if(last&&a<=last[1]+86400000)last[1]=Math.max(last[1],b);else merged.push([a,b]);}
  return merged.reduce((days,[a,b])=>days+(b-a)/86400000+1,0);
}
export function checkEligibility(profile,requirements,asOf=new Date()){
 const checks=[];
 for(const r of requirements){let passed=false;let reason='';
 if(r.type==='specialization'){passed=profile.educations?.some(e=>r.acceptedIds.includes(e.specializationId))??false;reason='التخصص غير مدرج ضمن التخصصات المقبولة';}
 else if(r.type==='degree'){passed=profile.educations?.some(e=>e.level>=r.minimumLevel)??false;reason='المؤهل العلمي أقل من المطلوب';}
 else if(r.type==='experience'){const periods=(profile.experiences??[]).filter(e=>!r.field||e.field===r.field).map(e=>({start:e.start,end:e.end??asOf.toISOString().slice(0,10)}));const days=mergePeriods(periods);passed=days>=r.minimumYears*365.2425;reason=`الخبرة المحتسبة ${(days/365.2425).toFixed(2)} سنة، والمطلوب ${r.minimumYears}`;}
 else if(r.type==='license'){passed=profile.licenses?.some(l=>l.type===r.licenseType&&new Date(l.expiresAt).getTime()>=asOf.getTime())??false;reason='الترخيص المطلوب غير متوفر أو منتهي الصلاحية';}
 else {reason='شرط غير مدعوم؛ يلزم تدقيقه قبل التقديم';}
 checks.push({type:r.type,required:r.required!==false,passed,reason:passed?'مستوفى':reason});
 }
 return {eligible:checks.every(c=>!c.required||c.passed),checks};
}
