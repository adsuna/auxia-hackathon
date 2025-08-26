# PRD — SwipeHire Campus (Mutual‑Match Micro‑Interview Scheduler)

**Doc owner:** Ishan (PM/Tech)  
**Contributors:** Hackathon team  
**Date:** 26 Aug 2025  
**Status:** Draft → MVP build  
**Revision:** v1.0

---

## 0) TL;DR
A campus‑verified, mutual‑opt‑in matching tool where **students** and **recruiters** discover each other via **text‑first profiles** (skills + tags + short summary). After a **mutual text match**, an **optional 60‑second video** (if provided) unlocks for both sides (**Stage‑2**). When both sides opt in, the app offers **instant scheduling from recruiter‑published slot pools**, generating an **ICS** calendar invite and a **meeting link**. Built for a hackathon MVP using **React** on the frontend, thin **Node/Express** backend (or Supabase functions), and **Postgres/Supabase** for data + storage.

---

## 1) Problem Statement
Campus recruitment discovery is slow and text‑heavy. Students wade through JDs, recruiters wade through resumes, and scheduling is email ping‑pong. The result: **low‑quality first conversations** and **calendar chaos**.

**Opportunity:** Compress discovery → intent → scheduling into minutes, not days, while minimizing bias and spam.

---

## 2) Goals & Non‑Goals
**Goals (MVP)**
1. Rapid discovery with mutual consent (like/dislike) on **text‑first** profile/job cards.
2. **Optional 60‑second video** that becomes visible **only after a mutual text‑match**.
3. Instant interview scheduling from **recruiter slot pools** with **ICS** export and a **meeting URL**.
4. Simple, reliable auth and campus‑safe verification.
5. Judge‑ready demo with seeded data and clean UX.

**Non‑Goals (MVP)** (MVP)** (MVP)**
- Complex ATS integrations, OCR of resumes, offer management.
- Automatic video transcription, heavy ML ranking.
- Full placement‑cell workflows/approvals (light toggle/gates only).

**Success Metrics (MVP demo)**
- Time from student like → scheduled interview: **< 3 minutes**.
- At least **1 complete mock match flow** in the demo path.
- **>80%** task success in guerrilla tests (5 users).

---

## 3) Personas
**Student (Sejal)** — Final‑year CSE; wants quick way to surface her relevant projects, avoid form spam, get real conversations fast.

**Recruiter (Arun)** — Startup hiring SWE interns; wants to quickly shortlist students with matching skills and secure interview slots without email churn.

**Placement Staff (Optional, MVP‑lite)** — Wants basic verification gates (domain whitelist, year/branch filters) and an audit trail.

---

## 4) Scope
**In‑Scope (MVP)**
- Roles: Student, Recruiter. (Admin: basic toggles only if time.)
- Profiles: skill chips, headline, branch/year (student); JD core fields (recruiter).
- **Text‑first discovery**: cards show summary + skill chips; **optional 60‑sec video** is stored but **only shown inside the match thread**.
- Likes/Dislikes → Matches.
- Slot pools; booking; ICS invite; static meeting URL.
- Basic rate limits; seed data; minimal analytics.

**Out‑of‑Scope (MVP)****
- Multi‑round interviews, assessments, offers.
- Complex moderation pipeline.
- Mobile apps (PWA responsiveness only).

**Assumptions**
- Campus Wi‑Fi is adequate for 60‑sec video (optional, URL paste allowed).
- Email OTP is sufficient for MVP verification. (Campus domain gating is stretch.)

---

## 5) User Stories & Acceptance Criteria

### 5.1 Authentication & Roles
- *As a student*, I can sign up with email OTP so that I can create a profile.  
**AC:** OTP flow works; account stored with `role='student'`.
- *As a recruiter*, I can sign up and create a job card.  
**AC:** Account stored with `role='recruiter'`; can create a JD.

### 5.2 Profiles & Job Cards
- *As a student*, I can add name, branch, year, skills (5–8), one project link, optional resume URL, and **optionally attach a 60‑second video**.  
**AC:** If video is provided (mp4/h264 ≤ 20MB or external URL), it is stored and **hidden until a mutual match**.
- *As a recruiter*, I can create a job with title, required skills, location, CTC range, batch/year, and **optionally attach a 60‑second JD video**.  
**AC:** JD appears in student feed after save; video remains hidden until mutual match.

