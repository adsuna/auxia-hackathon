 import 'dotenv/config';
 import express from 'express';
 import cors from 'cors';
 import helmet from 'helmet';
 import morgan from 'morgan';
 import { pool } from './lib/db.js';
 import authRouter from './routes/auth.js';
 import tutorsRouter from './routes/tutors.js';
 import subjectsRouter from './routes/subjects.js';
 import sessionsRouter from './routes/sessions.js';
 import leaderboardRouter from './routes/leaderboard.js';
 import documentsRouter from './routes/documents.js';
 
 const app = express();
 
 app.use(helmet());
 app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
 app.use(express.json());
 app.use(morgan('dev'));
 
 app.get('/api/health', async (req, res) => {
   try {
     await pool.query('SELECT 1');
     res.json({ ok: true });
   } catch (err) {
     res.status(500).json({ ok: false });
   }
 });
 
 app.use('/api/auth', authRouter);
 app.use('/api/subjects', subjectsRouter);
 app.use('/api/tutors', tutorsRouter);
 app.use('/api/sessions', sessionsRouter);
 app.use('/api/leaderboard', leaderboardRouter);
 app.use('/api/documents', documentsRouter);
 
 const port = process.env.PORT || 4000;
 app.listen(port, () => {
   // eslint-disable-next-line no-console
   console.log(`API listening on http://localhost:${port}`);
 });
 

