-- SwipeHire Campus Database Schema
-- PostgreSQL Schema for campus recruitment platform

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS slots CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS exposures CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS recruiter_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('STUDENT', 'RECRUITER', 'ADMIN');
CREATE TYPE entity_type AS ENUM ('JOB', 'STUDENT', 'USER');
CREATE TYPE interview_status AS ENUM ('BOOKED', 'DONE', 'NO_SHOW');

-- Users table (base table)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Student profiles table
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    branch VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1 AND year <= 5),
    headline TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    project_url TEXT,
    resume_url TEXT,
    video_url TEXT
);

-- Create indexes for student_profiles table
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_year ON student_profiles(year);
CREATE INDEX idx_student_profiles_skills ON student_profiles USING GIN (skills);

-- Recruiter profiles table
CREATE TABLE recruiter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    org VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL
);

-- Create indexes for recruiter_profiles table
CREATE INDEX idx_recruiter_profiles_user_id ON recruiter_profiles(user_id);
CREATE INDEX idx_recruiter_profiles_org ON recruiter_profiles(org);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    batch INTEGER,
    location VARCHAR(255) NOT NULL,
    ctc_min INTEGER NOT NULL,
    ctc_max INTEGER NOT NULL,
    video_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (ctc_min >= 0 AND ctc_max >= ctc_min)
);

-- Create indexes for jobs table
CREATE INDEX idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX idx_jobs_batch ON jobs(batch);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_jobs_skills ON jobs USING GIN (skills);
CREATE INDEX idx_jobs_location ON jobs(location);

-- Likes table (for tracking user preferences)
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_type entity_type NOT NULL,
    to_id UUID NOT NULL,
    stage INTEGER DEFAULT 1, -- -1 = dislike, 1 = like, 2 = super like
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate likes
    UNIQUE (from_user, to_type, to_id)
);

-- Create indexes for likes table
CREATE INDEX idx_likes_from_user ON likes(from_user);
CREATE INDEX idx_likes_to_type_id ON likes(to_type, to_id);
CREATE INDEX idx_likes_created_at ON likes(created_at);
CREATE INDEX idx_likes_stage ON likes(stage);

-- Matches table (mutual likes)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate matches
    UNIQUE (student_id, job_id),
    
    -- Foreign key constraint (student_id references user_id in student_profiles)
    CONSTRAINT fk_matches_student 
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for matches table
CREATE INDEX idx_matches_student_id ON matches(student_id);
CREATE INDEX idx_matches_job_id ON matches(job_id);
CREATE INDEX idx_matches_created_at ON matches(created_at);

-- Time slots table (for interview scheduling)
CREATE TABLE slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    start_ts TIMESTAMP NOT NULL,
    end_ts TIMESTAMP NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    
    -- Ensure valid time range
    CHECK (end_ts > start_ts)
);

-- Create indexes for slots table
CREATE INDEX idx_slots_job_id ON slots(job_id);
CREATE INDEX idx_slots_start_ts ON slots(start_ts);
CREATE INDEX idx_slots_is_booked ON slots(is_booked);
CREATE INDEX idx_slots_time_range ON slots(start_ts, end_ts);

-- Interviews table
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    meet_url TEXT NOT NULL,
    ics_path TEXT NOT NULL,
    status interview_status DEFAULT 'BOOKED',
    
    -- Prevent duplicate bookings
    UNIQUE (match_id, slot_id)
);

-- Create indexes for interviews table
CREATE INDEX idx_interviews_match_id ON interviews(match_id);
CREATE INDEX idx_interviews_slot_id ON interviews(slot_id);
CREATE INDEX idx_interviews_status ON interviews(status);

-- Exposures table (for analytics and filtering)
CREATE TABLE exposures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type entity_type NOT NULL,
    entity_id UUID NOT NULL,
    shown_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate exposures per user per entity
    UNIQUE (user_id, entity_type, entity_id)
);

-- Create indexes for exposures table
CREATE INDEX idx_exposures_user_id ON exposures(user_id);
CREATE INDEX idx_exposures_entity_type_id ON exposures(entity_type, entity_id);
CREATE INDEX idx_exposures_shown_at ON exposures(shown_at);

-- Reports table (for content moderation)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type entity_type NOT NULL,
    entity_id UUID NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for reports table
CREATE INDEX idx_reports_reporter_user_id ON reports(reporter_user_id);
CREATE INDEX idx_reports_entity_type_id ON reports(entity_type, entity_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- Create some useful views
CREATE OR REPLACE VIEW student_match_stats AS
SELECT 
    sp.user_id,
    sp.name,
    COUNT(m.id) as total_matches,
    COUNT(i.id) as total_interviews,
    MAX(m.created_at) as latest_match
FROM student_profiles sp
LEFT JOIN matches m ON sp.user_id = m.student_id
LEFT JOIN interviews i ON m.id = i.match_id
GROUP BY sp.user_id, sp.name;

CREATE OR REPLACE VIEW recruiter_job_stats AS
SELECT 
    j.recruiter_id,
    rp.name,
    rp.org,
    COUNT(j.id) as total_jobs,
    COUNT(m.id) as total_matches,
    COUNT(i.id) as total_interviews
FROM recruiter_profiles rp
LEFT JOIN jobs j ON rp.user_id = j.recruiter_id
LEFT JOIN matches m ON j.id = m.job_id
LEFT JOIN interviews i ON m.id = i.match_id
GROUP BY j.recruiter_id, rp.name, rp.org;

-- Insert some sample data (optional)
-- This will be populated by the application

COMMENT ON TABLE users IS 'Base user accounts for students and recruiters';
COMMENT ON TABLE student_profiles IS 'Extended profile information for students';
COMMENT ON TABLE recruiter_profiles IS 'Extended profile information for recruiters';
COMMENT ON TABLE jobs IS 'Job postings created by recruiters';
COMMENT ON TABLE likes IS 'User likes/dislikes on jobs or students';
COMMENT ON TABLE matches IS 'Mutual matches between students and jobs';
COMMENT ON TABLE slots IS 'Available time slots for interviews';
COMMENT ON TABLE interviews IS 'Scheduled interviews between matched pairs';
COMMENT ON TABLE exposures IS 'Track what content was shown to users';
COMMENT ON TABLE reports IS 'User reports for content moderation';