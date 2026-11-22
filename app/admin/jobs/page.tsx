import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getCurrentUser} from '@/lib/auth';
import {pool} from '@/lib/db';
import JobAdmin from './job-admin';
import './admin.css';
export const dynamic='force-dynamic';
export default async function AdminJobs(){
 const user=await getCurrentUser();if(!user)redirect('/login');
 if(!['admin','hr'].includes(user.role))return <main><h2>ليس لديك صلاحية إدارة الوظائف</h2><Link href="/dashboard">العودة</Link></main>;
 const [jobs,specs]=await Promise.all([pool.query('SELECT id,title,department,status,created_at FROM jobs ORDER BY created_at DESC LIMIT 100'),pool.query('SELECT id,name_ar FROM specializations WHERE active=true ORDER BY name_ar')]);
 return <><header><h1>إدارة إعلانات التوظيف</h1><p>إنشاء الإعلانات واعتماد الشروط قبل النشر</p></header><main><JobAdmin initialJobs={jobs.rows} specializations={specs.rows}/></main></>;
}
