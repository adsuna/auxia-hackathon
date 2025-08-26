 import express from 'express';
 import { query } from '../lib/db.js';
 
 const router = express.Router();
 
 router.get('/', async (req, res) => {
   const result = await query('SELECT id, name, code, department, description FROM subjects WHERE is_active = TRUE ORDER BY name');
   res.json(result.rows);
 });
 
 export default router;
 

