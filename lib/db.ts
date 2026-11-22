import { Pool } from 'pg';
const globalForDb = globalThis as unknown as { recruitmentPool?: Pool };
export const pool = globalForDb.recruitmentPool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
if (process.env.NODE_ENV !== 'production') globalForDb.recruitmentPool = pool;
