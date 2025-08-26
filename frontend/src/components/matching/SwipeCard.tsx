'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

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
  matchScore?: number;
  ranking?: {
    skillsScore: number;
    textScore: number;
    eligibilityScore: number;
    freshnessScore: number;
    newProfileBoost?: number;
  };
  recruiter: {
    name: string;
    org: string;
    title: string;
  };
}

interface Student {
  id: string;
  userId: string;
  name: string;
  branch: string;
  year: number;
  headline: string;
  skills: string[];
  projectUrl?: string;
  resumeUrl?: string;
  videoUrl?: string;
  matchScore?: number;
}

interface SwipeCardProps {
  item: Job | Student;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  canLike: boolean;
  type: 'job' | 'student';
}

export default function SwipeCard({ item, onLike, onPass, canLike, type }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const { user } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const threshold = 100;
    const absX = Math.abs(dragOffset.x);

    if (absX > threshold) {
      if (dragOffset.x > 0 && canLike) {
        // Swiped right - like
        onLike(type === 'job' ? item.id : (item as Student).userId);
      } else if (dragOffset.x < 0) {
        // Swiped left - pass
        onPass(type === 'job' ? item.id : (item as Student).userId);
      }
    }

    // Reset
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const getRotation = () => {
    const maxRotation = 15;
    const rotation = (dragOffset.x / 200) * maxRotation;
    return Math.max(-maxRotation, Math.min(maxRotation, rotation));
  };

  const getOpacity = () => {
    const absX = Math.abs(dragOffset.x);
    if (absX > 100) return Math.max(0.3, 1 - (absX - 100) / 200);
    return 1;
  };

  const getSwipeIndicator = () => {
    if (Math.abs(dragOffset.x) < 50) return null;
    
    if (dragOffset.x > 0 && canLike) {
      return (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full font-bold transform rotate-12">
          LIKE
        </div>
      );
    } else if (dragOffset.x < 0) {
      return (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold transform -rotate-12">
          PASS
        </div>
      );
    }
    
    return null;
  };

  const isJob = (item: Job | Student): item is Job => type === 'job';

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div
        ref={cardRef}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 cursor-pointer select-none transform transition-transform duration-200 hover:scale-105"
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${getRotation()}deg)`,
          opacity: getOpacity(),
        }}
        onMouseDown={handleMouseDown}
      >
        {getSwipeIndicator()}

        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                {isJob(item) ? item.title : item.name}
              </h3>
              {item.matchScore && (
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full ml-2">
                  {Math.round(item.matchScore * 100)}%
                </span>
              )}
            </div>

            {isJob(item) ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p>{item.recruiter.org} • {item.location}</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(item.ctcMin)} - {formatCurrency(item.ctcMax)}
                </p>
                {item.batch && <p>Target Batch: {item.batch}</p>}
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <p>{item.branch} • Year {item.year}</p>
              </div>
            )}
          </div>

          {/* Description/Headline */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-4">
            {isJob(item) ? item.description : item.headline}
          </p>

          {/* Skills */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {isJob(item) ? 'Required Skills' : 'Skills'}
            </h4>
            <div className="flex flex-wrap gap-1">
              {item.skills.slice(0, 6).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {item.skills.length > 6 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{item.skills.length - 6}
                </span>
              )}
            </div>
          </div>

          {/* Links for students */}
          {!isJob(item) && (item.projectUrl || item.resumeUrl) && (
            <div className="mb-4">
              <div className="flex space-x-3">
                {item.projectUrl && (
                  <a
                    href={item.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    🔗 Project
                  </a>
                )}
                {item.resumeUrl && (
                  <a
                    href={item.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📄 Resume
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Match Breakdown */}
          {item.ranking && (
            <div className="mb-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showDetails ? 'Hide' : 'Show'} Match Details
              </button>
              
              {showDetails && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Skills:</span>
                      <span>{Math.round(item.ranking.skillsScore * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profile:</span>
                      <span>{Math.round(item.ranking.textScore * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eligibility:</span>
                      <span>{Math.round(item.ranking.eligibilityScore * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Freshness:</span>
                      <span>{Math.round(item.ranking.freshnessScore * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPass(type === 'job' ? item.id : (item as Student).userId);
              }}
              className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Pass
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(type === 'job' ? item.id : (item as Student).userId);
              }}
              disabled={!canLike}
              className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              ❤️ Like
            </button>
          </div>
        </div>
      </div>

      {/* Swipe Instructions */}
      <div className="text-center mt-4 text-sm text-gray-500">
        Swipe left to pass, right to like
      </div>
    </div>
  );
}