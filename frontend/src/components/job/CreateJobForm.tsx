'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { jobAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

interface CreateJobFormData {
  title: string;
  description: string;
  skills: string[];
  batch?: number;
  location: string;
  ctcMin: number;
  ctcMax: number;
  videoUrl?: string;
}

interface CreateJobFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateJobForm({ onSuccess, onCancel }: CreateJobFormProps) {
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors
  } = useForm<CreateJobFormData>({
    defaultValues: {
      title: '',
      description: '',
      skills: [],
      location: '',
      ctcMin: 300000,
      ctcMax: 500000,
      videoUrl: ''
    }
  });

  const skills = watch('skills');

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill) && skills.length < 10) {
      setValue('skills', [...skills, trimmedSkill]);
      setSkillInput('');
      clearErrors('skills');
    }
  };

  const removeSkill = (index: number) => {
    setValue('skills', skills.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async (data: CreateJobFormData) => {
    if (data.skills.length === 0) {
      setError('skills', { message: 'Please add at least one skill' });
      return;
    }

    if (data.ctcMin >= data.ctcMax) {
      setError('ctcMin', { message: 'Minimum CTC must be less than maximum CTC' });
      return;
    }

    setLoading(true);

    try {
      const response = await jobAPI.createJob(data);
      
      if (response.success) {
        onSuccess();
      } else {
        setError('root', { message: response.error || 'Failed to create job' });
      }
    } catch (error) {
      setError('root', { message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'RECRUITER') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Only recruiters can create jobs</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Job</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.root.message}
            </div>
          )}

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              {...register('title', { 
                required: 'Job title is required',
                minLength: { value: 5, message: 'Title must be at least 5 characters' }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Frontend Developer Intern"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              {...register('description', { 
                required: 'Job description is required',
                minLength: { value: 50, message: 'Description must be at least 50 characters' }
              })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills *
            </label>
            <div className="flex">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a skill and press Enter"
                disabled={skills.length >= 10}
              />
              <button
                type="button"
                onClick={addSkill}
                disabled={!skillInput.trim() || skills.length >= 10}
                className="px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100 disabled:opacity-50"
              >
                Add
              </button>
            </div>
            
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                {...register('location', { 
                  required: 'Location is required',
                  minLength: { value: 2, message: 'Location must be at least 2 characters' }
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Bangalore, Remote"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Target Batch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Batch (Optional)
              </label>
              <select
                {...register('batch', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Batch</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
                <option value={2028}>2028</option>
              </select>
            </div>
          </div>

          {/* CTC Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum CTC (₹) *
              </label>
              <input
                {...register('ctcMin', { 
                  required: 'Minimum CTC is required',
                  min: { value: 100000, message: 'Minimum CTC must be at least ₹1,00,000' },
                  valueAsNumber: true
                })}
                type="number"
                step="50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="300000"
              />
              {errors.ctcMin && (
                <p className="mt-1 text-sm text-red-600">{errors.ctcMin.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum CTC (₹) *
              </label>
              <input
                {...register('ctcMax', { 
                  required: 'Maximum CTC is required',
                  min: { value: 100000, message: 'Maximum CTC must be at least ₹1,00,000' },
                  valueAsNumber: true
                })}
                type="number"
                step="50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="500000"
              />
              {errors.ctcMax && (
                <p className="mt-1 text-sm text-red-600">{errors.ctcMax.message}</p>
              )}
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Introduction Video URL (Optional)
            </label>
            <input
              {...register('videoUrl', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL starting with http:// or https://'
                }
              })}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://youtube.com/watch?v=..."
            />
            {errors.videoUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.videoUrl.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Video will only be visible to students after mutual match
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || skills.length === 0}
              className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Job...' : 'Create Job'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}