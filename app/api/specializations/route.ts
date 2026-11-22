import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
export async function GET(){const r=await pool.query('SELECT id,name_ar FROM specializations WHERE active=true ORDER BY name_ar');return NextResponse.json(r.rows);}
