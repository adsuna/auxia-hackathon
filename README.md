# PeerTutor - Peer Tutoring with Proof-of-Skill

A React-based web application that connects students with verified peer tutors, eliminating the guesswork of finding qualified academic help.

## 🎯 Problem Solved

**"Who can teach me this lab?" is guesswork.**

PeerTutor solves this by providing:
- **Verified badges** via past grades and TA endorsements
- **Proof-of-skill** through academic performance verification
- **Campus credit system** for seamless payment
- **Comprehensive rating system** for quality assurance

## ✨ Key Features

### MVP Features
- **Topic Cards**: Browse subjects with tutor counts and ratings
- **Smart Booking**: Schedule sessions with room links and virtual options
- **Post-Session Rating**: Rate tutors and provide feedback
- **Tutor Leaderboard**: Rank tutors by various metrics
- **Verification System**: TA endorsements and grade verification

### Advanced Features
- **Campus Credit Integration**: Seamless payment system
- **Room Booking**: Automatic room reservation for in-person sessions
- **Virtual Sessions**: Zoom/Google Meet integration
- **Real-time Availability**: Live tutor scheduling
- **Performance Analytics**: Track learning progress

## 🏗️ Architecture

### Frontend
- **React 18** with modern hooks and functional components
- **React Router** for navigation and routing
- **Tailwind CSS** for responsive, modern UI
- **Lucide React** for beautiful, consistent icons
- **Context API** for state management

### Database
- **PostgreSQL** for relational data integrity
- **UUID primary keys** for security
- **Comprehensive indexing** for performance
- **Triggers and functions** for business logic
- **Views** for complex queries

### Key Design Decisions
- **SQL over NoSQL**: Chosen for ACID compliance, complex relationships, and financial transaction integrity
- **Component-based architecture**: Reusable, maintainable code structure
- **Responsive design**: Mobile-first approach for campus accessibility
- **Performance optimization**: Efficient queries and lazy loading

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- PostgreSQL 12+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd peer-tutoring-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb peer_tutoring
   
   # Run the schema
   psql -d peer_tutoring -f database_schema.sql
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 App Structure

### Pages
- **Home** (`/`): Landing page with topic cards and stats
- **Browse Tutors** (`/browse`): Search and filter tutors
- **Tutor Profile** (`/tutor/:id`): Detailed tutor information
- **Booking** (`/booking/:tutorId`): Session scheduling
- **Dashboard** (`/dashboard`): User's sessions and stats
- **Leaderboard** (`/leaderboard`): Top-performing tutors

### Components
- **Navbar**: Navigation and user authentication
- **TopicCard**: Subject browsing cards
- **TutorCard**: Tutor information display
- **AuthContext**: User authentication state management

### Database Tables
- **users**: Students and tutors with academic info
- **subjects**: Available courses and subjects
- **tutor_subjects**: Tutor expertise and pricing
- **ta_endorsements**: Teaching assistant verifications
- **sessions**: Tutoring session bookings
- **session_reviews**: Student ratings and feedback
- **credit_transactions**: Campus credit audit trail
- **room_bookings**: Physical space reservations

## 🔐 Authentication & Security

- **JWT-based authentication** (to be implemented)
- **Password hashing** with bcrypt
- **Role-based access control** (student/tutor/admin)
- **Session management** with secure tokens
- **Input validation** and SQL injection prevention

## 💳 Campus Credit System

- **Earn credits** by tutoring other students
- **Spend credits** on tutoring sessions
- **Automatic deduction** after session completion
- **Transaction history** for transparency
- **Refund system** for cancellations

## 📊 Verification & Trust

### Tutor Verification
- **Grade verification** from academic records
- **TA endorsements** from course assistants
- **Performance metrics** from student ratings
- **Session completion** tracking

### Quality Assurance
- **Post-session ratings** (1-5 stars)
- **Detailed reviews** and feedback
- **Success rate** calculations
- **Student progress** tracking

## 🎨 UI/UX Features

- **Modern, clean design** with Tailwind CSS
- **Responsive layout** for all devices
- **Intuitive navigation** and user flow
- **Accessibility features** for inclusive design
- **Loading states** and error handling
- **Interactive elements** with hover effects

## 🔧 Development

### Available Scripts
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run test suite
- `npm eject`: Eject from Create React App

### Code Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── pages/              # Page components
├── App.js              # Main app component
├── index.js            # Entry point
└── index.css           # Global styles
```

### Styling
- **Tailwind CSS** for utility-first styling
- **Custom CSS classes** for component-specific styles
- **Responsive breakpoints** for mobile-first design
- **Color scheme** with primary and secondary palettes

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Create `.env` file:
```env
REACT_APP_API_URL=your_api_endpoint
REACT_APP_DATABASE_URL=your_database_connection
```

### Hosting Options
- **Vercel**: Easy deployment with Git integration
- **Netlify**: Static site hosting
- **AWS S3**: Scalable cloud hosting
- **Heroku**: Full-stack deployment

## 🔮 Future Enhancements

### Phase 2 Features
- **Real-time chat** between students and tutors
- **Video call integration** for virtual sessions
- **File sharing** for study materials
- **Group tutoring** sessions
- **Advanced analytics** dashboard

### Phase 3 Features
- **AI-powered matching** algorithm
- **Mobile app** (React Native)
- **Integration** with learning management systems
- **Advanced reporting** for institutions
- **Multi-language support**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set
- **PostgreSQL** for the robust database system

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for better education through peer learning**
