import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Star, Video, Users, TrendingUp, DollarSign } from 'lucide-react';
import api from '../lib/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [stats, setStats] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);
  const [mySubjects, setMySubjects] = useState([]);
  const [form, setForm] = useState({ subjectId: '', hourlyRate: '', proficiencyLevel: 3, isAvailable: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [upcomingRes, pastRes, meRes] = await Promise.all([
        api.get('/sessions/upcoming'),
        api.get('/sessions/past'),
        api.get('/auth/me')
      ]);
      setUpcomingSessions(upcomingRes.data);
      setPastSessions(pastRes.data);
      setStats({
        totalSessions: pastRes.data.length + upcomingRes.data.length,
        totalHours: pastRes.data.reduce((sum, s) => sum + Number(s.duration || 0), 0),
        averageRating: pastRes.data.reduce((sum, s) => sum + (Number(s.rating || 0)), 0) / (pastRes.data.filter(s => s.rating).length || 1),
        campusCredits: meRes.data.campusCredits || 0,
        upcomingSessions: upcomingRes.data.length
      });
      if (meRes.data.isTutor) {
        const [subsRes, mineRes] = await Promise.all([
          api.get('/tutors/subjects/all'),
          api.get('/tutors/me/subjects')
        ]);
        setAllSubjects(subsRes.data);
        setMySubjects(mineRes.data);
      }
    };
    fetchData();
  }, []);

  const addOrUpdateSubject = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/tutors/me/subjects', {
        subjectId: form.subjectId,
        hourlyRate: Number(form.hourlyRate),
        proficiencyLevel: Number(form.proficiencyLevel),
        isAvailable: form.isAvailable
      });
      const mine = await api.get('/tutors/me/subjects');
      setMySubjects(mine.data);
      setForm({ subjectId: '', hourlyRate: '', proficiencyLevel: 3, isAvailable: true });
    } finally {
      setSaving(false);
    }
  };

  const removeSubject = async (subjectId) => {
    await api.delete(`/tutors/me/subjects/${subjectId}`);
    const mine = await api.get('/tutors/me/subjects');
    setMySubjects(mine.data);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome back, {user?.name}!</h1>
        <p className="text-xl text-gray-600">
          Manage your tutoring sessions and track your progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalSessions}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalHours}</div>
              <div className="text-sm text-gray-600">Hours Learned</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.campusCredits}</div>
              <div className="text-sm text-gray-600">Campus Credits</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutor Setup */}
      {user?.isTutor && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Tutor Setup</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">My Subjects & Rates</h3>
              {mySubjects.length === 0 ? (
                <p className="text-gray-600">No subjects yet. Add one using the form.</p>
              ) : (
                <div className="space-y-3">
                  {mySubjects.map((s) => (
                    <div key={s.subject_id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{s.name}</div>
                        <div className="text-sm text-gray-600">Rate: ₹{s.hourly_rate} • Proficiency: {s.proficiency_level} • {s.is_available ? 'Available' : 'Hidden'}</div>
                      </div>
                      <button onClick={() => removeSubject(s.subject_id)} className="btn-secondary text-sm px-3 py-1">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Add / Update Subject</h3>
              <form onSubmit={addOrUpdateSubject} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                    <option value="">Select subject</option>
                    {allSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                    <input type="number" min="0" step="1" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency (1-5)</label>
                    <input type="number" min="1" max="5" value={form.proficiencyLevel} onChange={e => setForm({ ...form, proficiencyLevel: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                  </div>
                </div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <span className="text-sm text-gray-700">Available for booking</span>
                </label>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Upcoming Sessions</h2>
          <span className="text-sm text-gray-600">{upcomingSessions.length} scheduled</span>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
            <p className="text-gray-600">Book a session to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingSessions.map(session => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={session.tutorAvatar}
                      alt={session.tutorName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{session.tutorName}</div>
                      <div className="text-sm text-gray-600">{session.subject}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatDate(session.date)}</div>
                    <div className="text-sm text-gray-600">{session.time} • {session.duration}h</div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      {session.type === 'virtual' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                      <span>{session.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                    <button className="btn-secondary text-sm px-3 py-1">
                      Reschedule
                    </button>
                    <button className="btn-primary text-sm px-3 py-1">
                      Join Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Sessions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Past Sessions</h2>
          <span className="text-sm text-gray-600">{pastSessions.length} completed</span>
        </div>

        {pastSessions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No past sessions</h3>
            <p className="text-gray-600">Your completed sessions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastSessions.map(session => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={session.tutorAvatar}
                      alt={session.tutorName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{session.tutorName}</div>
                      <div className="text-sm text-gray-600">{session.subject}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatDate(session.date)}</div>
                    <div className="text-sm text-gray-600">{session.time} • {session.duration}h</div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      {session.type === 'virtual' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                      <span>{session.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{session.rating}/5</span>
                    </div>
                    <button className="btn-secondary text-sm px-3 py-1">
                      View Details
                    </button>
                  </div>
                </div>
                
                {session.review && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700">{session.review}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
