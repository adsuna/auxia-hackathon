import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Award, Users } from 'lucide-react';
import TopicCard from '../components/TopicCard';

const Home = () => {
  const topics = [
    {
      id: 'computer-science',
      name: 'Computer Science',
      description: 'Programming, algorithms, data structures, and software engineering',
      tutorCount: 24,
      rating: 4.8,
      color: 'bg-blue-500'
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      description: 'Calculus, linear algebra, statistics, and discrete math',
      tutorCount: 18,
      rating: 4.7,
      color: 'bg-green-500'
    },
    {
      id: 'physics',
      name: 'Physics',
      description: 'Mechanics, thermodynamics, electromagnetism, and quantum physics',
      tutorCount: 12,
      rating: 4.9,
      color: 'bg-purple-500'
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      description: 'Organic chemistry, biochemistry, physical chemistry, and lab techniques',
      tutorCount: 15,
      rating: 4.6,
      color: 'bg-red-500'
    },
    {
      id: 'biology',
      name: 'Biology',
      description: 'Cell biology, genetics, ecology, and molecular biology',
      tutorCount: 20,
      rating: 4.7,
      color: 'bg-teal-500'
    },
    {
      id: 'engineering',
      name: 'Engineering',
      description: 'Mechanical, electrical, civil, and chemical engineering',
      tutorCount: 22,
      rating: 4.8,
      color: 'bg-orange-500'
    }
  ];

  const stats = [
    { label: 'Verified Tutors', value: '150+', icon: Award },
    { label: 'Subjects Covered', value: '25+', icon: BookOpen },
    { label: 'Students Helped', value: '2,500+', icon: Users },
    { label: 'Average Rating', value: '4.8/5', icon: Star }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Verified Tutors for
            <span className="text-primary-600"> Any Subject</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with peer tutors who have proven skills through grades, TA endorsements, 
            and student ratings. No more guesswork - find the right tutor for your academic needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/browse" className="btn-primary text-lg px-8 py-3">
              Find a Tutor
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white rounded-xl shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Topics Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popular Subjects
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse through our most requested subjects and find tutors with verified expertise
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link to="/browse" className="btn-primary">
            View All Subjects
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Subject</h3>
            <p className="text-gray-600">
              Browse through verified tutors in your specific subject area
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Book a Session</h3>
            <p className="text-gray-600">
              Schedule a tutoring session with your chosen tutor
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Learn & Rate</h3>
            <p className="text-gray-600">
              Attend your session and rate your tutor's performance
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
