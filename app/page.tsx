import Link from 'next/link';
import {pool} from '@/lib/db';
import {getCurrentUser} from '@/lib/auth';
export const dynamic='force-dynamic';
export default async function Home(){
 const user=await getCurrentUser();
 const result=await pool.query("SELECT id,title,department,description,closes_at FROM jobs WHERE status='published' AND (opens_at IS NULL OR opens_at<=now()) AND (closes_at IS NULL OR closes_at>=now()) ORDER BY created_at DESC LIMIT 100");
 return <><header><h1>جمعية الهلال الأحمر الفلسطيني</h1><p>نظام التوظيف الإلكتروني · PRCS Recruitment</p></header><main><div className="hero"><div><h2>فرص العمل المتاحة</h2><p className="muted">اطّلع على الوظائف المنشورة وشروط كل وظيفة.</p></div><div>{user?<Link className="btn outline" href="/dashboard">حسابي</Link>:<><Link className="btn" href="/login">تسجيل الدخول</Link> <Link className="btn outline" href="/register">إنشاء حساب</Link></>}</div></div><div className="notice">النظام في مرحلة التطوير والاختبار، ولا يستقبل طلبات توظيف حقيقية حاليًا.</div><div className="stats"><div className="card stat"><strong>{result.rows.length}</strong>وظائف منشورة</div></div><section><h3>إعلانات الوظائف</h3><div className="jobs">{result.rows.map(job=><article className="card" key={job.id}><span className="pill">إعلان وظيفة</span><h3>{job.title}</h3><p className="muted">{job.department}</p><p>{job.description.slice(0,150)}</p><Link className="btn outline" href={'/jobs/'+job.id}>تفاصيل الوظيفة والشروط</Link></article>)}</div>{!result.rows.length&&<div className="card muted">لا توجد وظائف منشورة حاليًا.</div>}</section></main><footer>PRCS · Recruitment prototype</footer></>;
}