### 5.3 Discovery & Matching
- *As a student*, I can browse **text‑first job cards** and like/dislike; the recruiter is not notified unless they also like me.  
**AC:** Like stored; reciprocal like → `match` created.
- *As a recruiter*, I can browse **text‑first student cards** similarly.  
**AC:** Same as above.
- *Stage‑2 (optional video):* On mutual match, any provided videos become viewable by both sides in the match thread.  
**AC:** Videos are inaccessible pre‑match.
- *Rate limit:* Each user can attempt at most **30 likes/day**.  
**AC:** Server enforces limit; UX shows remaining likes.

### 5.4 Scheduling
- *As a recruiter*, I can create a pool of interview slots (start/end times).  
**AC:** Slots saved; visible to matched students.
- *As a student*, I can book an available slot from a match thread.  
**AC:** Slot status becomes `booked`; ICS file downloads; meet URL visible.
- *ICS:* When booked, both sides receive an event file containing title, time, description, and join URL.  
**AC:** `.ics` file opens in common calendars (Google, Apple, Outlook).

### 5.5 Safety & Quality
- *As a user*, I can report a profile or job.  
**AC:** Report stored; flagged entity hidden for reporter; admin view lists reports (stretch).
- *As a system*, I prevent spam via like limits and block duplicate rapid likes.  
**AC:** Server returns 429 on abuse; client shows message.

---

## 6) Functional Requirements

### 6.1 Data Model (Conceptual)
- **users**(id, email, role{student|recruiter|admin}, created_at, verified_at)
- **students**(user_id PK/FK, name, branch, year, headline, skills text[], project_url, resume_url)
- **recruiters**(user_id PK/FK, name, org, title)
- **jobs**(id, recruiter_id FK, title, description, skills text[], batch, location, ctc_min, ctc_max, video_url, created_at)
- **videos**(id, owner_type{student|job}, owner_id, url, duration_s)
- **likes**(id, from_user, to_type{job|student}, to_id, stage int default 1, created_at)
- **matches**(id, student_id, job_id, created_at)
- **slots**(id, job_id, start_ts, end_ts, is_booked boolean)
- **interviews**(id, match_id, slot_id, meet_url, ics_path, status{booked|done|no_show})
- **reports**(id, reporter_user_id, entity_type{user|job}, entity_id, reason, created_at)

### 6.2 API (MVP)
**Auth**  
- `POST /auth/otp/request` { email } → { ok }  
- `POST /auth/otp/verify` { email, code } → { jwt, profileNeeded }

**Profile**  
- `GET /me` → { user, role, profile }  
- `POST /students` → create/update student  
- `POST /recruiters` → create/update recruiter  
- `POST /jobs` → create job  
- `GET /jobs/feed` (student) → list job cards (paginated)  
- `GET /students/feed` (recruiter) → list student cards

**Match**  
- `POST /like` { toType, toId } → { matched: bool, matchId? }  
- `GET /matches` → array of matches with minimal counterpart info  
- `GET /matches/:id` → details + available slots

**Scheduling**  
- `POST /slots` { jobId, startTs, endTs } → { slot }  
- `POST /book` { matchId, slotId } → { meetUrl, icsDownloadUrl }

**Safety**  
- `POST /report` { entityType, entityId, reason } → { ok }

**Rate limits**  
- 30 likes/day/user; 60 requests/minute/IP.

### 6.3 Matching Logic (Baseline)
```
score = 0.5 * jaccard(student.skills, job.skills)
      + 0.3 * role_keywords_match(student.headline, job.title)
      + 0.2 * eligibility_fit(student.year, job.batch)
// Stage‑1 feed sorts by score; users can like any card regardless of score.
```
**Discovery is text‑first**: feed shows summary + skill chips; **videos (if any) unlock only after a mutual match**.

