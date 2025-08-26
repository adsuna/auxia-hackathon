# SwipeHire Campus

A mutual-match micro-interview scheduler that enables students and recruiters to discover each other through text-first profiles, unlock optional videos after mutual matches, and instantly schedule interviews.

## Features

- 🎯 **Text-First Matching**: Discover opportunities based on skills and qualifications without bias
- 🤝 **Mutual Interest**: Videos unlock only after both parties express interest
- ⚡ **Instant Scheduling**: Book interviews directly with calendar integration
- 📊 **Intelligent Ranking**: AI-powered matching based on skills, text similarity, and eligibility
- 🔒 **Privacy-First**: Content hidden until mutual match occurs
- 📅 **Calendar Integration**: Automatic ICS file generation for all calendar apps

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **React Hook Form** for form management
- **Zustand** for state management
- **React Query** for server state

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **JWT** for authentication
- **Rate limiting** for API protection
- **ICS generation** for calendar integration

## Project Structure

```
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utility functions and API client
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swipehire-campus
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your database URL and other settings
   
   # Set up database
   npm run db:migrate
   npm run db:generate
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Copy environment variables
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

### Development

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:3001

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Application will run on http://localhost:3000

### Database Management

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Push schema changes (development)
npm run db:push

# Open Prisma Studio
npm run db:studio
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/swipehire_dev"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /auth/otp/request` - Request OTP for email
- `POST /auth/otp/verify` - Verify OTP and get JWT token

### Profiles
- `GET /me` - Get current user profile
- `POST /students` - Create student profile
- `POST /recruiters` - Create recruiter profile
- `POST /jobs` - Create job posting

### Discovery & Matching
- `GET /jobs/feed` - Get ranked job feed for students
- `GET /students/feed` - Get ranked student feed for recruiters
- `POST /like` - Like a job or student
- `GET /matches` - Get user's matches

### Scheduling
- `POST /slots` - Create interview slots (recruiters)
- `POST /book` - Book an interview slot
- `GET /interviews` - Get scheduled interviews

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.