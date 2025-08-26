'use client';

import React from 'react';
import TimeSlotManager from '../../components/interview/TimeSlotManager';
import { useAuth } from '../../hooks/useAuth';

export default function InterviewsPage() {
  const { user } = useAuth();

  if (user?.role === 'RECRUITER') {
    return <TimeSlotManager />;
  }

  // Student view - show scheduled interviews
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Interviews</h1>
          <p className="text-gray-600">Manage your upcoming interview schedule</p>
        </div>

        {/* Mock interview schedule for students */}
        <div className="space-y-4">
          {[
            {
              id: '1',
              company: 'TechCorp',
              position: 'Frontend Developer',
              date: '2024-03-15',
              time: '2:00 PM',
              duration: '45 minutes',
              type: 'Technical Interview',
              meetingLink: 'https://meet.google.com/abc-def-ghi'
            },
            {
              id: '2',
              company: 'StartupXYZ',
              position: 'Full Stack Engineer',
              date: '2024-03-18',
              time: '10:30 AM',
              duration: '30 minutes',
              type: 'HR Round',
              meetingLink: 'https://meet.google.com/xyz-abc-def'
            }
          ].map((interview) => (
            <div key={interview.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {interview.position}
                  </h3>
                  <p className="text-gray-600 mb-2">{interview.company}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📅 {interview.date}</span>
                    <span>🕐 {interview.time}</span>
                    <span>⏱️ {interview.duration}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {interview.type}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Join Meeting
                  </a>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if no interviews */}
        <div className="text-center py-12 mt-8">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No interviews scheduled</h3>
          <p className="text-gray-600">Your scheduled interviews will appear here.</p>
        </div>
      </div>
    </div>
  );
}