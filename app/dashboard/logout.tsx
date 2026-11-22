'use client';import {useRouter} from 'next/navigation';
export default function Logout(){const router=useRouter();return <button className="btn outline" onClick={async()=>{await fetch('/api/auth/logout',{method:'POST'});router.push('/login');router.refresh();}}>تسجيل الخروج</button>;}
