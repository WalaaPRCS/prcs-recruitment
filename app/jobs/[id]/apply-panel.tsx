'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
type State='login_required'|'eligible'|'ineligible'|'already_applied'|'closed'|'incomplete'|'not_applicant'|'not_found';
export default function ApplyPanel({jobId,initial}:{jobId:string;initial:{state:State;reasons?:string[]}}){
 const router=useRouter();const [status,setStatus]=useState(initial);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 async function apply(){
 setBusy(true);setMessage('');
 try{
 const check=await fetch('/api/jobs/'+jobId+'/eligibility',{cache:'no-store'});const current=await check.json();setStatus(current);
 if(current.state!=='eligible'){setMessage('تغيرت حالة الأهلية. يرجى مراجعة البيانات.');return;}
 const response=await fetch('/api/applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobId})});
 const result=await response.json();
 if(response.ok){setStatus({state:'already_applied'});setMessage('تم إرسال طلب التوظيف بنجاح');router.refresh();}
 else {setMessage(result.error||'تعذر إرسال الطلب');const latest=await fetch('/api/jobs/'+jobId+'/eligibility',{cache:'no-store'});if(latest.ok)setStatus(await latest.json());}
 }catch{setMessage('تعذر الاتصال بالخادم');}finally{setBusy(false);}
 }
 return <section className="card" style={{marginTop:20}} aria-live="polite"><h3>حالة الأهلية للتقديم</h3>
 {status.state==='login_required'&&<><p>سجل الدخول إلى حسابك لفحص شروط الوظيفة.</p><a className="btn" href="/login">تسجيل الدخول</a></>}
 {status.state==='eligible'&&<><p>أنت مستوفٍ للشروط الإلزامية المسجلة في النظام.</p><button className="btn" disabled={busy} onClick={apply}>{busy?'جارٍ التحقق...':'التقدم للوظيفة'}</button></>}
 {status.state==='ineligible'&&<><p>لا يمكن التقديم لأن بعض الشروط الإلزامية غير مستوفاة:</p><ul>{status.reasons?.map((reason,i)=><li key={i}>{reason}</li>)}</ul><a href="/dashboard/profile">تحديث بيانات الملف الشخصي</a></>}
 {status.state==='incomplete'&&<><p>لا يمكن تحديد الأهلية قبل استكمال الملف أو إعداد شروط الإعلان.</p><a href="/dashboard/profile">استكمال الملف الشخصي</a></>}
 {status.state==='already_applied'&&<p>تم التقديم لهذه الوظيفة مسبقًا. يمكنك متابعة طلبك من لوحة المتقدم.</p>}
 {status.state==='closed'&&<p>التقديم لهذه الوظيفة مغلق حاليًا.</p>}
 {status.state==='not_applicant'&&<p>التقديم متاح لحسابات المتقدمين فقط.</p>}
 {status.state==='not_found'&&<p>الإعلان غير موجود.</p>}
 {message&&<p role="status">{message}</p>}</section>;
}