### 6.4 Scheduling & ICS
- Recruiter seeds slots per job (10–30 min each).  
- Student selects one available slot → `is_booked=true`; create interview with `meet_url = https://meet.jit.si/<matchId>` (or configurable URL).  
- Server generates `.ics` using `ics` library; include title: `Interview – <job.title>`, description with join URL; timezone: local.

### 6.5 Content Rules
- **Video optional:** max 60s, ≤20MB if uploaded; allowed: MP4 (H.264/AAC). Alternatively, paste an external URL (Loom/Drive/YouTube unlisted).  
- **Visibility:** videos (if attached) are **only visible within the match thread**, not in the public feed.  
- **Reports:** Reported content hidden from reporter and queued for admin review (stretch: basic admin view).  
- **Accessibility (soft):** optional caption/summary text field.

---

## 7) Non‑Functional Requirements
**Performance**  
- P95 API latency < 400 ms for feed/like/book on seeded dataset.  
- Video served via storage CDN where possible.

**Reliability**  
- At‑least‑once creation for likes (idempotency key on client).  
- Atomic booking: single transaction sets `is_booked=true` and creates interview.

**Security & Privacy**  
- JWT auth; row‑level security (if Supabase).  
- Store only necessary PII; no face/video analysis.  
- Videos private; URLs signed (time‑limited) if using storage.  
- Basic abuse controls (rate limits, reports).  
- Consent: users acknowledge that shared content is visible to matched counterpart.

**Accessibility**  
- Keyboard‑navigable cards; captioning encouraged for videos (text field for summary).

**Compatibility**  
- Responsive web; Chrome/Edge/Safari latest.

---

## 8) System Architecture
**Frontend (React/Next.js + Tailwind + shadcn/ui)**
- Pages: Onboarding, Student Profile (optional video field), Recruiter Job Creator (optional video), Feed (student), Feed (recruiter), Matches, Match Detail (slot booking), Admin (stretch)
- Components: Card (text‑first), SkillChips, LikeBar, **MatchVideoModal** (video only in match), SlotList, ICSButton

**Backend (Option A: Node/Express)**
- REST handlers as per API; `ics` package for calendar; Prisma for DB (Postgres).  
- Video handling: optional store of URLs/files; since not in feed, no heavy lazy‑loading concerns.

**Backend (Option B: Supabase Edge Functions)**
- Implement `/like`, `/book`, `/slots`, `/report`; enforce RLS.

**Database**  
- Postgres (Supabase).  
**Storage**  
- Supabase Storage/S3 for videos (optional); signed URLs when accessed from match page.

**3rd‑Party**  
- Jitsi Meet for meeting links (no OAuth).  
- `ics` npm for calendar files.

---

## 9) Data Design (DDL Sketch)
```sql
-- users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text check (role in ('student','recruiter','admin')) not null,
  created_at timestamptz default now(),
  verified_at timestamptz
);

-- students
create table students (
  user_id uuid primary key references users(id) on delete cascade,
  name text not null,
  branch text,
  year int,
  headline text,
  skills text[],
  project_url text,
  resume_url text
);

-- recruiters
create table recruiters (
  user_id uuid primary key references users(id) on delete cascade,
  name text not null,
  org text,
  title text
);

-- jobs
create table jobs (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid references users(id) on delete set null,
  title text not null,
  description text,
  skills text[],
  batch int,
  location text,
  ctc_min int,
  ctc_max int,
  video_url text,
  created_at timestamptz default now()
);

-- likes
create table likes (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references users(id) on delete cascade,
  to_type text check (to_type in ('job','student')) not null,
  to_id uuid not null,
  stage int default 1,
  created_at timestamptz default now(),
  unique (from_user, to_type, to_id)
);

-- matches
create table matches (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references users(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  created_at timestamptz default now(),
  unique (student_id, job_id)
);

-- slots
create table slots (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  start_ts timestamptz not null,
  end_ts timestamptz not null,
  is_booked boolean default false
);

-- interviews
create table interviews (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  slot_id uuid references slots(id) on delete cascade,
  meet_url text,
  ics_path text,
  status text check (status in ('booked','done','no_show')) default 'booked'
);

-- reports
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references users(id) on delete cascade,
  entity_type text check (entity_type in ('user','job')),
  entity_id uuid,
  reason text,
  created_at timestamptz default now()
);
```

