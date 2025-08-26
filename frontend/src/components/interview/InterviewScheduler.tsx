'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  recruiterName?: string;
  studentName?: string;
  jobTitle?: string;
}

interface InterviewSchedulerProps {
  matchId: string;
  jobTitle: string;
  candidateName?: string;
  recruiterName?: string;
  onScheduled: () => void;
  onCancel: () => void;
}

export default function InterviewScheduler({
  matchId,
  jobTitle,
  candidateName,
  recruiterName,
  onScheduled,
  onCancel
}: InterviewSchedulerProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewDetails, setInterviewDetails] = useState({
    duration: 30,
    notes: '',
    meetingLink: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    loadAvailableSlots();
  }, [matchId]);

  const loadAvailableSlots = async () => {
    try {
      // TODO: Replace with actual API call when interview system is implemented
      // const response = await interviewAPI.getAvailableSlots(matchId);
      
      // Mock data for demonstration
      const mockSlots: TimeSlot[] = [];
      const now = new Date();
      
      // Generate slots for the next 7 days
      for (let day = 1; day <= 7; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() + day);
        
        // Add morning slots (9 AM to 12 PM)
        for (let hour = 9; hour <= 11; hour++) {
          const startTime = new Date(date);
          startTime.setHours(hour, 0, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + interviewDetails.duration);
          
          mockSlots.push({
            id: `slot-${day}-${hour}`,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            isBooked: Math.random() > 0.7 // Random booking status
          });
        }
        
        // Add afternoon slots (2 PM to 5 PM)
        for (let hour = 14; hour <= 16; hour++) {
          const startTime = new Date(date);
          startTime.setHours(hour, 0, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + interviewDetails.duration);
          
          mockSlots.push({
            id: `slot-${day}-${hour}`,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            isBooked: Math.random() > 0.8 // Random booking status
          });
        }
      }
      
      setAvailableSlots(mockSlots.filter(slot => !slot.isBooked));
    } catch (err) {
      setError('Failed to load available time slots');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const generateMeetingLink = () => {
    // Generate a random Google Meet link for demo purposes
    const meetingId = Math.random().toString(36).substr(2, 10);
    return `https://meet.google.com/${meetingId}`;
  };

  const generateCalendarFile = (slot: TimeSlot) => {
    const startDate = new Date(slot.startTime);
    const endDate = new Date(slot.endTime);
    
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SwipeHire//Interview Scheduler//EN
BEGIN:VEVENT
UID:${slot.id}@swipehire.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Interview - ${jobTitle}
DESCRIPTION:Interview between ${candidateName || 'Candidate'} and ${recruiterName || 'Recruiter'}\\n\\nMeeting Link: ${interviewDetails.meetingLink}\\n\\nNotes: ${interviewDetails.notes}
LOCATION:${interviewDetails.meetingLink}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Interview reminder
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return icsContent;
  };

  const downloadCalendarFile = (slot: TimeSlot) => {
    const icsContent = generateCalendarFile(slot);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `interview-${jobTitle.replace(/\s+/g, '-').toLowerCase()}.ics`;
    link.click();
  };

  const handleScheduleInterview = async () => {
    if (!selectedSlot) return;

    setLoading(true);
    setError(null);

    try {
      const slot = availableSlots.find(s => s.id === selectedSlot);
      if (!slot) throw new Error('Selected slot not found');

      // Generate meeting link if not provided
      if (!interviewDetails.meetingLink) {
        setInterviewDetails(prev => ({
          ...prev,
          meetingLink: generateMeetingLink()
        }));
      }

      // TODO: Replace with actual API call
      // const response = await interviewAPI.scheduleInterview({
      //   matchId,
      //   slotId: selectedSlot,
      //   duration: interviewDetails.duration,
      //   notes: interviewDetails.notes,
      //   meetingLink: interviewDetails.meetingLink
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Download calendar file
      downloadCalendarFile(slot);

      onScheduled();
    } catch (err) {
      setError('Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    const date = new Date(slot.startTime).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Interview</h2>
              <p className="text-gray-600">
                {jobTitle} {candidateName && `with ${candidateName}`}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Time Slot Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Time Slot</h3>
              
              {Object.keys(slotsByDate).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No available time slots</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(slotsByDate).map(([date, slots]) => (
                    <div key={date} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        {formatDate(slots[0].startTime)}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot.id)}
                            className={`p-3 text-sm rounded-lg border transition-colors ${
                              selectedSlot === slot.id
                                ? 'bg-blue-100 border-blue-500 text-blue-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interview Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Details</h3>
              
              <div className="space-y-4">
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={interviewDetails.duration}
                    onChange={(e) => setInterviewDetails(prev => ({
                      ...prev,
                      duration: parseInt(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                {/* Meeting Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={interviewDetails.meetingLink}
                    onChange={(e) => setInterviewDetails(prev => ({
                      ...prev,
                      meetingLink: e.target.value
                    }))}
                    placeholder="Auto-generated if left empty"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={interviewDetails.notes}
                    onChange={(e) => setInterviewDetails(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    placeholder="Any additional information or preparation notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Selected Slot Summary */}
              {selectedSlot && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Time Slot</h4>
                  {(() => {
                    const slot = availableSlots.find(s => s.id === selectedSlot);
                    if (!slot) return null;
                    return (
                      <div className="text-sm text-blue-700">
                        <p>{formatDate(slot.startTime)}</p>
                        <p>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</p>
                        <p>{interviewDetails.duration} minutes</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-8 pt-6 border-t">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleInterview}
              disabled={!selectedSlot || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Scheduling...' : 'Schedule Interview & Download Calendar'}
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 text-sm text-gray-500">
            <p>📅 A calendar file (.ics) will be downloaded after scheduling</p>
            <p>📧 Both participants will receive email notifications</p>
            <p>🔗 Meeting link will be shared automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
}