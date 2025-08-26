# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## SwipeHire Campus

A mutual-match micro-interview scheduler that enables students and recruiters to discover each other through text-first profiles, unlock optional videos after mutual matches, and instantly schedule interviews.

## Project Architecture

This is a full-stack TypeScript application with two main components:

### Backend (Node.js/Express API)
- **Location**: `./backend/`
- **Stack**: Express.js, TypeScript, Prisma ORM, PostgreSQL
- **Port**: 3001 (development)
- **Authentication**: JWT-based with OTP email verification
- **Database**: PostgreSQL with Prisma ORM for schema management

### Frontend (Next.js React App)
- **Location**: `./frontend/`
- **Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Port**: 3000 (development)
- **State Management**: Zustand for client state, React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library

## Key Development Commands

### Backend Development
```bash
cd backend

# Development server
npm run dev

# Database operations
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Create and apply migrations  
npm run db:push         # Push schema changes (dev only)
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database
npm run db:setup        # Setup database from scratch
npm run db:verify       # Verify database setup

# Build and production
npm run build           # Compile TypeScript
npm start              # Run production server
```

### Frontend Development
```bash
cd frontend

# Development server (with Turbopack)
npm run dev

# Build and production
npm run build          # Build for production
npm start             # Run production server
npm run lint          # Run ESLint
```

## Database Schema

Key entities in the Prisma schema:
- **User**: Base user with email and role (STUDENT/RECRUITER/ADMIN)
- **StudentProfile**: Student details with skills, projects, resume
- **RecruiterProfile**: Recruiter details with organization
- **Job**: Job postings with requirements and CTC range
- **Like**: User likes on jobs/students (supports staged matching)
- **Match**: Mutual matches between students and jobs
- **Slot**: Interview time slots created by recruiters
- **Interview**: Scheduled interviews with calendar integration

## API Architecture

- **Authentication**: `/api/auth/*` - OTP-based email verification
- **Profiles**: `/api/profile/*` - User profile management
- **Base URL**: `http://localhost:3001` (development)
- **CORS**: Configured for frontend at `http://localhost:3000`

## Environment Setup

Both backend and frontend require environment variables:

**Backend (.env)**:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend URL for CORS

**Frontend (.env.local)**:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_URL`: Frontend app URL

## Key Features

- **Text-first matching**: Profiles prioritize skills and qualifications
- **Mutual interest system**: Videos unlock after both parties like
- **Instant scheduling**: Direct calendar integration with ICS files
- **AI-powered ranking**: Skills-based job/candidate matching
- **Privacy-first**: Content hidden until mutual match

## Code Conventions

- **TypeScript**: Strict mode enabled across both frontend and backend
- **Imports**: Use absolute imports with `@/` prefix in frontend
- **Database**: All database operations go through Prisma ORM
- **API Routes**: RESTful design with consistent error handling
- **Components**: React functional components with TypeScript interfaces
- **Styling**: Tailwind CSS with shadcn/ui component variants