---

## 10) UX Flows (Narrative)
**Onboarding** → Choose role → Email OTP → Create Profile (skills chips) → Land on Feed.  
**Student Feed** → See job card (title, skills, short desc) → Like/Dislike → On mutual like: match thread opens with video and slot list.  
**Recruiter Feed** → See student card (name, branch/year, skills, project link) → Like/Dislike → On mutual like: match thread with student video and booking.

**Booking** → Student picks slot → Confirmation screen with meet URL + “Add to Calendar” (downloads ICS).

---

## 11) Implementation Plan (Hackathon‑Ready)
**T0–T0:30** Setup  
- Repo, Next.js + Tailwind + shadcn; Supabase project; env wiring.

**T0:30–T1:30** Auth + DB  
- Email OTP auth; run DDL; seed demo users, students, jobs, slots.

**T1:30–T2:30** Feeds + Like/Match  
- Text‑first cards; `POST /like`; reciprocal like → insert `match`.

**T2:30–T3:15** Slots + Booking + ICS  
- Recruiter slots CRUD; match detail view; `POST /book` → ICS generation + Jitsi URL.

**T3:15–T3:45** Optional Video Attachments  
- Add video URL/upload fields to profile/JD; hide until match; show in match thread.

**T3:45–T5:00** Rate Limits + Reports + Polish  
- 30 likes/day; basic `/report`; empty states; success toasts; demo path.

---

## 12) QA Plan
**Critical Test Cases**
1. Like/Match: A likes B; B likes A → single `match` row created; idempotent on retries.  
2. Double Booking Prevention: Two students attempt same slot → one success; other gets error.  
3. ICS Validity: Calendar file imports in Google/Apple/Outlook.  
4. **Access Control:** Recruiter cannot view non‑matched student videos; students cannot view JD videos until matched.  
5. Rate Limit: 31st like in a day returns 429.  
6. Optional Video: unsupported MIME or >20MB rejected; if URL pasted, playback works in Chrome/Safari via `<video>` or embedded player.

**Smoke Tests**
- Anonymous cannot access feeds.  
- Seeded users can complete end‑to‑end flow (like → match → book slot → ICS).

---

## 13) Analytics (MVP)
- `feed_impressions`, `likes`, `matches`, `bookings`, `time_to_booking` (ms).  
- Simple dashboard page for demo: counters + funnel.

---

## 14) Risks & Mitigations
- **Bias via video** → Two‑stage flow; video only after mutual text match.  
- **Spam likes** → Daily cap + server rate limits.  
- **Fake recruiters** → For demo, whitelisted seed accounts; post‑MVP, domain verification or placement‑cell approval.  
- **Video bloat** → Prefer URL paste; compress later.  
- **No‑shows** → Auto‑release option (stretch); reminder emails (post‑MVP).

---

## 15) Roadmap (Post‑MVP)
- Campus domain verification + placement‑cell admin tools.  
- Basic transcript search (Whisper) and skill extraction.  
- Multi‑round interviews & evaluations; feedback forms.  
- Event reminders via email/SMS.  
- Bias audit logs and optional blurred video intro.

---

## 16) Demo Script (3 minutes)
1. Recruiter logs in → creates JD with 3 slots.  
2. Student logs in → likes JD; Recruiter likes student → instant match.  
3. Student opens match → books slot → **ICS downloads**; open to show meeting link.  
4. Show match detail with unlocked video and skill overlaps.  
5. Show analytics counters: impressions → likes → matches → bookings.

---

## 17) Open Questions
- Should campus require CGPA/branch eligibility before showing cards? (Toggle later.)  
- Do we need an admin report triage in MVP? (Likely no.)  
- Should slots be per job or per recruiter? (MVP: per job.)

---

## 18) Glossary
- **Slot Pool:** Recruiter‑posted interview availability windows broken into bookable slots.  
- **Stage‑1/Stage‑2:** Text‑first mutual match; then video unlocked inside match.

