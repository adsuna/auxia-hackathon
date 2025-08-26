'use client';

import React, { useState, useEffect } from 'react';
import { jobAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import CreateJobForm from './CreateJobForm';

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
  _count: {
    matches: number;
    slots: number;
  };
}

export default function JobDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const loadJobs = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await jobAPI.getMyJobs(pageNum, 10);
      
      if (response.success && response.data) {
        const newJobs = response.data.data || [];
        setJobs(append ? [...jobs, ...newJobs] : newJobs);
        setHasMore(response.data.pagination?.hasMore || false);
        setError(null);
      } else {
        setError(response.error || 'Failed to load jobs');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'RECRUITER') {
      loadJobs();
    }
  }, [user]);

  const handleJobCreated = () => {
    setShowCreateForm(false);
    loadJobs(); // Refresh the job list
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadJobs(nextPage, true);
  };

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

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const response = await jobAPI.deleteJob(jobId);
      if (response.success) {
        setJobs(jobs.filter(job => job.id !== jobId));
      } else {
        alert(response.error || 'Failed to delete job');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  if (user?.role !== 'RECRUITER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only recruiters can access the job dashboard.</p>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <CreateJobForm
        onSuccess={handleJobCreated}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
            <p className="text-gray-600 mt-1">Manage your job postings and track applications</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + Create New Job
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && jobs.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading your jobs...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-600 mb-4">Create your first job posting to start finding great candidates.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Job
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {jobs.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete job"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* CTC Range */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(job.ctcMin)} - {formatCurrency(job.ctcMax)}
                  </p>
                  {job.batch && (
                    <p className="text-xs text-gray-500">Target Batch: {job.batch}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>❤️ {job._count.matches} matches</span>
                    <span>📅 {job._count.slots} slots</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(job.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && jobs.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load More Jobs'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}