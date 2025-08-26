# Implementation Plan

- [x] 1. Set up project foundation and core infrastructure
  - Initialize React project with TypeScript, Tailwind CSS, and shadcn/ui components
  - Set up separate Node.js/Express backend with TypeScript
  - Configure Prisma ORM with PostgreSQL database schema
  - Set up environment configuration and basic project structure for both frontend and backend
  - _Requirements: 1.1, 2.1_

- [x] 2. Implement database schema and core data models
  - Create Prisma schema with all required tables (users, students, recruiters, jobs, likes, matches, slots, interviews, reports, exposures)
  - Write database migration files and seed data for testing
  - Implement Prisma client configuration and connection handling
  - _Requirements: 1.1, 2.1, 5.1, 6.1, 7.1_

- [x] 3. Build authentication system with email OTP
  - Create OTP generation and verification utilities in Express backend
  - Implement JWT token creation and validation middleware
  - Build auth API endpoints (/auth/otp/request, /auth/otp/verify) in Express
  - Create authentication context and hooks for React frontend
  - _Requirements: 1.1, 2.1_

- [x] 4. Create user profile management system
  - Build student profile creation API endpoints in Express with skills array and optional video URL
  - Build recruiter profile creation API endpoints in Express with organization details
  - Implement profile validation and sanitization in backend
  - Create profile management React components with form validation using React Hook Form
  - _Requirements: 1.2, 1.3, 1.4, 2.2, 2.3, 2.4_

- [x] 5. Implement job posting system
  - Create job creation API endpoints in Express with skills matching and batch filtering
  - Build job management React interface for recruiters
  - Implement job validation and storage with optional video URLs in backend
  - Create job card React component for display in feeds
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 6. Build intelligent ranking and scoring system
  - Implement Jaccard similarity function for skill matching in backend utilities
  - Create TF-IDF text matching utility with vocabulary management in Node.js
  - Build scoring algorithm combining skills, text, eligibility, and freshness in Express services
  - Implement hard filters for role eligibility and seen content in database queries
  - _Requirements: 3.3, 4.3, 14.3, 14.5_

- [ ] 7. Create feed generation system with diversity controls
  - Build job feed API endpoint in Express with ranking, filtering, and pagination
  - Build student feed API endpoint in Express with same ranking logic
  - Implement diversity controls (company spread, new profile boost, exploration) in backend
  - Create exposure tracking system in database to prevent duplicate shows
  - _Requirements: 3.1, 3.4, 3.7, 3.8, 4.1, 4.4, 4.7, 4.8, 14.1, 14.4_

- [ ] 8. Implement like/dislike system with rate limiting
  - Create like API endpoint in Express with idempotency and rate limiting
  - Implement daily like limit enforcement (30 likes per day) in backend middleware
  - Build like tracking and cooldown system (7-day hide after dislike) in database
  - Create like button React component with remaining count display
  - _Requirements: 3.5, 3.6, 4.5, 4.6, 9.1, 9.2, 9.4_

- [ ] 9. Build mutual matching system
  - Implement mutual like detection and match creation logic in Express backend
  - Create match API endpoints in Express for listing and retrieving match details
  - Build atomic match creation using database transactions to prevent duplicate matches
  - Implement match notification system in React frontend
  - _Requirements: 5.1, 5.2_

- [ ] 10. Create video access control system
  - Implement video URL storage and signed URL generation in Express backend
  - Build video access control middleware in Express (only for matched users)
  - Create video modal React component that only shows after mutual match
  - Implement video upload validation (60 seconds, 20MB limit) in backend
  - _Requirements: 1.3, 2.3, 5.3, 5.4_

- [ ] 11. Build interview slot management system
  - Create slot creation API endpoints in Express for recruiters with time validation
  - Implement slot listing API in Express filtered by job and availability
  - Build slot management React UI for recruiters to create time windows
  - Create slot display React component showing available times to matched students
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 12. Implement atomic slot booking system
  - Create booking API endpoint in Express with atomic transaction to prevent double booking
  - Implement slot availability checking and booking status updates in backend
  - Build booking confirmation React UI with success/error handling
  - Create interview record creation with meeting URL generation in Express
  - _Requirements: 7.1, 7.2, 6.3_

