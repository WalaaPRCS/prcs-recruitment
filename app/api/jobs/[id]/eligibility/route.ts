import {NextResponse} from 'next/server';
import {getCurrentUser} from '@/lib/auth';
import {evaluateJob} from '@/lib/job-eligibility';
import {z} from 'zod';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await getCurrentUser();
 if(!user)return NextResponse.json({state:'login_required'});
 if(user.role!=='applicant')return NextResponse.json({state:'not_applicant'},{status:403});
 const {id}=await params;
 if(!z.string().uuid().safeParse(id).success)return NextResponse.json({state:'not_found'},{status:404});
 const result=await evaluateJob(user.id,id);
 return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
}
