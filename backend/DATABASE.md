# Database Setup Guide

This document explains how to set up and manage the SwipeHire Campus database.

## Overview

The application uses PostgreSQL as the primary database with Prisma as the ORM. The database schema includes all necessary tables for the mutual-match micro-interview scheduler functionality.

## Database Schema

### Core Tables

- **users**: Base user accounts with email authentication
- **student_profiles**: Student-specific profile information
- **recruiter_profiles**: Recruiter-specific profile information
- **jobs**: Job postings created by recruiters
- **likes**: User interactions (likes/dislikes)
- **matches**: Mutual matches between students and jobs
- **slots**: Interview time slots created by recruiters
- **interviews**: Booked interview sessions
- **exposures**: Tracking what content users have seen
- **reports**: Content reporting system

### Key Features

- **Referential Integrity**: Proper foreign key constraints with cascade deletes
- **Indexing**: Optimized indexes for common queries (skills, dates, user lookups)
- **Data Types**: Array support for skills, enums for status fields
- **Constraints**: Unique constraints to prevent duplicate likes/matches

## Setup Instructions

### Prerequisites

1. PostgreSQL database server running
2. Node.js and npm installed
3. Environment variables configured in `.env`

### Environment Configuration

Copy `.env.example` to `.env` and update the DATABASE_URL:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/swipehire_dev"
```

### Database Initialization

#### Option 1: Automated Setup (Recommended)

```bash
npm run db:setup
```

This script will:
- Check database connectivity
- Apply migrations
- Generate Prisma client
- Provide next steps

#### Option 2: Manual Setup

```bash
# Generate Prisma client
npm run db:generate

# Apply migrations (when database is running)
npm run db:migrate

# Or push schema directly (for development)
npm run db:push
```

### Seed Data

Populate the database with test data:

```bash
npm run db:seed
```

This creates:
- 5 sample students with different skills and profiles
- 3 sample recruiters from different companies
- 5 sample job postings
- Sample likes, matches, and interview slots
- Test data for exposures and reports

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:push` | Push schema changes (dev only) |
| `npm run db:seed` | Populate with test data |
| `npm run db:reset` | Reset database and apply migrations |
| `npm run db:setup` | Complete database setup |
| `npm run db:studio` | Open Prisma Studio GUI |

## Database Management

### Viewing Data

Use Prisma Studio for a GUI interface:

```bash
npm run db:studio
```

### Making Schema Changes

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name your_change_name`
3. The migration will be applied automatically

### Resetting Database

⚠️ **Warning**: This will delete all data

```bash
npm run db:reset
```

## Production Considerations

### Migrations

In production, use:

```bash
npx prisma migrate deploy
```

Never use `db:push` in production as it can cause data loss.

### Connection Pooling

The Prisma client is configured with connection pooling. For high-traffic applications, consider using PgBouncer or similar.

### Backup Strategy

Implement regular backups:

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Performance Monitoring

Monitor slow queries and consider adding indexes for:
- Frequently filtered columns
- Join conditions
- Order by clauses

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL format
   - Verify network connectivity

2. **Migration Conflicts**
   - Reset migrations: `npm run db:reset`
   - Or resolve conflicts manually

3. **Schema Validation Errors**
   - Check Prisma schema syntax
   - Ensure all relations are properly defined

4. **Seed Data Errors**
   - Clear existing data first
   - Check for constraint violations

### Health Check

The application includes a health check endpoint that verifies database connectivity:

```bash
curl http://localhost:3001/health
```

Expected response includes database status and basic statistics.

## Schema Diagram

```mermaid
erDiagram
    users ||--o| student_profiles : has
    users ||--o| recruiter_profiles : has
    users ||--o{ jobs : creates
    users ||--o{ likes : gives
    users ||--o{ exposures : has
    users ||--o{ reports : makes
    
    student_profiles ||--o{ matches : participates
    jobs ||--o{ matches : participates
    jobs ||--o{ slots : has
    
    matches ||--o{ interviews : schedules
    slots ||--o{ interviews : books
    
    users {
        string id PK
        string email UK
        enum role
        datetime createdAt
        datetime verifiedAt
    }
    
    student_profiles {
        string id PK
        string userId FK
        string name
        string branch
        int year
        string headline
        string[] skills
        string projectUrl
        string resumeUrl
        string videoUrl
    }
    
    jobs {
        string id PK
        string recruiterId FK
        string title
        string description
        string[] skills
        int batch
        string location
        int ctcMin
        int ctcMax
        string videoUrl
        datetime createdAt
    }
    
    matches {
        string id PK
        string studentId FK
        string jobId FK
        datetime createdAt
    }
```

## Support

For database-related issues:
1. Check the health endpoint
2. Review application logs
3. Verify environment configuration
4. Consult this documentation