# Requirements Document

## Introduction

SwipeHire Campus is a mutual-match micro-interview scheduler that enables students and recruiters to discover each other through text-first profiles, unlock optional videos after mutual matches, and instantly schedule interviews. The system prioritizes reducing bias through a two-stage discovery process while streamlining the campus recruitment workflow from discovery to scheduled interview in under 3 minutes.

## Requirements

### Requirement 1

**User Story:** As a student, I want to create a profile with my skills and information so that recruiters can discover me based on relevant qualifications.

#### Acceptance Criteria

1. WHEN a student signs up THEN the system SHALL require email OTP verification
2. WHEN creating a profile THEN the system SHALL allow students to add name, branch, year, 5-8 skills, one project link, optional resume URL, and optional 60-second video
3. IF a video is provided THEN the system SHALL store it (mp4/h264 ≤20MB or external URL) and keep it hidden until mutual match
4. WHEN profile is saved THEN the system SHALL make the student discoverable in recruiter feeds

### Requirement 2

**User Story:** As a recruiter, I want to create job postings with requirements so that I can attract relevant student candidates.

#### Acceptance Criteria

1. WHEN a recruiter signs up THEN the system SHALL require email OTP verification and role assignment
2. WHEN creating a job posting THEN the system SHALL allow title, required skills, location, CTC range, batch/year, and optional 60-second video
3. IF a video is provided THEN the system SHALL store it and keep it hidden until mutual match
4. WHEN job is saved THEN the system SHALL make it appear in student feeds

### Requirement 3

**User Story:** As a student, I want to browse job opportunities in a text-first format with intelligent ranking so that I can make decisions without bias from videos or photos.

#### Acceptance Criteria

1. WHEN viewing job feed THEN the system SHALL display job cards with title, skills, and short description only
2. WHEN browsing THEN the system SHALL NOT show any videos or recruiter photos
3. WHEN ranking jobs THEN the system SHALL use scoring algorithm: 0.55 * Jaccard(student_skills, job_skills) + 0.20 * TextMatch(headline+projects, title+description) + 0.15 * EligibilityFit(year↔batch) + 0.10 * FreshnessBoost(job.created_at)
4. WHEN displaying feed THEN the system SHALL include 20% exploration (random unseen eligible jobs) to avoid filter bubbles
5. WHEN a student likes a job THEN the system SHALL store the like without notifying the recruiter
6. WHEN daily limit is reached THEN the system SHALL prevent further likes and show remaining count
7. WHEN showing jobs THEN the system SHALL cap to maximum 3 cards per company per page
8. WHEN a profile has fewer than 20 impressions THEN the system SHALL add +0.05 bonus score
9. WHEN a job is disliked THEN the system SHALL not re-show it for 7 days

### Requirement 4

**User Story:** As a recruiter, I want to browse student profiles in a text-first format with intelligent ranking so that I can evaluate candidates based on skills and qualifications.

#### Acceptance Criteria

1. WHEN viewing student feed THEN the system SHALL display student cards with name, branch/year, skills, and project link only
2. WHEN browsing THEN the system SHALL NOT show any videos or photos
3. WHEN ranking students THEN the system SHALL use the same scoring algorithm as job feed but in reverse
4. WHEN displaying feed THEN the system SHALL include 20% exploration to ensure diverse candidate discovery
5. WHEN a recruiter likes a student THEN the system SHALL store the like without notifying the student
6. WHEN daily limit is reached THEN the system SHALL prevent further likes and show remaining count
7. WHEN showing students THEN the system SHALL apply diversity tweaks to prevent bias
8. WHEN a profile has fewer than 20 impressions THEN the system SHALL add visibility boost
9. WHEN a student is disliked THEN the system SHALL not re-show them for 7 days

### Requirement 5

**User Story:** As a user, I want mutual matching to occur only when both parties express interest so that I only engage with genuinely interested counterparts.

#### Acceptance Criteria

1. WHEN both parties like each other THEN the system SHALL create a single match record
2. WHEN a match is created THEN the system SHALL unlock any provided videos for both parties
3. WHEN accessing match details THEN the system SHALL show videos (if any) within the match thread only
4. WHEN no mutual like exists THEN the system SHALL keep all videos hidden

### Requirement 6

**User Story:** As a recruiter, I want to create available interview slots so that matched students can book appointments directly.

#### Acceptance Criteria

