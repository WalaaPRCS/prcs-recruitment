import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { pool } from '@/lib/db';
import { checkEligibility } from '@/lib/eligibility.mjs';
const input=z.object({jobId:z.string().uuid()});
export async function GET(){const user=await getCurrentUser();if(!user||user.role!=='applicant')return NextResponse.json({error:'غير مصرح'},{status:401});const r=await pool.query('SELECT a.id,a.status,a.submitted_at,j.title FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.applicant_id=$1 ORDER BY a.submitted_at DESC',[user.id]);return NextResponse.json(r.rows);}
export async function POST(request:Request){
 const user=await getCurrentUser();if(!user||user.role!=='applicant')return NextResponse.json({error:'يلزم حساب متقدم'},{status:401});
 const parsed=input.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:'وظيفة غير صالحة'},{status:400});
 const client=await pool.connect();
 try{
  await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const jobResult=await client.query("SELECT * FROM jobs WHERE id=$1 AND status='published' AND (opens_at IS NULL OR opens_at<=now()) AND (closes_at IS NULL OR closes_at>=now()) FOR SHARE",[parsed.data.jobId]);
  if(!jobResult.rowCount){await client.query('ROLLBACK');return NextResponse.json({error:'الإعلان مغلق أو غير منشور'},{status:409});}
  const [profile,education,experience,licenses,requirements]=await Promise.all([
   client.query('SELECT * FROM applicant_profiles WHERE user_id=$1',[user.id]),
   client.query('SELECT * FROM educations WHERE applicant_id=$1',[user.id]),
   client.query('SELECT * FROM experiences WHERE applicant_id=$1',[user.id]),
   client.query('SELECT * FROM licenses WHERE applicant_id=$1',[user.id]),
   client.query('SELECT * FROM job_requirements WHERE job_id=$1',[parsed.data.jobId])
  ]);
  const normalized={educations:education.rows.map(e=>({specializationId:e.specialization_id,level:e.degree_level})),experiences:experience.rows.map(e=>({field:e.field,start:e.started_on.toISOString().slice(0,10),end:e.ended_on?.toISOString().slice(0,10)})),licenses:licenses.rows.map(l=>({type:l.license_type,expiresAt:l.expires_on.toISOString().slice(0,10)}))};
  if(!profile.rowCount||!requirements.rowCount){await client.query('ROLLBACK');return NextResponse.json({error:'الملف أو شروط الإعلان غير مكتملة'},{status:422});}
  const rules=requirements.rows.map(r=>({type:r.kind,required:r.mandatory,...r.config}));
  const result=checkEligibility(normalized,rules);
  if(!result.eligible){await client.query('ROLLBACK');return NextResponse.json({error:'شروط إلزامية غير مستوفاة',eligibility:result},{status:422});}
  const snapshot={profile:profile.rows[0],education:education.rows,experience:experience.rows,licenses:licenses.rows,job:jobResult.rows[0]};
  const saved=await client.query('INSERT INTO applications(job_id,applicant_id,snapshot,eligibility_result) VALUES($1,$2,$3,$4) RETURNING id',[parsed.data.jobId,user.id,JSON.stringify(snapshot),JSON.stringify(result)]);
  await client.query('INSERT INTO audit_logs(actor_id,action,entity_type,entity_id) VALUES($1,$2,$3,$4)',[user.id,'application.submitted','application',saved.rows[0].id]);
  await client.query('COMMIT');return NextResponse.json({id:saved.rows[0].id,eligibility:result},{status:201});
 }catch(e:any){await client.query('ROLLBACK');if(e.code==='23505')return NextResponse.json({error:'تم التقديم لهذه الوظيفة سابقًا'},{status:409});if(e.code==='40001')return NextResponse.json({error:'يرجى إعادة المحاولة'},{status:409});return NextResponse.json({error:'تعذر تقديم الطلب'},{status:500});}finally{client.release();}
}
