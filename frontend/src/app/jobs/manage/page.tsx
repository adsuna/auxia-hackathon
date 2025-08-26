'use client';

import React from 'react';
import JobDashboard from '../../../components/job/JobDashboard';
import { useAuth } from '../../../hooks/useAuth';

export default function ManageJobsPage() {
  const { user } = useAuth();

  if (user?.role !== 'RECRUITER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only recruiters can manage job postings.</p>
        </div>
      </div>
    );
  }

  return <JobDashboard />;
}