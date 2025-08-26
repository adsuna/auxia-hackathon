'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

interface RecruiterProfileFormData {
  name: string;
  org: string;
  title: string;
}

interface RecruiterProfileFormProps {
  onComplete: () => void;
  initialData?: Partial<RecruiterProfileFormData>;
  isEditing?: boolean;
}

export default function RecruiterProfileForm({ 
  onComplete, 
  initialData, 
  isEditing = false 
}: RecruiterProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const { updateProfileStatus } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<RecruiterProfileFormData>({
    defaultValues: {
      name: initialData?.name || '',
      org: initialData?.org || '',
      title: initialData?.title || '',
    }
  });

  const onSubmit = async (data: RecruiterProfileFormData) => {
    setLoading(true);

    try {
      const endpoint = isEditing ? '/profile/recruiter' : '/profile/recruiter';
      const method = isEditing ? 'put' : 'post';
      
      const response = await apiClient[method](endpoint, data);
      
      if (response.success) {
        updateProfileStatus(true);
        onComplete();
      } else {
        setError('root', { message: response.error || 'Failed to save profile' });
      }
    } catch (error) {
      setError('root', { message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isEditing ? 'Update Your Profile' : 'Create Your Recruiter Profile'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tell students about yourself and your organization
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.root.message}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              {...register('name', { 
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="org" className="block text-sm font-medium text-gray-700">
              Organization *
            </label>
            <input
              {...register('org', { 
                required: 'Organization is required',
                minLength: { value: 2, message: 'Organization must be at least 2 characters' }
              })}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your company name"
            />
            {errors.org && (
              <p className="mt-1 text-sm text-red-600">{errors.org.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Job Title *
            </label>
            <input
              {...register('title', { 
                required: 'Job title is required',
                minLength: { value: 2, message: 'Job title must be at least 2 characters' }
              })}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Senior Software Engineer, HR Manager"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Your profile information will be used to help students understand who you are and what opportunities you offer.
          </p>
        </div>
      </div>
    </div>
  );
}