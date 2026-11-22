import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {getCurrentUser} from '@/lib/auth';
import {pool} from '@/lib/db';
import ReviewForm from './review-form';
import {z} from 'zod';
export default async function ApplicationDetail({params}:{params:Promise<{id:string}>}){
 const user=await getCurrentUser();if(!user)redirect('/login');if(!['admin','hr'].includes(user.role))return <main>غير مصرح</main>;
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();
 const r=await pool.query('SELECT a.id,a.status,a.submitted_at,a.snapshot,a.eligibility_result,j.title,p.full_name FROM applications a JOIN jobs j ON j.id=a.job_id JOIN applicant_profiles p ON p.user_id=a.applicant_id WHERE a.id=$1',[id]);
 if(!r.rowCount)notFound();const a=r.rows[0];
 return <><header><h1>مراجعة طلب توظيف</h1><p>{a.title}</p></header><main><p><Link href="/admin/applications">العودة إلى الطلبات</Link></p><div className="card"><h2>{a.full_name}</h2><p>الحالة: {a.status}</p><p>تاريخ التقديم: {new Date(a.submitted_at).toLocaleDateString('en-GB')}</p><h3>بيانات الطلب عند التقديم</h3><p>الاسم: {a.snapshot?.profile?.full_name}</p><p>المدينة: {a.snapshot?.profile?.city||'غير محددة'}</p><h3>المؤهلات</h3><ul>{(a.snapshot?.education||[]).map((e:{id:string;institution:string;degree_level:number})=><li key={e.id}>{e.institution} — مستوى {e.degree_level}</li>)}</ul><h3>الخبرات</h3><ul>{(a.snapshot?.experience||[]).map((e:{id:string;employer:string;job_title:string})=><li key={e.id}>{e.job_title} — {e.employer}</li>)}</ul><h3>نتيجة فحص الأهلية</h3><ul>{(a.eligibility_result?.checks||[]).map((c:{type:string;passed:boolean;reason:string},i:number)=><li key={i}>{c.type}: {c.passed?'مستوفى':c.reason}</li>)}</ul></div><ReviewForm applicationId={id} initialStatus={a.status}/></main></>;
}
