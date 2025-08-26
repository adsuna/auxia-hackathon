 import 'dotenv/config';
 import { query, pool } from './lib/db.js';
 import fs from 'fs';
 import path from 'path';
 import url from 'url';
 
 const __filename = url.fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);
 
 async function run() {
   try {
     const schemaPath = path.join(__dirname, '../../database_schema.sql');
     const sql = fs.readFileSync(schemaPath, 'utf8');
     await query(sql);
     // Minimal seed users
     const res = await query(`SELECT COUNT(*) FROM users`);
     console.log('Users count:', res.rows[0].count);
   } catch (e) {
     console.error(e);
   } finally {
     await pool.end();
   }
 }
 
 run();
 

