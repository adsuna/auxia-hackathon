import { pool } from '../lib/postgres';
import { PoolClient } from 'pg';

export interface Job {
  id: string;
  recruiterId: string;
  title: string;
  description: string;
  skills: string[];
  batch?: number;
  location: string;
  ctcMin: number;
  ctcMax: number;
  videoUrl?: string;
  createdAt: Date;
}

export interface Like {
  id: string;
  fromUser: string;
  toType: 'JOB' | 'STUDENT' | 'USER';
  toId: string;
  stage: number; // -1 = dislike, 1 = like, 2 = super like
  createdAt: Date;
}

export interface Match {
  id: string;
  studentId: string;
  jobId: string;
  createdAt: Date;
}

export interface Slot {
  id: string;
  jobId: string;
  startTs: Date;
  endTs: Date;
  isBooked: boolean;
}

export interface Interview {
  id: string;
  matchId: string;
  slotId: string;
  meetUrl: string;
  icsPath: string;
  status: 'BOOKED' | 'DONE' | 'NO_SHOW';
}

export class JobService {
  static async createJob(jobData: Omit<Job, 'id' | 'createdAt'>): Promise<Job> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO jobs 
         (recruiter_id, title, description, skills, batch, location, ctc_min, ctc_max, video_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          jobData.recruiterId,
          jobData.title,
          jobData.description,
          jobData.skills,
          jobData.batch,
          jobData.location,
          jobData.ctcMin,
          jobData.ctcMax,
          jobData.videoUrl
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async getJobById(id: string): Promise<Job | null> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM jobs WHERE id = $1`,
        [id]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async getJobsByRecruiter(recruiterId: string, limit = 10, offset = 0): Promise<Job[]> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM jobs WHERE recruiter_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [recruiterId, limit, offset]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async getJobsForStudent(studentId: string, excludeExposed = true, limit = 10): Promise<Job[]> {
    const client: PoolClient = await pool.connect();
    try {
      let query = `
        SELECT j.* FROM jobs j
        WHERE j.id NOT IN (
          SELECT l.to_id FROM likes l 
          WHERE l.from_user = $1 AND l.to_type = 'JOB'
        )
      `;
      
      if (excludeExposed) {
        query += `
          AND j.id NOT IN (
            SELECT e.entity_id FROM exposures e 
            WHERE e.user_id = $1 AND e.entity_type = 'JOB'
          )
        `;
      }
      
      query += ` ORDER BY j.created_at DESC LIMIT $2`;
      
      const result = await client.query(query, [studentId, limit]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async addLike(fromUser: string, toType: 'JOB' | 'STUDENT' | 'USER', toId: string, stage = 1): Promise<Like> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO likes (from_user, to_type, to_id, stage) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (from_user, to_type, to_id) 
         DO UPDATE SET stage = EXCLUDED.stage, created_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [fromUser, toType, toId, stage]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async checkForMatch(studentId: string, jobId: string): Promise<Match | null> {
    const client: PoolClient = await pool.connect();
    try {
      // Check if both student and recruiter liked each other
      const studentLikesJob = await client.query(
        `SELECT * FROM likes WHERE from_user = $1 AND to_type = 'JOB' AND to_id = $2 AND stage > 0`,
        [studentId, jobId]
      );

      if (studentLikesJob.rows.length === 0) {
        return null;
      }

      // Get job's recruiter
      const job = await client.query(
        `SELECT recruiter_id FROM jobs WHERE id = $1`,
        [jobId]
      );

      if (job.rows.length === 0) {
        return null;
      }

      const recruiterId = job.rows[0].recruiter_id;

      // Check if recruiter liked the student
      const recruiterLikesStudent = await client.query(
        `SELECT * FROM likes WHERE from_user = $1 AND to_type = 'STUDENT' AND to_id = $2 AND stage > 0`,
        [recruiterId, studentId]
      );

      if (recruiterLikesStudent.rows.length === 0) {
        return null;
      }

      // Check if match already exists
      const existingMatch = await client.query(
        `SELECT * FROM matches WHERE student_id = $1 AND job_id = $2`,
        [studentId, jobId]
      );

      if (existingMatch.rows.length > 0) {
        return existingMatch.rows[0];
      }

      // Create match
      const matchResult = await client.query(
        `INSERT INTO matches (student_id, job_id) VALUES ($1, $2) RETURNING *`,
        [studentId, jobId]
      );

      return matchResult.rows[0];
    } finally {
      client.release();
    }
  }

  static async getMatchesByStudent(studentId: string): Promise<(Match & { job: Job })[]> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `SELECT m.*, j.* FROM matches m 
         JOIN jobs j ON m.job_id = j.id 
         WHERE m.student_id = $1 
         ORDER BY m.created_at DESC`,
        [studentId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        studentId: row.student_id,
        jobId: row.job_id,
        createdAt: row.created_at,
        job: {
          id: row.job_id,
          recruiterId: row.recruiter_id,
          title: row.title,
          description: row.description,
          skills: row.skills,
          batch: row.batch,
          location: row.location,
          ctcMin: row.ctc_min,
          ctcMax: row.ctc_max,
          videoUrl: row.video_url,
          createdAt: row.created_at
        }
      }));
    } finally {
      client.release();
    }
  }

  static async getMatchesByRecruiter(recruiterId: string): Promise<(Match & { job: Job })[]> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `SELECT m.*, j.* FROM matches m 
         JOIN jobs j ON m.job_id = j.id 
         WHERE j.recruiter_id = $1 
         ORDER BY m.created_at DESC`,
        [recruiterId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        studentId: row.student_id,
        jobId: row.job_id,
        createdAt: row.created_at,
        job: {
          id: row.job_id,
          recruiterId: row.recruiter_id,
          title: row.title,
          description: row.description,
          skills: row.skills,
          batch: row.batch,
          location: row.location,
          ctcMin: row.ctc_min,
          ctcMax: row.ctc_max,
          videoUrl: row.video_url,
          createdAt: row.created_at
        }
      }));
    } finally {
      client.release();
    }
  }

  static async addSlot(jobId: string, startTs: Date, endTs: Date): Promise<Slot> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO slots (job_id, start_ts, end_ts) VALUES ($1, $2, $3) RETURNING *`,
        [jobId, startTs, endTs]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async getAvailableSlots(jobId: string): Promise<Slot[]> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM slots WHERE job_id = $1 AND is_booked = false AND start_ts > CURRENT_TIMESTAMP ORDER BY start_ts ASC`,
        [jobId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async bookInterview(matchId: string, slotId: string, meetUrl: string, icsPath: string): Promise<Interview> {
    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Mark slot as booked
      await client.query(
        `UPDATE slots SET is_booked = true WHERE id = $1`,
        [slotId]
      );
      
      // Create interview
      const result = await client.query(
        `INSERT INTO interviews (match_id, slot_id, meet_url, ics_path) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [matchId, slotId, meetUrl, icsPath]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getInterviewsByStudent(studentId: string): Promise<(Interview & { match: Match; slot: Slot; job: Job })[]> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `SELECT i.*, m.*, s.*, j.* 
         FROM interviews i
         JOIN matches m ON i.match_id = m.id
         JOIN slots s ON i.slot_id = s.id
         JOIN jobs j ON m.job_id = j.id
         WHERE m.student_id = $1
         ORDER BY s.start_ts ASC`,
        [studentId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        matchId: row.match_id,
        slotId: row.slot_id,
        meetUrl: row.meet_url,
        icsPath: row.ics_path,
        status: row.status,
        match: {
          id: row.match_id,
          studentId: row.student_id,
          jobId: row.job_id,
          createdAt: row.created_at
        },
        slot: {
          id: row.slot_id,
          jobId: row.job_id,
          startTs: row.start_ts,
          endTs: row.end_ts,
          isBooked: row.is_booked
        },
        job: {
          id: row.job_id,
          recruiterId: row.recruiter_id,
          title: row.title,
          description: row.description,
          skills: row.skills,
          batch: row.batch,
          location: row.location,
          ctcMin: row.ctc_min,
          ctcMax: row.ctc_max,
          videoUrl: row.video_url,
          createdAt: row.created_at
        }
      }));
    } finally {
      client.release();
    }
  }

  static async recordExposure(userId: string, entityType: 'JOB' | 'STUDENT' | 'USER', entityId: string): Promise<void> {
    const client: PoolClient = await pool.connect();
    try {
      await client.query(
        `INSERT INTO exposures (user_id, entity_type, entity_id) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING`,
        [userId, entityType, entityId]
      );
    } finally {
      client.release();
    }
  }
}