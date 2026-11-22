import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { pool } from './db';
const scrypt = promisify(scryptCallback);
const COOKIE = 'prcs_session';
export async function hashPassword(password:string) {
 const salt=randomBytes(16).toString('hex');
 const derived=(await scrypt(password,salt,64)) as Buffer;
 return 'scrypt:'+salt+':'+derived.toString('hex');
}
export async function verifyPassword(password:string,stored:string) {
 const [method,salt,hex]=stored.split(':');
 if(method!=='scrypt'||!salt||!hex||!/^[a-f0-9]{128}$/i.test(hex))return false;
 const actual=(await scrypt(password,salt,64)) as Buffer;
 return timingSafeEqual(actual,Buffer.from(hex,'hex'));
}
function secret(){const s=process.env.SESSION_SECRET;if(!s||s.length<32)throw new Error('SESSION_SECRET must be at least 32 characters');return s;}
export function signSession(userId:string) {
 const expires=Date.now()+7*24*3600*1000;
 const payload=Buffer.from(JSON.stringify({userId,expires})).toString('base64url');
 const signature=createHmac('sha256',secret()).update(payload).digest('base64url');
 return payload+'.'+signature;
}
export async function getCurrentUser() {
 const token=(await cookies()).get(COOKIE)?.value;
 if(!token)return null;
 const [payload,signature]=token.split('.');
 if(!payload||!signature)return null;
 const expected=createHmac('sha256',secret()).update(payload).digest();
 let provided:Buffer;
 try {provided=Buffer.from(signature,'base64url');}catch{return null;}
 if(provided.length!==expected.length||!timingSafeEqual(provided,expected))return null;
 let data:{userId:string;expires:number};
 try {data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));}catch{return null;}
 if(!data.userId||!data.expires||data.expires<Date.now())return null;
 const result=await pool.query('SELECT id, national_id, email, phone, role FROM users WHERE id=$1',[data.userId]);
 return result.rows[0]??null;
}
export function sessionCookie(token:string){return {name:COOKIE,value:token,options:{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/',maxAge:7*24*3600}};}
export function clearSessionCookie(){return {name:COOKIE,value:'',options:{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/',maxAge:0}};}
