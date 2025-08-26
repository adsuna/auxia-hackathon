import express from 'express';
import { query } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// List tutor documents (public by tutor id)
router.get('/:tutorId', async (req, res) => {
  const { tutorId } = req.params;
  const result = await query(
    `SELECT id, doc_type, title, url, verified, to_char(created_at,'YYYY-MM-DD') as created_at
     FROM tutor_documents WHERE tutor_id=$1 ORDER BY created_at DESC`,
    [tutorId]
  );
  res.json(result.rows);
});

// Add document (must be logged in and the tutor themselves)
router.post('/', requireAuth, async (req, res) => {
  const { docType, title, url } = req.body;
  try {
    const isTutorRes = await query('SELECT is_tutor FROM users WHERE id=$1', [req.user.id]);
    if (isTutorRes.rowCount === 0 || !isTutorRes.rows[0].is_tutor) {
      return res.status(403).json({ error: 'Only tutors can add documents' });
    }
    const result = await query(
      `INSERT INTO tutor_documents (tutor_id, doc_type, title, url, verified)
       VALUES ($1,$2,$3,$4,false) RETURNING id`,
      [req.user.id, docType || 'degree', title, url]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (e) {
    res.status(400).json({ error: 'Failed to add document' });
  }
});

export default router;
 

