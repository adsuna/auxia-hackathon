'use client';

import React, { useState, useEffect } from 'react';
import { jobAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

interface Student {
  id: string;
  userId: string;
  name: string;
  branch: string;
  year: number;
  headline: string;
  skills: string[];
  projectUrl?: string;
  resumeUrl?: string;
  videoUrl?: string;
  matchScore?: number;
  ranking?: {
    skillsScore: number;
    textScore: number;
    eligibilityScore: number;
    freshnessScore: number;
    newProfileBoost?: number;
  };
}

interface StudentFeedProps {
  jobId: string;
  jobTitle: string;
}

export default function StudentFeed({ jobId, jobTitle }: StudentFeedProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [remainingLikes, setRemainingLikes] = useState(30);
  const { user } = useAuth();

  const loadStudents = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await jobAPI.getStudentFeed({ 
        page: pageNum, 
        limit: 20,
        jobId 
      });
      
      if (response.success && response.data) {
        const newStudents = response.data.data || [];
        setStudents(append ? [...students, ...newStudents] : newStudents);
        setHasMore(response.data.pagination?.hasMore || false);
        setRemainingLikes(response.data.remainingLikes || 0);
        setError(null);
      } else {
        setError(response.error || 'Failed to load students');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'RECRUITER' && jobId) {
      loadStudents();
    }
  }, [user, jobId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadStudents(nextPage, true);
  };

  const handleLike = async (studentId: string) => {
    if (remainingLikes <= 0) {
      alert('You have reached your daily like limit!');
      return;
    }

    try {
      // TODO: Implement like functionality when matching system is ready
      console.log('Like student:', studentId);
      setRemainingLikes(remainingLikes - 1);
      
      // Remove student from feed after liking
      setStudents(students.filter(s => s.userId !== studentId));
    } catch (err) {
      console.error('Failed to like student:', err);
    }
  };

  const handlePass = (studentId: string) => {
    // Remove student from feed after passing
    setStudents(students.filter(s => s.userId !== studentId));
  };

  const getSkillsMatch = (studentSkills: string[], jobSkills: string[] = []) => {
    const matches = studentSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    return matches;
  };

  if (user?.role !== 'RECRUITER') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Only recruiters can view student feeds</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidates for: {jobTitle}</h1>
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">Find the perfect candidates for your role</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Remaining likes today:</span>
              <span className={`text-sm font-medium ${remainingLikes > 5 ? 'text-green-600' : 'text-red-600'}`}>
                {remainingLikes}
              </span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && students.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading candidates...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && students.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No more candidates</h3>
            <p className="text-gray-600">You've seen all available candidates for this job.</p>
          </div>
        )}

        {/* Students Grid */}
        {students.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {students.map((student) => (
              <div key={student.userId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    {student.matchScore && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        {Math.round(student.matchScore * 100)}% match
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3">
                    <span>{student.branch}</span>
                    <span>•</span>
                    <span>Year {student.year}</span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {student.headline}
                </p>

                {/* Skills */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Links */}
                {(student.projectUrl || student.resumeUrl) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Links</h4>
                    <div className="flex space-x-3">
                      {student.projectUrl && (
                        <a
                          href={student.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          🔗 Project
                        </a>
                      )}
                      {student.resumeUrl && (
                        <a
                          href={student.resumeUrl}
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

                {/* Match Breakdown */}
                {student.ranking && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Match Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Skills:</span>
                        <span>{Math.round(student.ranking.skillsScore * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profile:</span>
                        <span>{Math.round(student.ranking.textScore * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Eligibility:</span>
                        <span>{Math.round(student.ranking.eligibilityScore * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Freshness:</span>
                        <span>{Math.round(student.ranking.freshnessScore * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handlePass(student.userId)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => handleLike(student.userId)}
                    disabled={remainingLikes <= 0}
                    className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ❤️ Like
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && students.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load More Candidates'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}