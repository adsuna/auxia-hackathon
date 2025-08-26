 import express from 'express';
 import { query } from '../lib/db.js';
 import { requireAuth } from '../middleware/auth.js';
 
 const router = express.Router();
 
 router.post('/', requireAuth, async (req, res) => {
   try {
     const { tutorId, subjectId, date, time, durationHours, sessionType, notes } = req.body;
     const costRes = await query('SELECT calculate_session_cost($1,$2,$3) as total', [tutorId, subjectId, durationHours]);
     const total = Number(costRes.rows[0].total);
     const result = await query(
       `INSERT INTO sessions (student_id, tutor_id, subject_id, scheduled_date, scheduled_time, duration_hours, session_type, notes, total_cost, status, virtual_link)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'confirmed', CASE WHEN $7='virtual' THEN 'https://meet.example.com/' || substr(md5(random()::text),1,8) ELSE NULL END)
        RETURNING id, virtual_link`,
       [req.user.id, tutorId, subjectId, date, time, durationHours, sessionType, notes || '', total]
     );
     res.status(201).json({ id: result.rows[0].id, total, virtualLink: result.rows[0].virtual_link });
   } catch (err) {
     res.status(400).json({ error: err.message || 'Booking failed' });
   }
 });
 
 router.get('/upcoming', requireAuth, async (req, res) => {
   const result = await query(
     `SELECT s.id, s.scheduled_date as date, to_char(s.scheduled_time,'HH12:MI AM') as time, s.duration_hours as duration,
             s.session_type as type, s.status,
             (SELECT first_name || ' ' || last_name FROM users WHERE id = s.tutor_id) as tutor_name,
             (SELECT avatar_url FROM users WHERE id = s.tutor_id) as tutor_avatar,
             (SELECT name FROM subjects WHERE id = s.subject_id) as subject,
             CASE WHEN s.session_type='virtual' THEN s.virtual_link ELSE 'On Campus' END as location
      FROM sessions s
      WHERE s.student_id=$1 AND s.status IN ('pending','confirmed') AND s.scheduled_date >= CURRENT_DATE
      ORDER BY s.scheduled_date, s.scheduled_time`,
     [req.user.id]
   );
   res.json(result.rows);
 });
 
 router.get('/past', requireAuth, async (req, res) => {
   const result = await query(
     `SELECT s.id, s.scheduled_date as date, to_char(s.scheduled_time,'HH12:MI AM') as time, s.duration_hours as duration,
             s.session_type as type,
             (SELECT first_name || ' ' || last_name FROM users WHERE id = s.tutor_id) as tutor_name,
             (SELECT avatar_url FROM users WHERE id = s.tutor_id) as tutor_avatar,
             (SELECT name FROM subjects WHERE id = s.subject_id) as subject,
             COALESCE((SELECT rating FROM session_reviews WHERE session_id=s.id AND student_id=$1), NULL) as rating,
             COALESCE((SELECT review_text FROM session_reviews WHERE session_id=s.id AND student_id=$1), NULL) as review,
             CASE WHEN s.session_type='virtual' THEN s.virtual_link ELSE 'On Campus' END as location
      FROM sessions s
      WHERE s.student_id=$1 AND s.status='completed'
      ORDER BY s.scheduled_date DESC, s.scheduled_time DESC`,
     [req.user.id]
   );
   res.json(result.rows);
 });
 
 router.post('/:id/reviews', requireAuth, async (req, res) => {
   const { id } = req.params;
   const { rating, reviewText } = req.body;
   try {
     const result = await query(
       `INSERT INTO session_reviews (session_id, student_id, tutor_id, rating, review_text)
        SELECT $1, $2, s.tutor_id, $3, $4 FROM sessions s WHERE s.id=$1 AND s.student_id=$2 AND s.status='completed'
        RETURNING id`,
       [id, req.user.id, rating, reviewText || '']
     );
     if (result.rowCount === 0) return res.status(400).json({ error: 'Cannot review this session' });
     res.status(201).json({ id: result.rows[0].id });
   } catch (err) {
     res.status(400).json({ error: 'Failed to create review' });
   }
 });
 
 export default router;
 

