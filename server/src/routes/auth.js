 import express from 'express';
 import bcrypt from 'bcryptjs';
 import jwt from 'jsonwebtoken';
 import { query } from '../lib/db.js';
 import { requireAuth } from '../middleware/auth.js';
 
 const router = express.Router();
 
 router.post('/register', async (req, res) => {
   try {
     const { email, password, firstName, lastName, isTutor } = req.body;
     if (!email || !password || !firstName || !lastName) {
       return res.status(400).json({ error: 'Missing fields' });
     }
     const existing = await query('SELECT id FROM users WHERE email=$1', [email]);
     if (existing.rowCount > 0) return res.status(409).json({ error: 'Email already in use' });
     const hash = await bcrypt.hash(password, 10);
     const result = await query(
       `INSERT INTO users (email, password_hash, first_name, last_name, is_tutor)
        VALUES ($1,$2,$3,$4,$5) RETURNING id, first_name, last_name, email, is_tutor, is_verified, campus_credits`,
       [email, hash, firstName, lastName, Boolean(isTutor)]
     );
     const user = result.rows[0];
     const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
     res.json({ token, user: { id: user.id, name: `${user.first_name} ${user.last_name}`, email: user.email, isTutor: user.is_tutor, isVerified: user.is_verified, campusCredits: user.campus_credits } });
   } catch (err) {
     res.status(500).json({ error: 'Registration failed' });
   }
 });
 
 router.post('/login', async (req, res) => {
   try {
     const { email, password } = req.body;
     const result = await query('SELECT * FROM users WHERE email=$1', [email]);
     if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });
     const user = result.rows[0];
     const ok = await bcrypt.compare(password, user.password_hash);
     if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
     const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
     res.json({ token, user: { id: user.id, name: `${user.first_name} ${user.last_name}`, email: user.email, isTutor: user.is_tutor, isVerified: user.is_verified, campusCredits: user.campus_credits } });
   } catch (err) {
     res.status(500).json({ error: 'Login failed' });
   }
 });
 
 router.get('/me', requireAuth, async (req, res) => {
   const result = await query('SELECT id, first_name, last_name, email, is_tutor, is_verified, campus_credits FROM users WHERE id=$1', [req.user.id]);
   if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
   const u = result.rows[0];
   res.json({ id: u.id, name: `${u.first_name} ${u.last_name}`, email: u.email, isTutor: u.is_tutor, isVerified: u.is_verified, campusCredits: u.campus_credits });
 });
 
 export default router;
 

