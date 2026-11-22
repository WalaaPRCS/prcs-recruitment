import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getCurrentUser} from '@/lib/auth';
import ApplicationsTable from './table';
export default async function Applications(){const user=await getCurrentUser();if(!user)redirect('/login');if(!['admin','hr'].includes(user.role))return <main>غير مصرح لك بعرض الطلبات</main>;return <><header><h1>إدارة طلبات التوظيف</h1><p>مراجعة الطلبات وتحديث حالاتها</p></header><main><p><Link href="/admin/jobs">إدارة إعلانات الوظائف</Link></p><ApplicationsTable/></main></>;}
