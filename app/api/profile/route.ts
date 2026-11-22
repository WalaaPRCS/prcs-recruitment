import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { pool } from '@/lib/db';
const schema=z.object({fullName:z.string().trim().min(5).max(180),city:z.string().trim().max(120).optional(),birthDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal(''))});
export async function GET(){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:'يلزم تسجيل الدخول'},{status:401});
 const result=await pool.query('SELECT full_name,city,birth_date FROM applicant_profiles WHERE user_id=$1',[user.id]);
 return NextResponse.json({user,profile:result.rows[0]??null});
}
export async function PUT(request:Request){
 const user=await getCurrentUser();if(!user||user.role!=='applicant')return NextResponse.json({error:'غير مصرح'},{status:403});
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:'بيانات غير صالحة'},{status:400});
 const v=parsed.data;await pool.query('UPDATE applicant_profiles SET full_name=$1,city=$2,birth_date=$3,updated_at=now() WHERE user_id=$4',[v.fullName,v.city||null,v.birthDate||null,user.id]);
 return NextResponse.json({ok:true});
}
