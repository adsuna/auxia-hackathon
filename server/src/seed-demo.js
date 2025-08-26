import 'dotenv/config';
import { query, pool } from './lib/db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    // Subjects (ensure core set exists)
    const subjects = [
      ['Computer Science', 'CS101', 'Computer Science'],
      ['Data Structures', 'CS201', 'Computer Science'],
      ['Mathematics', 'MATH101', 'Mathematics'],
      ['Physics', 'PHYS101', 'Physics'],
      ['Biology', 'BIO101', 'Biology'],
      ['Organic Chemistry', 'CHEM201', 'Chemistry'],
      ['Engineering Design', 'ENG101', 'Engineering']
    ];
    for (const [name, code, dept] of subjects) {
      await query(
        `INSERT INTO subjects (name, code, department, difficulty_level, is_active)
         VALUES ($1,$2,$3,2,TRUE)
         ON CONFLICT (code) DO NOTHING`,
        [name, code, dept]
      );
    }

    // Users (multiple Indian tutors and students)
    const hash = await bcrypt.hash('password123', 10);
    const mkUser = async (email, first, last, isTutor, isVerified, avatarName) => {
      const res = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, is_tutor, is_verified, avatar_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email
         RETURNING id`,
        [email, hash, first, last, isTutor, isVerified, avatarName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=3b82f6&color=fff` : null]
      );
      return res.rows[0].id;
    };

    const tutorAaravId = await mkUser('aarav.sharma@example.in', 'Aarav', 'Sharma', true, true, 'Aarav Sharma');
    const tutorIshaId = await mkUser('isha.patel@example.in', 'Isha', 'Patel', true, true, 'Isha Patel');
    const tutorRohanId = await mkUser('rohan.gupta@example.in', 'Rohan', 'Gupta', true, false, 'Rohan Gupta');
    const tutorNehaId = await mkUser('neha.singh@example.in', 'Neha', 'Singh', true, true, 'Neha Singh');

    const studentAnanyaId = await mkUser('ananya.verma@example.in', 'Ananya', 'Verma', false, false, 'Ananya Verma');
    const studentVikramId = await mkUser('vikram.iyer@example.in', 'Vikram', 'Iyer', false, false, 'Vikram Iyer');
    const studentPriyaId = await mkUser('priya.nair@example.in', 'Priya', 'Nair', false, false, 'Priya Nair');
    const studentKunalId = await mkUser('kunal.mehta@example.in', 'Kunal', 'Mehta', false, false, 'Kunal Mehta');

    // Subject IDs
    const idOf = async (code) => (await query('SELECT id FROM subjects WHERE code=$1', [code])).rows[0].id;
    const dsId = await idOf('CS201');
    const csId = await idOf('CS101');
    const mathId = await idOf('MATH101');
    const physId = await idOf('PHYS101');
    const bioId = await idOf('BIO101');
    const chemId = await idOf('CHEM201');
    const engId = await idOf('ENG101');

    // Tutor subjects with INR rates
    const upsertTS = (tutorId, subjectId, prof, rate) => query(
      `INSERT INTO tutor_subjects (tutor_id, subject_id, proficiency_level, hourly_rate, is_available)
       VALUES ($1,$2,$3,$4,TRUE)
       ON CONFLICT (tutor_id, subject_id) DO UPDATE SET proficiency_level=EXCLUDED.proficiency_level, hourly_rate=EXCLUDED.hourly_rate, is_available=EXCLUDED.is_available`,
      [tutorId, subjectId, prof, rate]
    );

    await upsertTS(tutorAaravId, dsId, 5, 800);
    await upsertTS(tutorAaravId, csId, 5, 750);
    await upsertTS(tutorIshaId, mathId, 5, 650);
    await upsertTS(tutorIshaId, physId, 4, 600);
    await upsertTS(tutorRohanId, chemId, 4, 700);
    await upsertTS(tutorRohanId, bioId, 3, 550);
    await upsertTS(tutorNehaId, engId, 5, 900);
    await upsertTS(tutorNehaId, csId, 4, 700);

    // Availability
    const addAvail = async (tutorId, days) => {
      for (const d of days) {
        await query(`INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_available)
                     VALUES ($1,$2,'10:00','18:00',TRUE)
                     ON CONFLICT DO NOTHING`, [tutorId, d]);
      }
    };
    await addAvail(tutorAaravId, [1,3,5]);
    await addAvail(tutorIshaId, [2,4,6]);
    await addAvail(tutorRohanId, [1,2,3]);
    await addAvail(tutorNehaId, [4,5,6]);

    // TA endorsements (Indian)
    const endorse = (tutorId, subjectId, taName, taEmail, text) => query(
      `INSERT INTO ta_endorsements (tutor_id, subject_id, ta_name, ta_email, endorsement_text, is_verified, semester, year)
       VALUES ($1,$2,$3,$4,$5,TRUE,'Fall',2024) ON CONFLICT DO NOTHING`,
      [tutorId, subjectId, taName, taEmail, text]
    );
    await endorse(tutorAaravId, dsId, 'Prof. Meera Krishnan', 'meera.krishnan@univ.in', 'Aarav consistently topped DS assignments and labs.');
    await endorse(tutorIshaId, mathId, 'Dr. Arvind Menon', 'arvind.menon@univ.in', 'Isha is meticulous with proofs; excellent tutor.');

    // Sessions and reviews with Indian context
    const createSession = async (studentId, tutorId, subjectId, daysOffset, time, duration, type, status, cost) => {
      const res = await query(
        `INSERT INTO sessions (student_id, tutor_id, subject_id, scheduled_date, scheduled_time, duration_hours, session_type, status, total_cost)
         VALUES ($1,$2,$3, CURRENT_DATE + ($4::int), $5, $6, $7, $8, $9)
         RETURNING id`,
        [studentId, tutorId, subjectId, daysOffset, time, duration, type, status, cost]
      );
      return res.rows[0].id;
    };
    const review = (sessionId, studentId, tutorId, rating, text) => query(
      `INSERT INTO session_reviews (session_id, student_id, tutor_id, rating, review_text)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [sessionId, studentId, tutorId, rating, text]
    );

    // Aarav (DS) - completed and upcoming
    const s1 = await createSession(studentAnanyaId, tutorAaravId, dsId, -10, '16:00', 1.5, 'virtual', 'completed', 1200);
    await review(s1, studentAnanyaId, tutorAaravId, 5, 'Great explanation of recursion and trees. Bohot helpful!');
    await createSession(studentVikramId, tutorAaravId, csId, 2, '11:00', 2.0, 'in-person', 'confirmed', 1500);

    // Isha (Math) - completed and upcoming
    const s3 = await createSession(studentPriyaId, tutorIshaId, mathId, -5, '10:30', 1.0, 'virtual', 'completed', 650);
    await review(s3, studentPriyaId, tutorIshaId, 5, 'Explained integrals with simple desi examples. Shukriya!');
    await createSession(studentKunalId, tutorIshaId, mathId, 3, '15:00', 1.5, 'in-person', 'confirmed', 975);

    // Rohan (Chem) - completed
    const s5 = await createSession(studentVikramId, tutorRohanId, chemId, -2, '14:00', 1.0, 'virtual', 'completed', 700);
    await review(s5, studentVikramId, tutorRohanId, 4, 'Good session, organic mechanisms were clearer.');

    // Neha (Engineering) - upcoming
    await createSession(studentAnanyaId, tutorNehaId, engId, 4, '13:00', 2.0, 'in-person', 'confirmed', 1800);

    console.log('Demo data seeded (India-focused)');
  } finally {
    await pool.end();
  }
}

seed();
 

