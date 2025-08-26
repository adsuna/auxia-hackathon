'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  jobTitle?: string;
  candidateName?: string;
}

export default function TimeSlotManager() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '09:00',
    duration: 30
  });
  const { user } = useAuth();

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await interviewAPI.getMyTimeSlots();
      
      // Mock data for demonstration
      const mockSlots: TimeSlot[] = [];
      const now = new Date();
      
      // Generate some existing slots
      for (let day = 1; day <= 14; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() + day);
        
        // Add a few random slots per day
        for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
          const hour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
          const startTime = new Date(date);
          startTime.setHours(hour, 0, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + 30);
          
          const isBooked = Math.random() > 0.7;
          
          mockSlots.push({
            id: `slot-${day}-${i}`,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            isBooked,
            jobTitle: isBooked ? 'Frontend Developer' : undefined,
            candidateName: isBooked ? 'John Doe' : undefined
          });
        }
      }
      
      setSlots(mockSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
    } catch (err) {
      setError('Failed to load time slots');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const handleCreateSlot = async () => {
    if (!newSlot.date || !newSlot.startTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const startDateTime = new Date(`${newSlot.date}T${newSlot.startTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + newSlot.duration);

      // TODO: Replace with actual API call
      // const response = await interviewAPI.createTimeSlot({
      //   startTime: startDateTime.toISOString(),
      //   endTime: endDateTime.toISOString()
      // });

      // Add to local state for demo
      const slot: TimeSlot = {
        id: `slot-new-${Date.now()}`,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        isBooked: false
      };

      setSlots([...slots, slot].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ));

      // Reset form
      setNewSlot({
        date: '',
        startTime: '09:00',
        duration: 30
      });
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to create time slot');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    if (slot.isBooked && !confirm('This slot is booked. Are you sure you want to delete it?')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await interviewAPI.deleteTimeSlot(slotId);

      setSlots(slots.filter(s => s.id !== slotId));
    } catch (err) {
      setError('Failed to delete time slot');
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (user?.role !== 'RECRUITER') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Only recruiters can manage time slots</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Time Slots</h1>
          <p className="text-gray-600">Manage your availability for interviews</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Time Slot
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Time Slot</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  min={getTodayDate()}
                  value={newSlot.date}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={newSlot.duration}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSlot}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading time slots...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && slots.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No time slots created</h3>
          <p className="text-gray-600 mb-4">Create your first time slot to start scheduling interviews.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Add Your First Time Slot
          </button>
        </div>
      )}

      {/* Time Slots List */}
      {!loading && slots.length > 0 && (
        <div className="space-y-4">
          {slots.map((slot) => {
            const { date, time } = formatDateTime(slot.startTime);
            const endTime = formatDateTime(slot.endTime).time;
            
            return (
              <div
                key={slot.id}
                className={`p-4 border rounded-lg ${
                  slot.isBooked 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-gray-900">{date}</p>
                        <p className="text-sm text-gray-600">{time} - {endTime}</p>
                      </div>
                      
                      {slot.isBooked && (
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              Booked
                            </span>
                            <div className="text-sm">
                              <p className="font-medium">{slot.jobTitle}</p>
                              <p className="text-gray-600">with {slot.candidateName}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {!slot.isBooked && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          Available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {slot.isBooked && (
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View Details
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {slots.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900">Total Slots</h3>
            <p className="text-2xl font-bold text-blue-600">{slots.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-900">Booked</h3>
            <p className="text-2xl font-bold text-green-600">
              {slots.filter(s => s.isBooked).length}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Available</h3>
            <p className="text-2xl font-bold text-gray-600">
              {slots.filter(s => !s.isBooked).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}