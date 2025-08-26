'use client';

import { useState, useEffect } from 'react';
import { jobAPI } from '@/lib/api';
import JobCard from './JobCard';

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
  createdAt: string;
  recruiter: {
    recruiterProfile?: {
      org: string;
    };
  };
  matchScore?: number;
  commonSkills?: number;
  skillsMatchScore?: number;
  batchScore?: number;
  freshnessScore?: number;
}

interface JobFeedProps {
  studentSkills?: string[];
  studentYear?: number;
}

export default function JobFeed({ studentSkills = [], studentYear }: JobFeedProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skillsFilter, setSkillsFilter] = useState(false);
  const [batchFilter, setBatchFilter] = useState<number | null>(null);

  const fetchJobs = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await jobAPI.getJobFeed({
        page: pageNum,
        limit: 20,
        skills: skillsFilter ? studentSkills : undefined,
        year: studentYear,
        batch: batchFilter || undefined,
        skillsFilter
      });
      
      if (response.success && response.data) {
        const responseData = response.data as { data: Job[]; pagination: { hasMore: boolean } };
        const newJobs = responseData.data || [];
        
        if (reset || pageNum === 1) {
          setJobs(newJobs);
        } else {
          setJobs(prev => [...prev, ...newJobs]);
        }
        
        setHasMore(responseData.pagination?.hasMore || false);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch jobs');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchJobs(1, true);
    setPage(1);
  }, [skillsFilter, batchFilter]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchJobs(nextPage, false);
    }
  };

  const handleLike = async (jobId: string) => {
    console.log('Liked job:', jobId);
    // TODO: Implement like functionality (will be in later tasks)
  };

  const handleDislike = async (jobId: string) => {
    console.log('Disliked job:', jobId);
    // TODO: Implement dislike functionality (will be in later tasks)
    // For now, just remove from feed
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => fetchJobs(1, true)}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Opportunities</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="skillsFilter"
              checked={skillsFilter}
              onChange={(e) => setSkillsFilter(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="skillsFilter" className="text-sm font-medium text-gray-700">
              Match my skills ({studentSkills.length} skills)
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="batchFilter" className="text-sm font-medium text-gray-700">
              Target batch:
            </label>
            <select
              id="batchFilter"
              value={batchFilter || ''}
              onChange={(e) => setBatchFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">All batches</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
            </select>
          </div>
          
          {studentYear && (
            <div className="text-sm text-gray-600">
              Your batch: {studentYear}
            </div>
          )}
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No jobs found</div>
          <p className="text-gray-400 mb-4">
            Try adjusting your filters or check back later for new opportunities.
          </p>
          <button
            onClick={() => {
              setSkillsFilter(false);
              setBatchFilter(null);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="relative">
                <JobCard
                  job={job}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  showActions={true}
                />
                
                {/* Match score indicator */}
                {job.matchScore !== undefined && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {Math.round(job.matchScore * 100)}% match
                  </div>
                )}
                
                {/* Common skills indicator */}
                {job.commonSkills !== undefined && job.commonSkills > 0 && (
                  <div className="absolute top-8 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    {job.commonSkills} common skills
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Loading...' : 'Load More Jobs'}
              </button>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <p>
              Showing {jobs.length} jobs
              {skillsFilter && ` matching your skills`}
              {batchFilter && ` for batch ${batchFilter}`}
            </p>
            {skillsFilter && studentSkills.length > 0 && (
              <p className="mt-1">
                Your skills: {studentSkills.join(', ')}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}