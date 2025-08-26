 import express from 'express';
 import { query } from '../lib/db.js';
 
 const router = express.Router();
 
 router.get('/', async (req, res) => {
   const { subject } = req.query;
   const params = [];
   const subjectFilter = subject ? 'WHERE ts.subject_id = $1' : '';
   if (subject) params.push(subject);
   const sql = `
     WITH base AS (
       SELECT u.id,
              u.first_name || ' ' || u.last_name AS name,
              u.avatar_url AS avatar,
              u.is_verified AS verified
       FROM users u WHERE u.is_tutor = TRUE
     ),
     agg AS (
       SELECT u.id,
              COALESCE(AVG(r.rating),0) AS rating,
              COUNT(r.id) AS review_count,
              COUNT(DISTINCT s.id) AS total_students,
              COALESCE(SUM(s.duration_hours),0) AS total_hours,
              (SELECT COUNT(*) FROM ta_endorsements te WHERE te.tutor_id = u.id AND te.is_verified=TRUE) AS endorsements
       FROM users u
       LEFT JOIN session_reviews r ON r.tutor_id = u.id
       LEFT JOIN sessions s ON s.tutor_id = u.id AND s.status='completed'
       GROUP BY u.id
     )
     SELECT b.id, b.name, b.avatar, b.verified, a.rating, a.review_count, a.total_students, a.total_hours, a.endorsements,
       ARRAY(
         SELECT s2.name FROM tutor_subjects ts
         JOIN subjects s2 ON s2.id = ts.subject_id
         WHERE ts.tutor_id = b.id
       ) as subjects,
       25 as hourly_rate
     FROM base b
     JOIN agg a ON a.id = b.id
     ORDER BY a.rating DESC, a.review_count DESC
     LIMIT 50
   `;
   const result = await query(sql, params);
   res.json(result.rows.map(r => ({
     id: r.id,
     name: r.name,
     avatar: r.avatar,
     subjects: r.subjects,
     rating: Number(r.rating),
     reviewCount: Number(r.review_count),
     totalStudents: Number(r.total_students),
     totalHours: Number(r.total_hours),
     hourlyRate: Number(r.hourly_rate),
     verified: r.verified,
     endorsements: Number(r.endorsements)
   })));
 });
 
 export default router;
 

