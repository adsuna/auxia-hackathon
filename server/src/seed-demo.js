import 'dotenv/config';
import { query, pool } from './lib/db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    // Subjects (expanded with more Indian-relevant subjects)
    const subjects = [
      ['Computer Science', 'CS101', 'Computer Science'],
      ['Data Structures', 'CS201', 'Computer Science'],
      ['Algorithms', 'CS301', 'Computer Science'],
      ['Database Systems', 'CS401', 'Computer Science'],
      ['Web Development', 'CS501', 'Computer Science'],
      ['Mathematics', 'MATH101', 'Mathematics'],
      ['Calculus', 'MATH201', 'Mathematics'],
      ['Linear Algebra', 'MATH301', 'Mathematics'],
      ['Statistics', 'MATH401', 'Mathematics'],
      ['Physics', 'PHYS101', 'Physics'],
      ['Mechanics', 'PHYS201', 'Physics'],
      ['Electromagnetism', 'PHYS301', 'Physics'],
      ['Biology', 'BIO101', 'Biology'],
      ['Microbiology', 'BIO201', 'Biology'],
      ['Genetics', 'BIO301', 'Biology'],
      ['Organic Chemistry', 'CHEM201', 'Chemistry'],
      ['Inorganic Chemistry', 'CHEM101', 'Chemistry'],
      ['Physical Chemistry', 'CHEM301', 'Chemistry'],
      ['Engineering Design', 'ENG101', 'Engineering'],
      ['Mechanical Engineering', 'MECH101', 'Engineering'],
      ['Electrical Engineering', 'EE101', 'Engineering'],
      ['Civil Engineering', 'CIVIL101', 'Engineering'],
      ['Economics', 'ECO101', 'Economics'],
      ['Business Management', 'BUS101', 'Business'],
      ['Marketing', 'MKT101', 'Business'],
      ['Finance', 'FIN101', 'Business'],
      ['English Literature', 'ENG101', 'Languages'],
      ['Hindi Literature', 'HIN101', 'Languages'],
      ['Sanskrit', 'SAN101', 'Languages']
    ];
    
    for (const [name, code, dept] of subjects) {
      await query(
        `INSERT INTO subjects (name, code, department, difficulty_level, is_active)
         VALUES ($1,$2,$3,2,TRUE)
         ON CONFLICT (code) DO NOTHING`,
        [name, code, dept]
      );
    }

    // Users (expanded with more Indian tutors and students)
    const hash = await bcrypt.hash('password123', 10);
    const mkUser = async (email, first, last, isTutor, isVerified, avatarName, campusCredits = 1000) => {
      const res = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, is_tutor, is_verified, avatar_url, campus_credits)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email
         RETURNING id`,
        [email, hash, first, last, isTutor, isVerified, avatarName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=3b82f6&color=fff` : null, campusCredits]
      );
      return res.rows[0].id;
    };

    // More diverse Indian tutors
    const tutorAaravId = await mkUser('aarav.sharma@example.in', 'Aarav', 'Sharma', true, true, 'Aarav Sharma', 2500);
    const tutorIshaId = await mkUser('isha.patel@example.in', 'Isha', 'Patel', true, true, 'Isha Patel', 1800);
    const tutorRohanId = await mkUser('rohan.gupta@example.in', 'Rohan', 'Gupta', true, false, 'Rohan Gupta', 1200);
    const tutorNehaId = await mkUser('neha.singh@example.in', 'Neha', 'Singh', true, true, 'Neha Singh', 2200);
    const tutorAdityaId = await mkUser('aditya.nair@example.in', 'Aditya', 'Nair', true, true, 'Aditya Nair', 1900);
    const tutorZaraId = await mkUser('zara.khan@example.in', 'Zara', 'Khan', true, true, 'Zara Khan', 1600);
    const tutorVikramId = await mkUser('vikram.iyer@example.in', 'Vikram', 'Iyer', true, false, 'Vikram Iyer', 1400);
    const tutorPriyaId = await mkUser('priya.reddy@example.in', 'Priya', 'Reddy', true, true, 'Priya Reddy', 2100);
    const tutorArjunId = await mkUser('arjun.malhotra@example.in', 'Arjun', 'Malhotra', true, true, 'Arjun Malhotra', 2800);
    const tutorKavyaId = await mkUser('kavya.verma@example.in', 'Kavya', 'Verma', true, false, 'Kavya Verma', 1100);

    // More diverse Indian students
    const studentAnanyaId = await mkUser('ananya.verma@example.in', 'Ananya', 'Verma', false, false, 'Ananya Verma', 800);
    const studentVikramId = await mkUser('vikram.mehta@example.in', 'Vikram', 'Mehta', false, false, 'Vikram Mehta', 650);
    const studentPriyaId = await mkUser('priya.nair@example.in', 'Priya', 'Nair', false, false, 'Priya Nair', 750);
    const studentKunalId = await mkUser('kunal.iyer@example.in', 'Kunal', 'Iyer', false, false, 'Kunal Iyer', 600);
    const studentAishaId = await mkUser('aisha.kapoor@example.in', 'Aisha', 'Kapoor', false, false, 'Aisha Kapoor', 900);
    const studentRahulId = await mkUser('rahul.sharma@example.in', 'Rahul', 'Sharma', false, false, 'Rahul Sharma', 550);
    const studentMeeraId = await mkUser('meera.patel@example.in', 'Meera', 'Patel', false, false, 'Meera Patel', 700);
    const studentDevId = await mkUser('dev.gupta@example.in', 'Dev', 'Gupta', false, false, 'Dev Gupta', 800);
    const studentTanviId = await mkUser('tanvi.reddy@example.in', 'Tanvi', 'Reddy', false, false, 'Tanvi Reddy', 650);
    const studentArnavId = await mkUser('arnav.malhotra@example.in', 'Arnav', 'Malhotra', false, false, 'Arnav Malhotra', 750);

    // Subject IDs
    const idOf = async (code) => (await query('SELECT id FROM subjects WHERE code=$1', [code])).rows[0].id;
    const dsId = await idOf('CS201');
    const csId = await idOf('CS101');
    const algoId = await idOf('CS301');
    const dbId = await idOf('CS401');
    const webId = await idOf('CS501');
    const mathId = await idOf('MATH101');
    const calcId = await idOf('MATH201');
    const linearId = await idOf('MATH301');
    const statsId = await idOf('MATH401');
    const physId = await idOf('PHYS101');
    const mechId = await idOf('PHYS201');
    const emId = await idOf('PHYS301');
    const bioId = await idOf('BIO101');
    const microId = await idOf('BIO201');
    const geneticsId = await idOf('BIO301');
    const chemId = await idOf('CHEM201');
    const inorgId = await idOf('CHEM101');
    const physChemId = await idOf('CHEM301');
    const engId = await idOf('ENG101');
    const mechEngId = await idOf('MECH101');
    const eeId = await idOf('EE101');
    const civilId = await idOf('CIVIL101');
    const ecoId = await idOf('ECO101');
    const busId = await idOf('BUS101');
    const mktId = await idOf('MKT101');
    const finId = await idOf('FIN101');
    const engLitId = await idOf('ENG101');
    const hinId = await idOf('HIN101');
    const sanId = await idOf('SAN101');

    // Tutor subjects with diverse INR rates and proficiency levels
    const upsertTS = (tutorId, subjectId, prof, rate) => query(
      `INSERT INTO tutor_subjects (tutor_id, subject_id, proficiency_level, hourly_rate, is_available)
       VALUES ($1,$2,$3,$4,TRUE)
       ON CONFLICT (tutor_id, subject_id) DO UPDATE SET proficiency_level=EXCLUDED.proficiency_level, hourly_rate=EXCLUDED.hourly_rate, is_available=EXCLUDED.is_available`,
      [tutorId, subjectId, prof, rate]
    );

    // Aarav - CS expert
    await upsertTS(tutorAaravId, dsId, 5, 800);
    await upsertTS(tutorAaravId, csId, 5, 750);
    await upsertTS(tutorAaravId, algoId, 5, 850);
    
    // Isha - Math & Physics expert
    await upsertTS(tutorIshaId, mathId, 5, 650);
    await upsertTS(tutorIshaId, calcId, 5, 700);
    await upsertTS(tutorIshaId, physId, 4, 600);
    
    // Rohan - Chemistry & Biology
    await upsertTS(tutorRohanId, chemId, 4, 700);
    await upsertTS(tutorRohanId, bioId, 3, 550);
    await upsertTS(tutorRohanId, inorgId, 4, 650);
    
    // Neha - Engineering
    await upsertTS(tutorNehaId, engId, 5, 900);
    await upsertTS(tutorNehaId, mechEngId, 5, 950);
    await upsertTS(tutorNehaId, csId, 4, 700);
    
    // Aditya - Business & Economics
    await upsertTS(tutorAdityaId, ecoId, 5, 750);
    await upsertTS(tutorAdityaId, busId, 4, 700);
    await upsertTS(tutorAdityaId, finId, 5, 800);
    
    // Zara - Languages & Literature
    await upsertTS(tutorZaraId, engLitId, 5, 600);
    await upsertTS(tutorZaraId, hinId, 5, 550);
    await upsertTS(tutorZaraId, sanId, 4, 650);
    
    // Vikram - Physics & Engineering
    await upsertTS(tutorVikramId, physId, 4, 650);
    await upsertTS(tutorVikramId, mechId, 4, 700);
    await upsertTS(tutorVikramId, eeId, 3, 750);
    
    // Priya - Biology & Chemistry
    await upsertTS(tutorPriyaId, bioId, 5, 600);
    await upsertTS(tutorPriyaId, microId, 4, 650);
    await upsertTS(tutorPriyaId, physChemId, 4, 700);
    
    // Arjun - Advanced CS & Math
    await upsertTS(tutorArjunId, dsId, 5, 900);
    await upsertTS(tutorArjunId, dbId, 5, 850);
    await upsertTS(tutorArjunId, linearId, 5, 800);
    
    // Kavya - Web Development & Marketing
    await upsertTS(tutorKavyaId, webId, 3, 600);
    await upsertTS(tutorKavyaId, mktId, 4, 550);
    await upsertTS(tutorKavyaId, csId, 3, 650);

    // Availability for all tutors
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
    await addAvail(tutorAdityaId, [1,2,4,6]);
    await addAvail(tutorZaraId, [2,3,5]);
    await addAvail(tutorVikramId, [1,3,4]);
    await addAvail(tutorPriyaId, [2,4,5,6]);
    await addAvail(tutorArjunId, [1,2,3,4,5]);
    await addAvail(tutorKavyaId, [3,4,6]);

    // TA endorsements (expanded with more Indian professors)
    const endorse = (tutorId, subjectId, taName, taEmail, text) => query(
      `INSERT INTO ta_endorsements (tutor_id, subject_id, ta_name, ta_email, endorsement_text, is_verified, semester, year)
       VALUES ($1,$2,$3,$4,$5,TRUE,'Fall',2024) ON CONFLICT DO NOTHING`,
      [tutorId, subjectId, taName, taEmail, text]
    );
    
    await endorse(tutorAaravId, dsId, 'Prof. Meera Krishnan', 'meera.krishnan@univ.in', 'Aarav consistently topped DS assignments and labs.');
    await endorse(tutorIshaId, mathId, 'Dr. Arvind Menon', 'arvind.menon@univ.in', 'Isha is meticulous with proofs; excellent tutor.');
    await endorse(tutorNehaId, engId, 'Prof. Rajesh Kumar', 'rajesh.kumar@univ.in', 'Neha shows exceptional engineering intuition.');
    await endorse(tutorAdityaId, ecoId, 'Dr. Sunita Patel', 'sunita.patel@univ.in', 'Aditya has deep understanding of economic principles.');
    await endorse(tutorZaraId, hinId, 'Prof. Amitabh Singh', 'amitabh.singh@univ.in', 'Zara\'s command over Hindi literature is outstanding.');
    await endorse(tutorArjunId, dbId, 'Dr. Kavita Sharma', 'kavita.sharma@univ.in', 'Arjun excels in database design and optimization.');

    // Sessions and reviews with expanded Indian context
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

    // Create more diverse sessions across all tutors
    // Aarav sessions
    const s1 = await createSession(studentAnanyaId, tutorAaravId, dsId, -10, '16:00', 1.5, 'virtual', 'completed', 1200);
    await review(s1, studentAnanyaId, tutorAaravId, 5, 'Great explanation of recursion and trees. Bohot helpful!');
    await createSession(studentVikramId, tutorAaravId, csId, 2, '11:00', 2.0, 'in-person', 'confirmed', 1500);
    await createSession(studentAishaId, tutorAaravId, algoId, 5, '14:00', 1.0, 'virtual', 'confirmed', 850);

    // Isha sessions
    const s3 = await createSession(studentPriyaId, tutorIshaId, mathId, -5, '10:30', 1.0, 'virtual', 'completed', 650);
    await review(s3, studentPriyaId, tutorIshaId, 5, 'Explained integrals with simple desi examples. Shukriya!');
    await createSession(studentKunalId, tutorIshaId, mathId, 3, '15:00', 1.5, 'in-person', 'confirmed', 975);
    await createSession(studentRahulId, tutorIshaId, calcId, 7, '09:00', 2.0, 'virtual', 'confirmed', 1400);

    // Rohan sessions
    const s5 = await createSession(studentVikramId, tutorRohanId, chemId, -2, '14:00', 1.0, 'virtual', 'completed', 700);
    await review(s5, studentVikramId, tutorRohanId, 4, 'Good session, organic mechanisms were clearer.');
    await createSession(studentMeeraId, tutorRohanId, bioId, 4, '16:00', 1.5, 'in-person', 'confirmed', 825);

    // Neha sessions
    await createSession(studentAnanyaId, tutorNehaId, engId, 4, '13:00', 2.0, 'in-person', 'confirmed', 1800);
    await createSession(studentDevId, tutorNehaId, mechEngId, 6, '10:00', 1.0, 'virtual', 'confirmed', 950);

    // Aditya sessions
    const s8 = await createSession(studentTanviId, tutorAdityaId, ecoId, -3, '11:00', 1.5, 'virtual', 'completed', 1125);
    await review(s8, studentTanviId, tutorAdityaId, 5, 'Perfect explanation of supply and demand curves!');
    await createSession(studentArnavId, tutorAdityaId, finId, 8, '15:00', 2.0, 'in-person', 'confirmed', 1600);

    // Zara sessions
    const s10 = await createSession(studentAishaId, tutorZaraId, engLitId, -1, '14:00', 1.0, 'virtual', 'completed', 600);
    await review(s10, studentAishaId, tutorZaraId, 5, 'Beautiful analysis of Shakespeare\'s sonnets!');
    await createSession(studentMeeraId, tutorZaraId, hinId, 9, '16:00', 1.5, 'virtual', 'confirmed', 825);

    // Vikram sessions
    await createSession(studentKunalId, tutorVikramId, physId, 5, '13:00', 1.0, 'in-person', 'confirmed', 650);

    // Priya sessions
    const s13 = await createSession(studentDevId, tutorPriyaId, bioId, -4, '10:00', 1.5, 'virtual', 'completed', 900);
    await review(s13, studentDevId, tutorPriyaId, 4, 'Great explanation of cell biology concepts.');

    // Arjun sessions
    await createSession(studentRahulId, tutorArjunId, dbId, 10, '14:00', 2.0, 'virtual', 'confirmed', 1700);

    // Kavya sessions
    await createSession(studentTanviId, tutorKavyaId, webId, 6, '11:00', 1.0, 'virtual', 'confirmed', 600);

    // Add tutor documents for proof of degrees/certificates
    const addDocument = async (tutorId, docType, title, url) => {
      await query(
        `INSERT INTO tutor_documents (tutor_id, doc_type, title, url, verified, created_at)
         VALUES ($1,$2,$3,$4,TRUE,CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [tutorId, docType, title, url]
      );
    };

    // Documents for existing tutors
    await addDocument(tutorAaravId, 'Degree', 'B.Tech Computer Science - IIT Delhi', 'https://example.com/aarav-btech.pdf');
    await addDocument(tutorAaravId, 'Certificate', 'Google Cloud Professional Developer', 'https://example.com/aarav-gcp.pdf');
    
    await addDocument(tutorIshaId, 'Degree', 'M.Sc Mathematics - DU Delhi', 'https://example.com/isha-msc.pdf');
    await addDocument(tutorIshaId, 'Certificate', 'Advanced Calculus Teaching', 'https://example.com/isha-calc.pdf');
    
    await addDocument(tutorRohanId, 'Degree', 'B.Sc Chemistry - BHU Varanasi', 'https://example.com/rohan-bsc.pdf');
    await addDocument(tutorRohanId, 'Certificate', 'Organic Chemistry Lab Safety', 'https://example.com/rohan-safety.pdf');
    
    await addDocument(tutorNehaId, 'Degree', 'B.Tech Mechanical - NIT Surat', 'https://example.com/neha-btech.pdf');
    await addDocument(tutorNehaId, 'Certificate', 'AutoCAD Professional', 'https://example.com/neha-autocad.pdf');

    // Documents for new tutors
    await addDocument(tutorAdityaId, 'Degree', 'MBA Finance - IIM Ahmedabad', 'https://example.com/aditya-mba.pdf');
    await addDocument(tutorAdityaId, 'Certificate', 'Chartered Financial Analyst (CFA)', 'https://example.com/aditya-cfa.pdf');
    
    await addDocument(tutorZaraId, 'Degree', 'M.A English Literature - JNU Delhi', 'https://example.com/zara-ma.pdf');
    await addDocument(tutorZaraId, 'Certificate', 'Hindi Language Proficiency', 'https://example.com/zara-hindi.pdf');
    await addDocument(tutorZaraId, 'Certificate', 'Sanskrit Studies - BHU', 'https://example.com/zara-sanskrit.pdf');
    
    await addDocument(tutorVikramId, 'Degree', 'B.Tech Electrical - VIT Vellore', 'https://example.com/vikram-btech.pdf');
    await addDocument(tutorVikramId, 'Certificate', 'Physics Teaching Excellence', 'https://example.com/vikram-physics.pdf');
    
    await addDocument(tutorPriyaId, 'Degree', 'M.Sc Microbiology - IISc Bangalore', 'https://example.com/priya-msc.pdf');
    await addDocument(tutorPriyaId, 'Certificate', 'Molecular Biology Techniques', 'https://example.com/priya-molecular.pdf');
    
    await addDocument(tutorArjunId, 'Degree', 'Ph.D Computer Science - IIT Bombay', 'https://example.com/arjun-phd.pdf');
    await addDocument(tutorArjunId, 'Certificate', 'Database Architecture Specialist', 'https://example.com/arjun-db.pdf');
    
    await addDocument(tutorKavyaId, 'Degree', 'B.Tech IT - Anna University', 'https://example.com/kavya-btech.pdf');
    await addDocument(tutorKavyaId, 'Certificate', 'Digital Marketing Professional', 'https://example.com/kavya-marketing.pdf');

    console.log('Enhanced demo data seeded with diverse Indian tutors, students, and subjects!');
  } finally {
    await pool.end();
  }
}

seed();
 

