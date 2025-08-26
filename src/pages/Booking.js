import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CreditCard, Video, Users } from 'lucide-react';
import api from '../lib/api';

const Booking = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('in-person');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const { data } = await api.get(`/tutors/${tutorId}`);
        setTutor(data);
        if (!selectedSubjectId && data.subjectDetails && data.subjectDetails.length > 0) {
          setSelectedSubjectId(data.subjectDetails[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [tutorId]);

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  const durations = [1, 1.5, 2, 2.5, 3];

  const getSelectedSubjectRate = () => {
    const match = tutor?.subjectDetails?.find(s => s.id === selectedSubjectId);
    return match ? Number(match.hourlyRate) : Number(tutor?.hourlyRate || 0);
  };

  const calculateTotal = () => {
    return getSelectedSubjectRate() * selectedDuration;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const subjectId = selectedSubjectId || tutor?.subjectDetails?.[0]?.id; // selected or first
    await api.post('/sessions', {
      tutorId,
      subjectId,
      date: selectedDate,
      time: selectedTime,
      durationHours: selectedDuration,
      sessionType: selectedLocation,
      notes
    });
    navigate('/dashboard');
  };

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
        <button onClick={() => navigate('/browse')} className="btn-primary">
          Browse Other Tutors
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Book a Session</h1>
        <p className="text-xl text-gray-600">
          Schedule your tutoring session with {tutor.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                        selectedTime === time
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Session Duration
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {durations.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setSelectedDuration(duration)}
                      className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                        selectedDuration === duration
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {duration}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Session Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedLocation('in-person')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedLocation === 'in-person'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-primary-600" />
                      <div>
                        <div className="font-medium">In-Person</div>
                        <div className="text-sm text-gray-600">{tutor.location}</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedLocation('virtual')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedLocation === 'virtual'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Video className="h-5 w-5 text-primary-600" />
                      <div>
                        <div className="font-medium">Virtual</div>
                        <div className="text-sm text-gray-600">Zoom/Google Meet</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {(tutor?.subjectDetails || []).map(s => (
                    <option key={s.id} value={s.id}>{s.name} — ₹{s.hourlyRate}/hr</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What would you like to focus on? Any specific topics or questions?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedDate || !selectedTime}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
            
            {/* Tutor Info */}
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-medium text-gray-900">{tutor.name}</div>
                <div className="text-sm text-gray-600">{tutor.subjects.join(', ')}</div>
              </div>
            </div>

            {/* Session Details */}
            <div className="space-y-3 mb-6">
              {selectedDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedDate}</span>
                </div>
              )}
              {selectedTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{selectedDuration} hour{selectedDuration !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{selectedLocation.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Rate:</span>
                <span>₹{getSelectedSubjectRate()}/hour</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Duration:</span>
                <span>{selectedDuration} hour{selectedDuration !== 1 ? 's' : ''}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-primary-600">₹{calculateTotal()}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Payment in Campus Credits</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Your campus credits will be deducted after the session is completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;