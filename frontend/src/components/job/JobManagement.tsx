'use client';

import { useState, useEffect } from 'react';
import { jobAPI } from '@/lib/api';
import JobForm from './JobForm';

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

export default function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getMyJobs();
      
      if (response.success && response.data) {
        setJobs((response.data as { data: Job[] }).data || []);
      } else {
        setError(response.error || 'Failed to fetch jobs');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowForm(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingJob(null);
    fetchJobs();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingJobId(jobId);
      const response = await jobAPI.deleteJob(jobId);
      
      if (response.success) {
        fetchJobs();
      } else {
        alert(response.error || 'Failed to delete job');
      }
    } catch {
      alert('An unexpected error occurred');
    } finally {
      setDeletingJobId(null);
    }
  };

  if (showForm) {
    return (
      <JobForm
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
        initialData={editingJob || undefined}
        jobId={editingJob?.id}
        isEditing={!!editingJob}
      />
    );
  }

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
            onClick={fetchJobs}
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
        <button
          onClick={handleCreateJob}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No job postings yet</div>
          <button
            onClick={handleCreateJob}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Your First Job
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6 border">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                  {job.title}
                </h3>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleEditJob(job)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={deletingJobId === job.id || job._count.matches > 0 || job._count.slots > 0}
                    className="text-red-600 hover:text-red-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                    title={job._count.matches > 0 || job._count.slots > 0 ? 'Cannot delete job with matches or slots' : 'Delete job'}
                  >
                    {deletingJobId === job.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {job.description}
              </p>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    <span className="font-medium">Location:</span> {job.location}
                  </span>
                  {job.batch && (
                    <span className="text-gray-600">
                      <span className="font-medium">Batch:</span> {job.batch}
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">CTC:</span> ₹{job.ctcMin} - ₹{job.ctcMax} LPA
                </div>

                <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
                  <span>{job._count.matches} matches</span>
                  <span>{job._count.slots} slots</span>
                  <span>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {job.videoUrl && (
                  <div className="text-xs text-blue-600">
                    📹 Video attached
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}