'use client';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    skills: string[];
    batch?: number;
    location: string;
    ctcMin: number;
    ctcMax: number;
    recruiter?: {
      recruiterProfile?: {
        org: string;
      };
    };
  };
  onLike?: (jobId: string) => void;
  onDislike?: (jobId: string) => void;
  showActions?: boolean;
  isLiking?: boolean;
  className?: string;
}

export default function JobCard({ 
  job, 
  onLike, 
  onDislike, 
  showActions = true, 
  isLiking = false,
  className = '' 
}: JobCardProps) {
  const handleLike = () => {
    if (!isLiking && onLike) {
      onLike(job.id);
    }
  };

  const handleDislike = () => {
    if (!isLiking && onDislike) {
      onDislike(job.id);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {job.title}
        </h3>
        {job.recruiter?.recruiterProfile?.org && (
          <p className="text-sm text-gray-600 font-medium">
            {job.recruiter.recruiterProfile.org}
          </p>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {job.description}
      </p>

      {/* Skills */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 6 && (
            <span className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
              +{job.skills.length - 6} more
            </span>
          )}
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            <span className="font-medium">Location:</span> {job.location}
          </span>
          {job.batch && (
            <span>
              <span className="font-medium">Batch:</span> {job.batch}
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          <span className="font-medium">CTC:</span> ₹{job.ctcMin} - ₹{job.ctcMax} LPA
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleDislike}
            disabled={isLiking}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Pass
          </button>
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLiking ? 'Liking...' : 'Like'}
          </button>
        </div>
      )}
    </div>
  );
}