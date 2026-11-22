import { NextResponse } from 'next/server';
import { z } from 'zod';
import { pool } from '@/lib/db';
import { hashPassword, signSession, sessionCookie } from '@/lib/auth';
const schema=z.object({nationalId:z.string().trim().min(5).max(32),fullName:z.string().trim().min(5).max(180),email:z.string().trim().email().optional().or(z.literal('')),phone:z.string().trim().min(7).max(24).optional().or(z.literal('')),password:z.string().min(12).max(128)}).refine(v=>!!v.email||!!v.phone,{message:'البريد الإلكتروني أو الهاتف مطلوب'});
export async function POST(request:Request) {
 try {
  const parsed=schema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:'تحقق من البيانات المدخلة',details:parsed.error.flatten().fieldErrors},{status:400});
  const v=parsed.data;
  const client=await pool.connect();
  try {
   await client.query('BEGIN');
   const result=await client.query('INSERT INTO users(national_id,email,phone,password_hash) VALUES($1,$2,$3,$4) RETURNING id',[v.nationalId,v.email?.toLowerCase()||null,v.phone||null,await hashPassword(v.password)]);
   await client.query('INSERT INTO applicant_profiles(user_id,full_name) VALUES($1,$2)',[result.rows[0].id,v.fullName]);
   await client.query('COMMIT');
   const response=NextResponse.json({ok:true},{status:201});
   const cookie=sessionCookie(signSession(result.rows[0].id));response.cookies.set(cookie.name,cookie.value,cookie.options);
   return response;
  }catch(e:any){await client.query('ROLLBACK');if(e.code==='23505')return NextResponse.json({error:'رقم الهوية أو وسيلة التواصل مستخدمة سابقًا'},{status:409});throw e;}
  finally{client.release();}
 }catch{return NextResponse.json({error:'تعذر إنشاء الحساب'},{status:500});}
}
