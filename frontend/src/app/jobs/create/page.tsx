'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CreateJobForm from '../../../components/job/CreateJobForm';
import { useAuth } from '../../../hooks/useAuth';

export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSuccess = () => {
    router.push('/jobs/manage');
  };

  const handleCancel = () => {
    router.back();
  };

  if (user?.role !== 'RECRUITER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only recruiters can create job postings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CreateJobForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}