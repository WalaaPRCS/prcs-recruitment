import {NextResponse} from 'next/server';
import {z} from 'zod';
import {getCurrentUser} from '@/lib/auth';
import {pool} from '@/lib/db';
const statuses=['submitted','under_review','shortlisted','rejected','accepted'] as const;
const schema=z.object({status:z.enum(statuses),note:z.string().trim().min(3).max(3000)});
const allowed:Record<string,string[]>={submitted:['under_review'],under_review:['shortlisted','rejected'],shortlisted:['accepted','rejected'],rejected:[],accepted:[]};
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await getCurrentUser();if(!user||!['admin','hr'].includes(user.role))return NextResponse.json({error:'غير مصرح'},{status:403});
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:'معرف غير صالح'},{status:400});
 let input;try{input=await request.json();}catch{return NextResponse.json({error:'بيانات غير صالحة'},{status:400});}
 const parsed=schema.safeParse(input);if(!parsed.success)return NextResponse.json({error:'الحالة أو الملاحظة غير صالحة'},{status:400});
 const client=await pool.connect();
 try{await client.query('BEGIN');const current=await client.query('SELECT status FROM applications WHERE id=$1 FOR UPDATE',[id]);
 if(!current.rowCount){await client.query('ROLLBACK');return NextResponse.json({error:'الطلب غير موجود'},{status:404});}
 const previous=current.rows[0].status;
 if(!allowed[previous]?.includes(parsed.data.status)){await client.query('ROLLBACK');return NextResponse.json({error:'انتقال حالة غير مسموح'},{status:409});}
 await client.query('UPDATE applications SET status=$1 WHERE id=$2',[parsed.data.status,id]);
 await client.query('INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details) VALUES($1,$2,$3,$4,$5)',[user.id,'application.status_changed','application',id,JSON.stringify({from:previous,to:parsed.data.status,note:parsed.data.note})]);
 await client.query('COMMIT');return NextResponse.json({ok:true,status:parsed.data.status});
 }catch{await client.query('ROLLBACK');return NextResponse.json({error:'تعذر تحديث الطلب'},{status:500});}finally{client.release();}
}
