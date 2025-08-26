 import express from 'express';
 import { query } from '../lib/db.js';
 import { requireAuth } from '../middleware/auth.js';
 
 const router = express.Router();
 
 // Send a message to a tutor
 router.post('/', requireAuth, async (req, res) => {
   const { recipientId, content } = req.body;
   if (!recipientId || !content) return res.status(400).json({ error: 'Missing fields' });
   try {
     const result = await query(
       `INSERT INTO messages (sender_id, recipient_id, content) VALUES ($1,$2,$3) RETURNING id, created_at`,
       [req.user.id, recipientId, content]
     );
     res.status(201).json({ id: result.rows[0].id, createdAt: result.rows[0].created_at });
   } catch (e) {
     res.status(400).json({ error: 'Failed to send message' });
   }
 });
 
 export default router;
 

