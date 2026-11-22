import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
export async function GET(){const r=await pool.query("SELECT id,title,department,description,opens_at,closes_at FROM jobs WHERE status='published' AND (opens_at IS NULL OR opens_at<=now()) AND (closes_at IS NULL OR closes_at>=now()) ORDER BY created_at DESC LIMIT 100");return NextResponse.json(r.rows);}
