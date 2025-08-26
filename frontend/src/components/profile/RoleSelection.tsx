'use client';

import React, { useState } from 'react';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

interface RoleSelectionProps {
  onRoleSelected: (role: 'STUDENT' | 'RECRUITER') => void;
}

export default function RoleSelection({ onRoleSelected }: RoleSelectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateProfileStatus } = useAuth();

  const handleRoleSelect = async (role: 'STUDENT' | 'RECRUITER') => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/profile/role', { role });
      
      if (response.success) {
        onRoleSelected(role);
      } else {
        setError(response.error || 'Failed to set role');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose Your Role
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select how you want to use SwipeHire Campus
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('STUDENT')}
            disabled={loading}
            className="w-full flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-4xl mb-2">🎓</div>
            <h3 className="text-lg font-semibold text-gray-900">I'm a Student</h3>
            <p className="text-sm text-gray-600 text-center mt-1">
              Looking for internships and job opportunities
            </p>
          </button>

          <button
            onClick={() => handleRoleSelect('RECRUITER')}
            disabled={loading}
            className="w-full flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-4xl mb-2">💼</div>
            <h3 className="text-lg font-semibold text-gray-900">I'm a Recruiter</h3>
            <p className="text-sm text-gray-600 text-center mt-1">
              Looking to hire talented students
            </p>
          </button>
        </div>

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Setting up your account...</p>
          </div>
        )}
      </div>
    </div>
  );
}