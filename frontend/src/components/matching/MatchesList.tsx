'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface Match {
  id: string;
  createdAt: string;
  job?: {
    id: string;
    title: string;
    description: string;
    skills: string[];
    location: string;
    ctcMin: number;
    ctcMax: number;
    recruiter: {
      name: string;
      org: string;
      title: string;
    };
  };
  student?: {
    id: string;
    userId: string;
    name: string;
    branch: string;
    year: number;
    headline: string;
    skills: string[];
    projectUrl?: string;
    resumeUrl?: string;
  };
  hasStudentVideo?: boolean;
  hasRecruiterVideo?: boolean;
  interviewScheduled?: boolean;
}

export default function MatchesList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { user } = useAuth();

  const loadMatches = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when matching system is implemented
      // const response = await matchAPI.getMyMatches();
      
      // Mock data for now
      const mockMatches: Match[] = [
        {
          id: '1',
          createdAt: new Date().toISOString(),
          job: {
            id: 'job1',
            title: 'Frontend Developer Intern',
            description: 'Looking for a React developer to join our team...',
            skills: ['React', 'JavaScript', 'CSS'],
            location: 'Bangalore',
            ctcMin: 400000,
            ctcMax: 600000,
            recruiter: {
              name: 'John Doe',
              org: 'TechCorp',
              title: 'Senior Recruiter'
            }
          },
          student: user?.role === 'RECRUITER' ? {
            id: 'student1',
            userId: 'user1',
            name: 'Alice Smith',
            branch: 'Computer Science',
            year: 3,
            headline: 'Passionate frontend developer with React experience',
            skills: ['React', 'JavaScript', 'Node.js'],
            projectUrl: 'https://github.com/alice/project'
          } : undefined,
          hasStudentVideo: false,
          hasRecruiterVideo: true,
          interviewScheduled: false
        }
      ];
      
      setMatches(mockMatches);
      setError(null);
    } catch (err) {
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleScheduleInterview = (match: Match) => {
    // TODO: Implement interview scheduling
    console.log('Schedule interview for match:', match.id);
    alert('Interview scheduling will be implemented in the next phase!');
  };

  const handleViewVideo = (type: 'student' | 'recruiter', match: Match) => {
    // TODO: Implement video viewing after mutual match
    console.log(`View ${type} video for match:`, match.id);
    alert('Video viewing will be available after mutual match!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Matches</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadMatches}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Matches</h1>
          <p className="text-gray-600">
            {user?.role === 'STUDENT' 
              ? 'Companies that liked your profile' 
              : 'Candidates who liked your job postings'}
          </p>
        </div>

        {/* Empty State */}
        {matches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💕</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600 mb-4">
              {user?.role === 'STUDENT'
                ? 'Start swiping on jobs to find your perfect match!'
                : 'Start reviewing candidates to find your ideal hire!'}
            </p>
            <button
              onClick={() => window.location.href = '/feed'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Start Matching
            </button>
          </div>
        )}

        {/* Matches Grid */}
        {matches.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Match Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2 py-1 rounded-full">
                    New Match!
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(match.createdAt)}
                  </span>
                </div>

                {/* Job/Student Info */}
                {user?.role === 'STUDENT' && match.job ? (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{match.job.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {match.job.recruiter.org} • {match.job.location}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {formatCurrency(match.job.ctcMin)} - {formatCurrency(match.job.ctcMax)}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {match.job.description}
                    </p>
                  </div>
                ) : user?.role === 'RECRUITER' && match.student ? (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{match.student.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {match.student.branch} • Year {match.student.year}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {match.student.headline}
                    </p>
                  </div>
                ) : null}

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {(user?.role === 'STUDENT' ? match.job?.skills : match.student?.skills)
                      ?.slice(0, 3)
                      .map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Video Indicators */}
                <div className="mb-4 flex space-x-2">
                  {match.hasStudentVideo && (
                    <button
                      onClick={() => handleViewVideo('student', match)}
                      className="flex items-center space-x-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors"
                    >
                      <span>📹</span>
                      <span>Student Video</span>
                    </button>
                  )}
                  {match.hasRecruiterVideo && (
                    <button
                      onClick={() => handleViewVideo('recruiter', match)}
                      className="flex items-center space-x-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200 transition-colors"
                    >
                      <span>📹</span>
                      <span>Company Video</span>
                    </button>
                  )}
                </div>

                {/* Links for students */}
                {user?.role === 'RECRUITER' && match.student && (
                  <div className="mb-4">
                    <div className="flex space-x-3">
                      {match.student.projectUrl && (
                        <a
                          href={match.student.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          🔗 Project
                        </a>
                      )}
                      {match.student.resumeUrl && (
                        <a
                          href={match.student.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          📄 Resume
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-100">
                  {match.interviewScheduled ? (
                    <div className="text-center">
                      <span className="text-green-600 font-medium text-sm">✅ Interview Scheduled</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleScheduleInterview(match)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      📅 Schedule Interview
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Match Detail Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Match Details</h2>
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Detailed match info would go here */}
                <p className="text-gray-600">Detailed match information and messaging interface will be implemented here.</p>
                
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => handleScheduleInterview(selectedMatch)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium"
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}