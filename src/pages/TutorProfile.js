import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Award, Clock, MapPin, Calendar, MessageCircle, BookOpen, Users, TrendingUp } from 'lucide-react';
import api from '../lib/api';

const TutorProfile = () => {
  const { id } = useParams();
  const [tutor, setTutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const { data } = await api.get(`/tutors/${id}`);
        setTutor(data);
        setReviews(data.reviews || []);
        const docs = await api.get(`/documents/${id}`);
        setDocuments(docs.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [id]);


  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tutor not found</h2>
        <Link to="/browse" className="btn-primary">Browse Other Tutors</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar and Basic Info */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-32 h-32 rounded-full object-cover"
              />
              {tutor.verified && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2">
                  <Award className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{tutor.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-medium">{tutor.rating}</span>
                    <span className="text-gray-500">({tutor.reviewCount} reviews)</span>
                  </div>
                  {tutor.verified && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Award className="h-4 w-4" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">₹{tutor.hourlyRate}</div>
                <div className="text-gray-600">per hour</div>
              </div>
            </div>

            {/* Subjects */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{tutor.totalStudents}</div>
                <div className="text-sm text-gray-600">Students Helped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{tutor.totalHours}</div>
                <div className="text-sm text-gray-600">Hours Tutored</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{tutor.successRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link
                to={`/booking/${tutor.id}`}
                className="btn-primary text-center"
              >
                <Calendar className="h-5 w-5 inline mr-2" />
                Book Session
              </Link>
              <button className="btn-secondary" onClick={() => setMessageOpen(true)}>
                <MessageCircle className="h-5 w-5 inline mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* About */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
          <p className="text-gray-600 mb-4">{tutor.bio}</p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <span className="text-gray-700">{tutor.education}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-primary-600" />
              <span className="text-gray-700">{tutor.experience}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-primary-600" />
              <span className="text-gray-700">{tutor.location}</span>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
          <div className="space-y-2">
            {tutor.availability.map((day, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-gray-700">{day}s</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">Available for immediate booking</span>
            </div>
          </div>
        </div>
      </div>

      {messageOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Message {tutor.name}</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Introduce yourself and share what you need help with"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button className="btn-secondary" onClick={() => setMessageOpen(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={async () => {
                  await api.post('/messages', { recipientId: tutor.id, content: messageText });
                  setMessageText('');
                  setMessageOpen(false);
                }}
                disabled={!messageText.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
=======
      {/* Proof of Skill / Documents */
      }
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Proof of Degree & Certificates</h2>
        {documents.length === 0 ? (
          <p className="text-gray-600">No documents added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((d) => (
              <a key={d.id} href={d.url} target="_blank" rel="noreferrer" className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                <div className="text-sm text-gray-500 mb-1 uppercase">{d.doc_type}</div>
                <div className="font-medium text-gray-900">{d.title}</div>
                <div className="text-xs text-gray-500 mt-1">Added on {d.created_at} {d.verified ? '• Verified' : ''}</div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Reviews</h2>
        
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet</p>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{review.studentName}</div>
                    <div className="text-sm text-gray-500">{review.subject}</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <div className="text-sm text-gray-500 mt-2">{review.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorProfile;
