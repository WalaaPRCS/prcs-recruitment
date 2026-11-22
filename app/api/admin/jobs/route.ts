import {NextResponse} from 'next/server';
import {z} from 'zod';
import {getCurrentUser} from '@/lib/auth';
import {pool} from '@/lib/db';
import {validateRequirements} from '@/lib/requirements.mjs';
const requirement=z.object({kind:z.enum(['degree','specialization','experience','license']),mandatory:z.boolean(),config:z.record(z.unknown())});
const schema=z.object({title:z.string().trim().min(3).max(180),department:z.string().trim().min(2).max(150),description:z.string().max(15000).default(''),requirements:z.array(requirement).min(1).max(30)});
export async function GET(){const user=await getCurrentUser();if(!user||!['admin','hr'].includes(user.role))return NextResponse.json({error:'غير مصرح'},{status:403});const r=await pool.query('SELECT id,title,department,status,created_at FROM jobs ORDER BY created_at DESC LIMIT 100');return NextResponse.json(r.rows);}
export async function POST(request:Request){
 const user=await getCurrentUser();if(!user||!['admin','hr'].includes(user.role))return NextResponse.json({error:'غير مصرح'},{status:403});
 let body;try{body=await request.json();}catch{return NextResponse.json({error:'طلب غير صالح'},{status:400});}
 const parsed=schema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'بيانات الإعلان غير صالحة',details:parsed.error.flatten()},{status:400});
 const errors=validateRequirements(parsed.data.requirements);if(errors.length)return NextResponse.json({error:'شروط الإعلان غير مكتملة',details:errors},{status:422});
 const client=await pool.connect();try{
 await client.query('BEGIN');
 const j=await client.query('INSERT INTO jobs(title,department,description,status) VALUES($1,$2,$3,$4) RETURNING id',[parsed.data.title,parsed.data.department,parsed.data.description,'draft']);
 for(const r of parsed.data.requirements)await client.query('INSERT INTO job_requirements(job_id,kind,mandatory,config) VALUES($1,$2,$3,$4)',[j.rows[0].id,r.kind,r.mandatory,JSON.stringify(r.config)]);
 await client.query('INSERT INTO audit_logs(actor_id,action,entity_type,entity_id) VALUES($1,$2,$3,$4)',[user.id,'job.created','job',j.rows[0].id]);
 await client.query('COMMIT');return NextResponse.json({id:j.rows[0].id,status:'draft'},{status:201});
 }catch{await client.query('ROLLBACK');return NextResponse.json({error:'تعذر إنشاء الإعلان'},{status:500});}finally{client.release();}
}
