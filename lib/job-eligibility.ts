import {pool} from './db';
import {checkEligibility} from './eligibility.mjs';
export async function evaluateJob(userId:string,jobId:string){
 const client=await pool.connect();
 try {
 const job=await client.query("SELECT id,title,status,opens_at,closes_at FROM jobs WHERE id=$1",[jobId]);
 if(!job.rowCount)return {state:'not_found' as const};
 const j=job.rows[0];const now=new Date();
 if(j.status!=='published'||(j.opens_at&&new Date(j.opens_at)>now)||(j.closes_at&&new Date(j.closes_at)<now))return {state:'closed' as const};
 const existing=await client.query('SELECT id,status FROM applications WHERE job_id=$1 AND applicant_id=$2',[jobId,userId]);
 if(existing.rowCount)return {state:'already_applied' as const,application:existing.rows[0]};
 const [profile,education,experience,licenses,requirements]=await Promise.all([
 client.query('SELECT user_id FROM applicant_profiles WHERE user_id=$1',[userId]),
 client.query('SELECT degree_level,specialization_id FROM educations WHERE applicant_id=$1',[userId]),
 client.query('SELECT field,started_on,ended_on FROM experiences WHERE applicant_id=$1',[userId]),
 client.query('SELECT license_type,expires_on FROM licenses WHERE applicant_id=$1',[userId]),
 client.query('SELECT kind,mandatory,config FROM job_requirements WHERE job_id=$1',[jobId])
 ]);
 if(!profile.rowCount||!requirements.rowCount)return {state:'incomplete' as const,reasons:['الملف الشخصي أو شروط الإعلان غير مكتملة']};
 const normalized={educations:education.rows.map(e=>({specializationId:e.specialization_id,level:e.degree_level})),experiences:experience.rows.map(e=>({field:e.field,start:e.started_on.toISOString().slice(0,10),end:e.ended_on?.toISOString().slice(0,10)})),licenses:licenses.rows.map(l=>({type:l.license_type,expiresAt:l.expires_on.toISOString().slice(0,10)}))};
 const rules=requirements.rows.map(r=>({type:r.kind,required:r.mandatory,...r.config}));
 const result=checkEligibility(normalized,rules);
 return result.eligible?{state:'eligible' as const,checks:result.checks}:{state:'ineligible' as const,checks:result.checks,reasons:result.checks.filter(c=>c.required&&!c.passed).map(c=>c.reason)};
 }finally{client.release();}
}
