import express from 'express';
import { query } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// List tutors (browse)
router.get('/', async (req, res) => {
  const { q, subject, verifiedOnly, sortBy } = req.query;
  const params = [];
  const where = ['u.is_tutor = TRUE'];
  if (verifiedOnly === 'true') where.push('u.is_verified = TRUE');
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push('(LOWER(u.first_name || " " || u.last_name) LIKE $' + params.length + ')');
  }
  if (subject) {
    params.push(subject);
    where.push('EXISTS (SELECT 1 FROM tutor_subjects ts WHERE ts.tutor_id = u.id AND ts.subject_id = $' + params.length + ')');
  }
  const order = sortBy === 'price' ? 'min_rate ASC' : sortBy === 'reviews' ? 'total_reviews DESC' : 'avg_rating DESC';
  const sql = `
    WITH stats AS (
      SELECT
        u.id,
        COALESCE(AVG(sr.rating),0) AS avg_rating,
        COUNT(sr.id) AS total_reviews,
        MIN(ts.hourly_rate) AS min_rate
      FROM users u
      LEFT JOIN session_reviews sr ON sr.tutor_id = u.id
      LEFT JOIN tutor_subjects ts ON ts.tutor_id = u.id
      WHERE u.is_tutor = TRUE
      GROUP BY u.id 
    )
    SELECT u.id,
           (u.first_name || ' ' || u.last_name) AS name,
           u.avatar_url AS avatar,
           u.is_verified AS verified,
           COALESCE(s.avg_rating,0) AS rating,
           COALESCE(s.total_reviews,0) AS review_count,
           COALESCE(s.min_rate,0) AS hourly_rate,
           'On Campus' as location,
           (SELECT COUNT(*) FROM ta_endorsements te WHERE te.tutor_id = u.id AND te.is_verified = TRUE) AS endorsements,
           ARRAY(
             SELECT s2.name FROM tutor_subjects ts2
             JOIN subjects s2 ON s2.id = ts2.subject_id
             WHERE ts2.tutor_id = u.id
           ) AS subjects
    FROM users u
    JOIN stats s ON s.id = u.id
    WHERE ${where.join(' AND ')}
    ORDER BY ${order}
  `;
  const result = await query(sql, params);
  res.json(result.rows.map(r => ({
    id: r.id,
    name: r.name,
    avatar: r.avatar,
    subjects: r.subjects || [],
    rating: Number(r.rating),
    reviewCount: Number(r.review_count),
    hourlyRate: Number(r.hourly_rate),
    location: r.location,
    verified: r.verified,
    endorsements: Number(r.endorsements)
  })));
});

// Tutor management endpoints (defined BEFORE the dynamic :id route)
router.get('/subjects/all', requireAuth, async (req, res) => {
  const result = await query('SELECT id, name, code FROM subjects WHERE is_active=TRUE ORDER BY name');
  res.json(result.rows);
});

router.get('/me/subjects', requireAuth, async (req, res) => {
  const result = await query(
    `SELECT ts.id, s.id as subject_id, s.name, ts.proficiency_level, ts.hourly_rate, ts.is_available
     FROM tutor_subjects ts JOIN subjects s ON s.id = ts.subject_id WHERE ts.tutor_id=$1 ORDER BY s.name`,
    [req.user.id]
  );
  res.json(result.rows);
});

router.post('/me/subjects', requireAuth, async (req, res) => {
  const { subjectId, hourlyRate, proficiencyLevel, isAvailable } = req.body;
  try {
    const result = await query(
      `INSERT INTO tutor_subjects (tutor_id, subject_id, proficiency_level, hourly_rate, is_available)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (tutor_id, subject_id) DO UPDATE SET proficiency_level=EXCLUDED.proficiency_level, hourly_rate=EXCLUDED.hourly_rate, is_available=EXCLUDED.is_available
       RETURNING id`,
      [req.user.id, subjectId, proficiencyLevel || 3, hourlyRate, isAvailable ?? true]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (e) {
    res.status(400).json({ error: 'Failed to upsert subject' });
  }
});

router.delete('/me/subjects/:subjectId', requireAuth, async (req, res) => {
  const { subjectId } = req.params;
  await query('DELETE FROM tutor_subjects WHERE tutor_id=$1 AND subject_id=$2', [req.user.id, subjectId]);
  res.json({ ok: true });
});

// Tutor detail
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const ures = await query('SELECT id, first_name, last_name, avatar_url, is_verified FROM users WHERE id=$1 AND is_tutor=TRUE', [id]);
  if (ures.rowCount === 0) return res.status(404).json({ error: 'Tutor not found' });
  const u = ures.rows[0];
  const sres = await query(
    `SELECT s.id, s.name, ts.hourly_rate
     FROM tutor_subjects ts JOIN subjects s ON s.id = ts.subject_id
     WHERE ts.tutor_id=$1
     ORDER BY s.name`,
    [id]
  );
  const stats = await query(
    `SELECT COALESCE(AVG(rating),0) AS rating, COUNT(*) AS review_count FROM session_reviews WHERE tutor_id=$1`,
    [id]
  );
  const totals = await query(
    `SELECT COUNT(*) AS total_students, COALESCE(SUM(duration_hours),0) AS total_hours FROM sessions WHERE tutor_id=$1 AND status='completed'`,
    [id]
  );
  const availability = await query(
    `SELECT day_of_week FROM tutor_availability WHERE tutor_id=$1 AND is_available=TRUE ORDER BY day_of_week`,
    [id]
  );
  const reviews = await query(
    `SELECT r.id, r.rating, r.review_text as comment, to_char(r.created_at,'YYYY-MM-DD') as date,
            (SELECT first_name || ' ' || last_name FROM users WHERE id=r.student_id) as student_name,
            (SELECT name FROM subjects WHERE id = (SELECT subject_id FROM sessions WHERE id=r.session_id)) as subject
     FROM session_reviews r WHERE tutor_id=$1 ORDER BY r.created_at DESC LIMIT 10`,
    [id]
  );
  const minRate = sres.rows.length > 0 ? Math.min(...sres.rows.map(r => Number(r.hourly_rate))) : 0;
  res.json({
    id: u.id,
    name: `${u.first_name} ${u.last_name}`,
    avatar: u.avatar_url,
    subjects: sres.rows.map(r => r.name),
    subjectDetails: sres.rows.map(r => ({ id: r.id, name: r.name, hourlyRate: Number(r.hourly_rate) })),
    rating: Number(stats.rows[0].rating),
    reviewCount: Number(stats.rows[0].review_count),
    hourlyRate: minRate,
    location: 'On Campus',
    verified: u.is_verified,
    endorsements: 0,
    bio: 'Tutor bio coming soon.',
    experience: 'Experience data',
    education: 'Education data',
    availability: availability.rows.map(r => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][r.day_of_week]),
    totalStudents: Number(totals.rows[0].total_students),
    totalHours: Number(totals.rows[0].total_hours),
    successRate: 95,
    reviews: reviews.rows.map(r => ({ id: r.id, studentName: r.student_name, rating: r.rating, comment: r.comment, date: r.date, subject: r.subject }))
  });
});

export default router;
 

