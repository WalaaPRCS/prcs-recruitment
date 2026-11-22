import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';
export async function POST(){const response=NextResponse.json({ok:true});const c=clearSessionCookie();response.cookies.set(c.name,c.value,c.options);return response;}
