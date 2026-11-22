import Link from 'next/link';
import {notFound} from 'next/navigation';
import {pool} from '@/lib/db';
import {getCurrentUser} from '@/lib/auth';
import {evaluateJob} from '@/lib/job-eligibility';
import ApplyPanel from './apply-panel';
import {z} from 'zod';
export const dynamic='force-dynamic';
export default async function JobDetails({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!z.string().uuid().safeParse(id).success)notFound();
 const result=await pool.query("SELECT id,title,department,description,opens_at,closes_at FROM jobs WHERE id=$1 AND status='published' AND (opens_at IS NULL OR opens_at<=now())",[id]);
 if(!result.rowCount)notFound();
 const job=result.rows[0];
 const requirements=await pool.query('SELECT kind,mandatory,config FROM job_requirements WHERE job_id=$1 ORDER BY mandatory DESC',[id]);
 const user=await getCurrentUser();
 const eligibility=user?await evaluateJob(user.id,id):{state:'login_required' as const};
 const labels:Record<string,string>={degree:'المؤهل العلمي',specialization:'التخصص',experience:'الخبرة العملية',license:'الترخيص'};
 return <><header><h1>تفاصيل الوظيفة</h1><p>جمعية الهلال الأحمر الفلسطيني</p></header><main><Link href="/">العودة إلى الوظائف</Link><article className="card" style={{marginTop:18}}><h2>{job.title}</h2><p className="muted">{job.department}</p><p style={{whiteSpace:'pre-wrap'}}>{job.description}</p><h3>شروط الوظيفة</h3>{requirements.rows.length?<ul>{requirements.rows.map((r,i)=><li key={i}>{labels[r.kind]||r.kind} — {r.mandatory?'شرط إلزامي':'شرط مفضل'}{r.kind==='experience'&&r.config?.minimumYears!=null?' — '+r.config.minimumYears+' سنوات':''}</li>)}</ul>:<p>لم تُحدد الشروط بعد.</p>}<ApplyPanel jobId={id} initial={eligibility}/></article></main></>;
}
