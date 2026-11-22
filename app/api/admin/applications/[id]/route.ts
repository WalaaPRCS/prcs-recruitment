import {NextResponse} from 'next/server';
import {getCurrentUser} from '@/lib/auth';
import {pool} from '@/lib/db';
import {z} from 'zod';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await getCurrentUser();if(!user||!['admin','hr'].includes(user.role))return NextResponse.json({error:'غير مصرح'},{status:403});
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:'معرف غير صالح'},{status:400});
 const r=await pool.query('SELECT a.id,a.job_id,a.status,a.submitted_at,a.snapshot,a.eligibility_result,j.title,p.full_name,u.national_id FROM applications a JOIN jobs j ON j.id=a.job_id JOIN users u ON u.id=a.applicant_id JOIN applicant_profiles p ON p.user_id=u.id WHERE a.id=$1',[id]);
 if(!r.rowCount)return NextResponse.json({error:'الطلب غير موجود'},{status:404});
 return NextResponse.json(r.rows[0],{headers:{'Cache-Control':'no-store'}});
}
