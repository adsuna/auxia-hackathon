'use client';

import { useState } from 'react';
import JobCard from '@/components/job/JobCard';

const sampleJobs = [
  {
    id: '1',
    title: 'Software Engineer Intern',
    description: 'Join our dynamic team as a Software Engineer Intern! You will work on cutting-edge projects using modern technologies like React, Node.js, and TypeScript. This is a great opportunity to learn from experienced developers and contribute to real-world applications.',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB'],
    batch: 2025,
    location: 'Bangalore',
    ctcMin: 8,
    ctcMax: 12,
    recruiter: {
      recruiterProfile: {
        org: 'TechCorp Solutions'
      }
    }
  },
  {
    id: '2',
    title: 'Frontend Developer',
    description: 'We are looking for a passionate Frontend Developer to create amazing user experiences. You will work with our design team to implement responsive and interactive web applications.',
    skills: ['React', 'CSS', 'HTML', 'JavaScript', 'Tailwind CSS'],
    batch: 2024,
    location: 'Mumbai',
    ctcMin: 6,
    ctcMax: 10,
    recruiter: {
      recruiterProfile: {
        org: 'StartupXYZ'
      }
    }
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    description: 'Looking for a versatile Full Stack Developer who can work on both frontend and backend technologies. You will be responsible for developing complete web applications from scratch.',
    skills: ['Python', 'Django', 'React', 'PostgreSQL', 'AWS', 'Docker'],
    location: 'Remote',
    ctcMin: 10,
    ctcMax: 15,
    recruiter: {
      recruiterProfile: {
        org: 'Global Tech Inc'
      }
    }
  }
];

export default function DemoJobsPage() {
  const [likedJobs, setLikedJobs] = useState<Set<string>>(new Set());
  const [dislikedJobs, setDislikedJobs] = useState<Set<string>>(new Set());
  const [likingJob, setLikingJob] = useState<string | null>(null);

  const handleLike = async (jobId: string) => {
    setLikingJob(jobId);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLikedJobs(prev => new Set([...prev, jobId]));
    setLikingJob(null);
    
    console.log(`Liked job: ${jobId}`);
  };

  const handleDislike = async (jobId: string) => {
    setLikingJob(jobId);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setDislikedJobs(prev => new Set([...prev, jobId]));
    setLikingJob(null);
    
    console.log(`Disliked job: ${jobId}`);
  };

  const visibleJobs = sampleJobs.filter(job => 
    !likedJobs.has(job.id) && !dislikedJobs.has(job.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Feed Demo</h1>
          <p className="text-gray-600">
            This demonstrates the job card component with like/dislike functionality
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-gray-500">
            <span>Liked: {likedJobs.size}</span>
            <span>Disliked: {dislikedJobs.size}</span>
            <span>Remaining: {visibleJobs.length}</span>
          </div>
        </div>

        {visibleJobs.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No more jobs!</h2>
            <p className="text-gray-500 mb-4">You&apos;ve seen all available jobs.</p>
            <button
              onClick={() => {
                setLikedJobs(new Set());
                setDislikedJobs(new Set());
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Reset Demo
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onLike={handleLike}
                onDislike={handleDislike}
                isLiking={likingJob === job.id}
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* Action Log */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-2">Actions Log</h3>
          <div className="text-sm text-gray-600">
            <p>Liked jobs: {Array.from(likedJobs).join(', ') || 'None'}</p>
            <p>Disliked jobs: {Array.from(dislikedJobs).join(', ') || 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}