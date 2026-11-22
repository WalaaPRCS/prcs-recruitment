import {NextResponse} from 'next/server';
import {pool} from '@/lib/db';
import {z} from 'zod';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:'غير موجود'},{status:404});
 const r=await pool.query("SELECT id,title,department,description,opens_at,closes_at FROM jobs WHERE id=$1 AND status='published' AND (opens_at IS NULL OR opens_at<=now())",[id]);
 if(!r.rowCount)return NextResponse.json({error:'غير موجود'},{status:404});
 return NextResponse.json(r.rows[0]);
}
