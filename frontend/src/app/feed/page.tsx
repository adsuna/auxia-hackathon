'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SwipeCard from '../../components/matching/SwipeCard';
import { jobAPI } from '../../lib/api';

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  batch?: number;
  location: string;
  ctcMin: number;
  ctcMax: number;
  videoUrl?: string;
  matchScore?: number;
  ranking?: {
    skillsScore: number;
    textScore: number;
    eligibilityScore: number;
    freshnessScore: number;
    newProfileBoost?: number;
  };
  recruiter: {
    name: string;
    org: string;
    title: string;
  };
}

export default function FeedPage() {
  const { user, isLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingLikes, setRemainingLikes] = useState(30);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getJobFeed({ page: 1, limit: 50 });
      
      if (response.success && response.data) {
        setJobs(response.data.data || []);
        setRemainingLikes(response.data.remainingLikes || 30);
        setError(null);
      } else {
        setError('Failed to load jobs. The job system is not fully implemented yet.');
        // Mock data for demonstration
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Frontend Developer Intern',
            description: 'Join our dynamic team as a Frontend Developer Intern. You will work on cutting-edge React applications and learn from experienced developers. This role offers hands-on experience with modern web technologies and the opportunity to contribute to real products used by thousands of users.',
            skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Git'],
            location: 'Bangalore',
            ctcMin: 400000,
            ctcMax: 600000,
            batch: 2025,
            matchScore: 0.85,
            ranking: {
              skillsScore: 0.9,
              textScore: 0.8,
              eligibilityScore: 1.0,
              freshnessScore: 0.85
            },
            recruiter: {
              name: 'John Doe',
              org: 'TechCorp',
              title: 'Senior Recruiter'
            }
          },
          {
            id: '2',
            title: 'Backend Developer',
            description: 'Looking for a passionate Backend Developer to join our growing team. You will design and implement scalable APIs, work with databases, and ensure high performance of our server-side applications. Great opportunity to work with cloud technologies and microservices.',
            skills: ['Node.js', 'Python', 'MongoDB', 'AWS', 'Docker'],
            location: 'Mumbai',
            ctcMin: 500000,
            ctcMax: 800000,
            batch: 2024,
            matchScore: 0.72,
            ranking: {
              skillsScore: 0.7,
              textScore: 0.75,
              eligibilityScore: 0.8,
              freshnessScore: 0.9
            },
            recruiter: {
              name: 'Jane Smith',
              org: 'StartupXYZ',
              title: 'Technical Recruiter'
            }
          },
          {
            id: '3',
            title: 'Full Stack Developer',
            description: 'Exciting opportunity for a Full Stack Developer to work on innovative projects. You will be responsible for both frontend and backend development, working with modern frameworks and contributing to our product roadmap. Perfect role for someone who loves variety in their work.',
            skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Express'],
            location: 'Hyderabad',
            ctcMin: 600000,
            ctcMax: 900000,
            matchScore: 0.68,
            ranking: {
              skillsScore: 0.8,
              textScore: 0.6,
              eligibilityScore: 1.0,
              freshnessScore: 0.7
            },
            recruiter: {
              name: 'Bob Johnson',
              org: 'InnovateTech',
              title: 'Lead Recruiter'
            }
          }
        ];
        setJobs(mockJobs);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (jobId: string) => {
    if (remainingLikes <= 0) {
      alert('You have reached your daily like limit!');
      return;
    }

    try {
      // TODO: Implement actual like API call
      console.log('Liked job:', jobId);
      setRemainingLikes(remainingLikes - 1);
      
      // Move to next job
      setCurrentIndex(currentIndex + 1);
    } catch (err) {
      console.error('Failed to like job:', err);
    }
  };

  const handlePass = (jobId: string) => {
    console.log('Passed on job:', jobId);
    // Move to next job
    setCurrentIndex(currentIndex + 1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the job feed.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'STUDENT') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only students can access the job feed.</p>
        </div>
      </div>
    );
  }

  const currentJob = jobs[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Your Dream Job</h1>
          <div className="flex items-center justify-center space-x-4">
            <p className="text-gray-600">Swipe right to like, left to pass</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Likes remaining:</span>
              <span className={`text-sm font-medium ${remainingLikes > 5 ? 'text-green-600' : 'text-red-600'}`}>
                {remainingLikes}
              </span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-1">Demo data is being shown for testing purposes.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading jobs...</p>
          </div>
        )}

        {/* Job Cards */}
        {!loading && currentJob && (
          <SwipeCard
            item={currentJob}
            onLike={handleLike}
            onPass={handlePass}
            canLike={remainingLikes > 0}
            type="job"
          />
        )}

        {/* End of Feed */}
        {!loading && (!currentJob || currentIndex >= jobs.length) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">You're all caught up!</h3>
            <p className="text-gray-600 mb-4">
              {jobs.length === 0 
                ? "No jobs available right now. Check back later!"
                : "You've seen all available jobs. Check back tomorrow for more opportunities!"
              }
            </p>
            <button
              onClick={() => {
                setCurrentIndex(0);
                loadJobs();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Refresh Feed
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        {jobs.length > 0 && currentIndex < jobs.length && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{currentIndex + 1} of {jobs.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / jobs.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}