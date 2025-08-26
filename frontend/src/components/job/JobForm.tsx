'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { jobAPI } from '@/lib/api';

interface JobFormData {
  title: string;
  description: string;
  skills: string[];
  batch?: number;
  location: string;
  ctcMin: number;
  ctcMax: number;
  videoUrl?: string;
}

interface JobFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<JobFormData>;
  jobId?: string;
  isEditing?: boolean;
}

export default function JobForm({ 
  onSuccess, 
  onCancel, 
  initialData, 
  jobId, 
  isEditing = false 
}: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<JobFormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      ctcMin: initialData?.ctcMin || 0,
      ctcMax: initialData?.ctcMax || 0,
      batch: initialData?.batch || undefined,
      videoUrl: initialData?.videoUrl || ''
    }
  });

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      const newSkills = [...skills, skill];
      setSkills(newSkills);
      setValue('skills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    setValue('skills', newSkills);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async (data: JobFormData) => {
    if (skills.length === 0) {
      setError('At least one skill is required');
      return;
    }

    if (data.ctcMin > data.ctcMax) {
      setError('Minimum CTC cannot be greater than maximum CTC');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const jobData = {
        ...data,
        skills,
        batch: data.batch || undefined,
        videoUrl: data.videoUrl?.trim() || undefined
      };

      let response;
      if (isEditing && jobId) {
        response = await jobAPI.updateJob(jobId, jobData);
      } else {
        response = await jobAPI.createJob(jobData);
      }

      if (response.success) {
        onSuccess?.();
      } else {
        setError(response.error || 'Failed to save job');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title *
          </label>
          <input
            {...register('title', { 
              required: 'Job title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters' }
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Software Engineer Intern"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description *
          </label>
          <textarea
            {...register('description', { 
              required: 'Job description is required',
              minLength: { value: 20, message: 'Description must be at least 20 characters' }
            })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the role, responsibilities, and requirements..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Required Skills *
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a skill and press Enter"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {skills.length === 0 && (
            <p className="mt-1 text-sm text-red-600">At least one skill is required</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            {...register('location', { required: 'Location is required' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Bangalore, Remote, Hybrid"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* CTC Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ctcMin" className="block text-sm font-medium text-gray-700 mb-1">
              Min CTC (LPA) *
            </label>
            <input
              {...register('ctcMin', { 
                required: 'Minimum CTC is required',
                min: { value: 0, message: 'CTC cannot be negative' },
                valueAsNumber: true
              })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            {errors.ctcMin && (
              <p className="mt-1 text-sm text-red-600">{errors.ctcMin.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="ctcMax" className="block text-sm font-medium text-gray-700 mb-1">
              Max CTC (LPA) *
            </label>
            <input
              {...register('ctcMax', { 
                required: 'Maximum CTC is required',
                min: { value: 0, message: 'CTC cannot be negative' },
                valueAsNumber: true
              })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            {errors.ctcMax && (
              <p className="mt-1 text-sm text-red-600">{errors.ctcMax.message}</p>
            )}
          </div>
        </div>

        {/* Batch */}
        <div>
          <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">
            Target Batch (Optional)
          </label>
          <select
            {...register('batch', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any batch</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
            <option value={2028}>2028</option>
          </select>
        </div>

        {/* Video URL */}
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Video URL (Optional)
          </label>
          <input
            {...register('videoUrl')}
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/video.mp4"
          />
          <p className="mt-1 text-sm text-gray-500">
            Video will only be visible after mutual match
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Job' : 'Create Job')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}