1. WHEN creating slots THEN the system SHALL allow recruiters to set start/end times for each job
2. WHEN slots are created THEN the system SHALL make them visible only to matched students
3. WHEN a slot is booked THEN the system SHALL mark it as unavailable to prevent double booking
4. WHEN managing slots THEN the system SHALL allow recruiters to create 10-30 minute time windows

### Requirement 7

**User Story:** As a student, I want to book interview slots instantly so that I can secure meetings without email back-and-forth.

#### Acceptance Criteria

1. WHEN viewing a match THEN the system SHALL display available slots from the recruiter
2. WHEN booking a slot THEN the system SHALL atomically mark it as booked and create an interview record
3. WHEN booking is complete THEN the system SHALL generate an ICS calendar file for download
4. WHEN booking is complete THEN the system SHALL provide a meeting URL (Jitsi Meet)

### Requirement 8

**User Story:** As a user, I want calendar integration so that scheduled interviews appear in my calendar application.

#### Acceptance Criteria

1. WHEN an interview is booked THEN the system SHALL generate a valid ICS file
2. WHEN downloading ICS THEN the file SHALL include title, time, description, and join URL
3. WHEN importing ICS THEN the event SHALL open correctly in Google Calendar, Apple Calendar, and Outlook
4. WHEN viewing calendar event THEN the meeting URL SHALL be accessible

### Requirement 9

**User Story:** As a user, I want rate limiting to prevent spam so that the platform maintains quality interactions.

#### Acceptance Criteria

1. WHEN a user attempts likes THEN the system SHALL enforce a maximum of 30 likes per day
2. WHEN rate limit is exceeded THEN the system SHALL return a 429 error and show appropriate message
3. WHEN making API requests THEN the system SHALL limit to 60 requests per minute per IP
4. WHEN displaying UI THEN the system SHALL show remaining likes count

### Requirement 10

**User Story:** As a user, I want to report inappropriate content so that the platform remains safe and professional.

#### Acceptance Criteria

1. WHEN reporting content THEN the system SHALL allow users to report profiles or jobs with a reason
2. WHEN a report is submitted THEN the system SHALL hide the reported entity from the reporter
3. WHEN content is reported THEN the system SHALL store the report for admin review
4. WHEN viewing reported content THEN the system SHALL prevent the reporter from seeing it again

### Requirement 11

**User Story:** As a system administrator, I want basic analytics so that I can monitor platform usage and success metrics.

#### Acceptance Criteria

1. WHEN users interact THEN the system SHALL track feed impressions, likes, matches, and bookings
2. WHEN measuring performance THEN the system SHALL calculate time from like to booking
3. WHEN viewing analytics THEN the system SHALL display counters and conversion funnel
4. WHEN demonstrating success THEN the system SHALL show that 80% of users can complete the flow

### Requirement 12

**User Story:** As a user, I want the system to perform reliably so that my interactions are processed correctly.

#### Acceptance Criteria

1. WHEN making API calls THEN the system SHALL respond with P95 latency under 400ms
2. WHEN creating likes THEN the system SHALL ensure idempotency to prevent duplicates
3. WHEN booking slots THEN the system SHALL use atomic transactions to prevent race conditions
4. WHEN serving videos THEN the system SHALL use signed URLs with time limits for security

### Requirement 13

**User Story:** As a user, I want transparent matching explanations so that I understand why I'm seeing specific recommendations.

#### Acceptance Criteria

1. WHEN viewing a recommended card THEN the system SHALL show "Why you're seeing this" with skill overlaps and batch matching
2. WHEN displaying matches THEN the system SHALL highlight common skills and qualifications
3. WHEN ranking fails to find matches THEN the system SHALL explain the filtering criteria
4. WHEN exploration mode is active THEN the system SHALL indicate "Discovering new opportunities"

### Requirement 14

**User Story:** As a system, I want to track user interactions for ranking optimization so that matching quality improves over time.

#### Acceptance Criteria

1. WHEN users view cards THEN the system SHALL record exposures in exposures table
2. WHEN users interact THEN the system SHALL log features and outcomes (like/match/book)
3. WHEN calculating scores THEN the system SHALL use stored TF-IDF vocabulary for text matching
4. WHEN serving feeds THEN the system SHALL prevent showing already seen/liked/disliked content
5. WHEN building text vectors THEN the system SHALL compute on write, not on every read for performance