import { pool } from '../lib/postgres';
import { PoolClient } from 'pg';

export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN';
  createdAt: Date;
  verifiedAt?: Date;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  branch: string;
  year: number;
  headline: string;
  skills: string[];
  projectUrl?: string;
  resumeUrl?: string;
  videoUrl?: string;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  name: string;
  org: string;
  title: string;
}

export class UserService {
  static async createUser(email: string, role: 'STUDENT' | 'RECRUITER' = 'STUDENT'): Promise<User> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO users (email, role) VALUES ($1, $2) RETURNING *`,
        [email, role]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async findUserById(id: string): Promise<User | null> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM users WHERE id = $1`,
        [id]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async verifyUser(id: string): Promise<void> {
    const client: PoolClient = await pool.connect();
    try {
      await client.query(
        `UPDATE users SET verified_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );
    } finally {
      client.release();
    }
  }

  static async createStudentProfile(userId: string, profileData: Omit<StudentProfile, 'id' | 'userId'>): Promise<StudentProfile> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO student_profiles 
         (user_id, name, branch, year, headline, skills, project_url, resume_url, video_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          userId,
          profileData.name,
          profileData.branch,
          profileData.year,
          profileData.headline,
          profileData.skills,
          profileData.projectUrl,
          profileData.resumeUrl,
          profileData.videoUrl
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async createRecruiterProfile(userId: string, profileData: Omit<RecruiterProfile, 'id' | 'userId'>): Promise<RecruiterProfile> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO recruiter_profiles 
         (user_id, name, org, title) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, profileData.name, profileData.org, profileData.title]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM student_profiles WHERE user_id = $1`,
        [userId]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async getRecruiterProfile(userId: string): Promise<RecruiterProfile | null> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM recruiter_profiles WHERE user_id = $1`,
        [userId]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async updateStudentProfile(userId: string, profileData: Partial<Omit<StudentProfile, 'id' | 'userId'>>): Promise<StudentProfile> {
    const client: PoolClient = await pool.connect();
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (profileData.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(profileData.name);
      }
      if (profileData.branch !== undefined) {
        fields.push(`branch = $${paramIndex++}`);
        values.push(profileData.branch);
      }
      if (profileData.year !== undefined) {
        fields.push(`year = $${paramIndex++}`);
        values.push(profileData.year);
      }
      if (profileData.headline !== undefined) {
        fields.push(`headline = $${paramIndex++}`);
        values.push(profileData.headline);
      }
      if (profileData.skills !== undefined) {
        fields.push(`skills = $${paramIndex++}`);
        values.push(profileData.skills);
      }
      if (profileData.projectUrl !== undefined) {
        fields.push(`project_url = $${paramIndex++}`);
        values.push(profileData.projectUrl);
      }
      if (profileData.resumeUrl !== undefined) {
        fields.push(`resume_url = $${paramIndex++}`);
        values.push(profileData.resumeUrl);
      }
      if (profileData.videoUrl !== undefined) {
        fields.push(`video_url = $${paramIndex++}`);
        values.push(profileData.videoUrl);
      }

      values.push(userId);
      const result = await client.query(
        `UPDATE student_profiles SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
        values
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async updateRecruiterProfile(userId: string, profileData: Partial<Omit<RecruiterProfile, 'id' | 'userId'>>): Promise<RecruiterProfile> {
    const client: PoolClient = await pool.connect();
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (profileData.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(profileData.name);
      }
      if (profileData.org !== undefined) {
        fields.push(`org = $${paramIndex++}`);
        values.push(profileData.org);
      }
      if (profileData.title !== undefined) {
        fields.push(`title = $${paramIndex++}`);
        values.push(profileData.title);
      }

      values.push(userId);
      const result = await client.query(
        `UPDATE recruiter_profiles SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
        values
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async getUserWithProfile(userId: string): Promise<{ user: User; studentProfile?: StudentProfile; recruiterProfile?: RecruiterProfile } | null> {
    const client: PoolClient = await pool.connect();
    try {
      const userResult = await client.query(
        `SELECT * FROM users WHERE id = $1`,
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        return null;
      }

      const user: User = userResult.rows[0];
      let studentProfile: StudentProfile | undefined;
      let recruiterProfile: RecruiterProfile | undefined;

      if (user.role === 'STUDENT') {
        const profileResult = await client.query(
          `SELECT * FROM student_profiles WHERE user_id = $1`,
          [userId]
        );
        studentProfile = profileResult.rows.length > 0 ? profileResult.rows[0] : undefined;
      } else if (user.role === 'RECRUITER') {
        const profileResult = await client.query(
          `SELECT * FROM recruiter_profiles WHERE user_id = $1`,
          [userId]
        );
        recruiterProfile = profileResult.rows.length > 0 ? profileResult.rows[0] : undefined;
      }

      return { user, studentProfile, recruiterProfile };
    } finally {
      client.release();
    }
  }
}