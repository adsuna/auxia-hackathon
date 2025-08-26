'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

interface StudentProfileFormData {
  name: string;
  branch: string;
  year: number;
  headline: string;
  skills: string[];
  projectUrl?: string;
  resumeUrl?: string;
  videoUrl?: string;
}

interface StudentProfileFormProps {
  onComplete: () => void;
  initialData?: Partial<StudentProfileFormData>;
  isEditing?: boolean;
}

export default function StudentProfileForm({ 
  onComplete, 
  initialData, 
  isEditing = false 
}: StudentProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const { updateProfileStatus } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors
  } = useForm<StudentProfileFormData>({
    defaultValues: {
      name: initialData?.name || '',
      branch: initialData?.branch || '',
      year: initialData?.year || 1,
      headline: initialData?.headline || '',
      skills: initialData?.skills || [],
      projectUrl: initialData?.projectUrl || '',
      resumeUrl: initialData?.resumeUrl || '',
      videoUrl: initialData?.videoUrl || '',
    }
  });

  const skills = watch('skills');

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill) && skills.length < 8) {
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

  const onSubmit = async (data: StudentProfileFormData) => {
    // Validate skills count
    if (data.skills.length < 5) {
      setError('skills', { message: 'Please add at least 5 skills' });
      return;
    }

    if (data.skills.length > 8) {
      setError('skills', { message: 'Maximum 8 skills allowed' });
      return;
    }

    setLoading(true);

    try {
      const endpoint = isEditing ? '/profile/student' : '/profile/student';
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
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isEditing ? 'Update Your Profile' : 'Create Your Student Profile'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tell recruiters about yourself and your skills
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.root.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                Branch/Major *
              </label>
              <input
                {...register('branch', { 
                  required: 'Branch is required',
                  minLength: { value: 2, message: 'Branch must be at least 2 characters' }
                })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Computer Science"
              />
              {errors.branch && (
                <p className="mt-1 text-sm text-red-600">{errors.branch.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Year of Study *
            </label>
            <select
              {...register('year', { 
                required: 'Year is required',
                min: { value: 1, message: 'Year must be between 1 and 5' },
                max: { value: 5, message: 'Year must be between 1 and 5' },
                valueAsNumber: true
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
            </select>
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
              Headline *
            </label>
            <textarea
              {...register('headline', { 
                required: 'Headline is required',
                minLength: { value: 10, message: 'Headline must be at least 10 characters' }
              })}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of yourself and what you're looking for..."
            />
            {errors.headline && (
              <p className="mt-1 text-sm text-red-600">{errors.headline.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Skills * (5-8 skills required)
            </label>
            <div className="mt-1 flex">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a skill and press Enter"
                disabled={skills.length >= 8}
              />
              <button
                type="button"
                onClick={addSkill}
                disabled={!skillInput.trim() || skills.length >= 8}
                className="px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
            
            <p className="mt-1 text-sm text-gray-500">
              {skills.length}/8 skills added {skills.length < 5 && `(${5 - skills.length} more required)`}
            </p>
            
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-700">
              Project URL (Optional)
            </label>
            <input
              {...register('projectUrl', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL starting with http:// or https://'
                }
              })}
              type="url"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://github.com/username/project"
            />
            {errors.projectUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.projectUrl.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700">
              Resume URL (Optional)
            </label>
            <input
              {...register('resumeUrl', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL starting with http:// or https://'
                }
              })}
              type="url"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://drive.google.com/file/..."
            />
            {errors.resumeUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.resumeUrl.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
              Video Introduction URL (Optional)
            </label>
            <input
              {...register('videoUrl', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL starting with http:// or https://'
                }
              })}
              type="url"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://youtube.com/watch?v=..."
            />
            {errors.videoUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.videoUrl.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Video will only be visible to recruiters after mutual match
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || skills.length < 5}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}