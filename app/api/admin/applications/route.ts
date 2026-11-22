import {NextResponse} from 'next/server';
import {getCurrentUser} from '@/lib/auth';
import {pool} from '@/lib/db';
import {z} from 'zod';
const querySchema=z.object({status:z.enum(['submitted','under_review','shortlisted','rejected','accepted']).optional(),jobId:z.string().uuid().optional(),page:z.coerce.number().int().min(1).max(100000).default(1),pageSize:z.coerce.number().int().min(1).max(100).default(20)});
export async function GET(request:Request){
 const user=await getCurrentUser();if(!user||!['admin','hr'].includes(user.role))return NextResponse.json({error:'غير مصرح'},{status:403});
 const parsed=querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
 if(!parsed.success)return NextResponse.json({error:'مرشحات غير صالحة'},{status:400});
 const {status,jobId,page,pageSize}=parsed.data;
 const args:unknown[]=[];const conditions:string[]=[];
 if(status){args.push(status);conditions.push('a.status=$'+args.length);}
 if(jobId){args.push(jobId);conditions.push('a.job_id=$'+args.length);}
 const where=conditions.length?'WHERE '+conditions.join(' AND '):'';
 const count=await pool.query('SELECT count(*)::int AS total FROM applications a '+where,args);
 const r=await pool.query(`SELECT a.id,a.job_id,a.status,a.submitted_at,j.title,p.full_name,u.national_id FROM applications a JOIN jobs j ON j.id=a.job_id JOIN users u ON u.id=a.applicant_id JOIN applicant_profiles p ON p.user_id=u.id ${where} ORDER BY a.submitted_at DESC,a.id DESC LIMIT $${args.length+1} OFFSET $${args.length+2}`,[...args,pageSize,(page-1)*pageSize]);
 return NextResponse.json({items:r.rows,total:count.rows[0].total,page,pageSize},{headers:{'Cache-Control':'no-store'}});
}
