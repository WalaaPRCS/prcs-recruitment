import { NextResponse } from 'next/server';
import { z } from 'zod';
import { pool } from '@/lib/db';
import { verifyPassword, signSession, sessionCookie } from '@/lib/auth';
const schema=z.object({identifier:z.string().trim().min(3),password:z.string().min(1)});
export async function POST(request:Request){
 try{
  const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:'بيانات الدخول غير مكتملة'},{status:400});
  const {identifier,password}=parsed.data;
  const result=await pool.query('SELECT id,password_hash FROM users WHERE lower(email)=lower($1) OR phone=$1 LIMIT 1',[identifier]);
  const row=result.rows[0];
  if(!row||!await verifyPassword(password,row.password_hash))return NextResponse.json({error:'بيانات الدخول غير صحيحة'},{status:401});
  const response=NextResponse.json({ok:true});
  const cookie=sessionCookie(signSession(row.id));response.cookies.set(cookie.name,cookie.value,cookie.options);return response;
 }catch{return NextResponse.json({error:'تعذر تسجيل الدخول'},{status:500});}
}
