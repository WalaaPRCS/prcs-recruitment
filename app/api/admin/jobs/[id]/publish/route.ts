import {NextResponse} from 'next/server';
import {z} from 'zod';
import {getCurrentUser} from '@/lib/auth';
import {pool} from '@/lib/db';
import {validateRequirements} from '@/lib/requirements.mjs';
export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await getCurrentUser();if(!user||!['admin','hr'].includes(user.role))return NextResponse.json({error:'غير مصرح'},{status:403});
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:'رقم إعلان غير صالح'},{status:400});
 const client=await pool.connect();try{
 await client.query('BEGIN');
 const job=await client.query('SELECT id,status FROM jobs WHERE id=$1 FOR UPDATE',[id]);
 if(!job.rowCount||job.rows[0].status!=='draft'){await client.query('ROLLBACK');return NextResponse.json({error:'الإعلان غير موجود أو ليس مسودة'},{status:409});}
 const rows=await client.query('SELECT kind,mandatory,config FROM job_requirements WHERE job_id=$1',[id]);
 const errors=validateRequirements(rows.rows);
 if(errors.length){await client.query('ROLLBACK');return NextResponse.json({error:'لا يمكن نشر إعلان بشروط غير مكتملة',details:errors},{status:422});}
 await client.query("UPDATE jobs SET status='published',opens_at=now() WHERE id=$1",[id]);
 await client.query('INSERT INTO audit_logs(actor_id,action,entity_type,entity_id) VALUES($1,$2,$3,$4)',[user.id,'job.published','job',id]);
 await client.query('COMMIT');return NextResponse.json({ok:true});
 }catch{await client.query('ROLLBACK');return NextResponse.json({error:'تعذر نشر الإعلان'},{status:500});}finally{client.release();}
}