- [ ] 13. Build calendar integration with ICS generation
  - Implement ICS file generation using ics library in Express backend
  - Create calendar event with title, time, description, and meeting URL in backend
  - Build ICS download endpoint in Express with proper MIME type headers
  - Create calendar integration React UI with download button and meeting link display
  - _Requirements: 7.3, 8.1, 8.2, 8.3, 8.4_

- [ ] 14. Implement Jitsi Meet integration
  - Create meeting URL generation using match ID as room identifier in Express backend
  - Implement meeting link display in booking confirmation React component
  - Build meeting access validation and room management in backend
  - Create meeting join React UI component with proper link handling
  - _Requirements: 7.4, 8.4_

- [ ] 15. Build content reporting system
  - Create report API endpoint in Express for flagging inappropriate content
  - Implement report storage and content hiding for reporter in backend
  - Build report modal React UI with reason selection
  - Create basic admin React interface for reviewing reports (stretch goal)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 16. Implement comprehensive rate limiting
  - Create rate limiting middleware in Express for API endpoints (60 requests/minute/IP)
  - Implement user-specific rate limits for likes and other actions in backend
  - Build rate limit tracking using Redis or in-memory store in Node.js
  - Create rate limit exceeded error handling and user messaging in React frontend
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 17. Build analytics and tracking system
  - Implement event tracking for impressions, likes, matches, and bookings in Express backend
  - Create analytics API endpoints in Express for basic metrics
  - Build time-to-booking calculation and funnel analysis in backend services
  - Create simple analytics React dashboard for demo purposes
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 18. Create match explanation system
  - Implement "Why you're seeing this" logic with skill overlap detection in Express backend
  - Build explanation display React component showing common skills and batch matching
  - Create fallback explanations for exploration mode recommendations in backend
  - Implement explanation API endpoint in Express returning match reasoning
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 19. Implement comprehensive error handling
  - Create global error boundary React component for frontend application
  - Implement API error handling middleware in Express with structured responses
  - Build user-friendly error messages and retry mechanisms in React
  - Create error logging and monitoring integration in both frontend and backend
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 20. Build responsive UI components and layouts
  - Create responsive React card components for jobs and students
  - Implement swipe/like interface with touch and click support in React
  - Build match detail React view with video player and slot booking
  - Create mobile-friendly navigation and layout React components
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 5.3_

- [ ] 21. Implement comprehensive testing suite
  - Write unit tests for ranking algorithms and utility functions in Node.js backend
  - Create integration tests for Express API endpoints and database operations
  - Build end-to-end tests for complete user flows (signup → match → booking) using Playwright
  - Implement test data seeding and cleanup utilities for both frontend and backend
  - _Requirements: 11.4, 12.1, 12.2_

- [ ] 22. Add performance optimizations and caching
  - Implement database query optimization with proper indexes in PostgreSQL
  - Create caching layer in Express backend for frequently accessed data (user profiles, job listings)
  - Build pagination for feed endpoints with efficient offset handling in Express APIs
  - Implement lazy loading for video content and large lists in React components
  - _Requirements: 12.1, 14.5_

- [ ] 23. Create demo data and onboarding flow
  - Build comprehensive seed data with realistic students, recruiters, and jobs in database
  - Create guided onboarding flow for new users in React frontend
  - Implement demo mode with pre-populated matches and bookings in backend
  - Build success metrics tracking for demo evaluation in analytics system
  - _Requirements: 11.4_

- [ ] 24. Final integration and deployment preparation
  - Integrate all React frontend and Express backend components and test complete user workflows
  - Implement environment-specific configuration (development, production) for both frontend and backend
  - Create deployment scripts and Docker configuration for React app and Node.js backend
  - Build monitoring and logging integration for production readiness across the full stack
  - _Requirements: 12.1, 12.2, 12.3, 12.4_