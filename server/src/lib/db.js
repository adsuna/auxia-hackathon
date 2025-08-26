 import pg from 'pg';
 const { Pool } = pg;
 
 export const pool = new Pool({
   connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/peer_tutoring'
 });
 
 export async function query(text, params) {
   const start = Date.now();
   const res = await pool.query(text, params);
   const duration = Date.now() - start;
   // eslint-disable-next-line no-console
   console.log('executed query', { text: text.split('\n')[0], duration, rows: res.rowCount });
   return res;
 }
 

