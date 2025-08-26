'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const getWelcomeMessage = () => {
    if (user.role === 'STUDENT') {
      return {
        title: '🎓 Welcome to SwipeHire, Student!',
        subtitle: 'Find your dream job through our intelligent matching system'
      };
    } else if (user.role === 'RECRUITER') {
      return {
        title: '💼 Welcome to SwipeHire, Recruiter!',
        subtitle: 'Discover top talent for your open positions'
      };
    } else {
      return {
        title: '👋 Welcome to SwipeHire!',
        subtitle: 'Your campus recruitment platform'
      };
    }
  };

  const { title, subtitle } = getWelcomeMessage();

  const studentActions = [
    {
      title: 'Browse Jobs',
      description: 'Swipe through job opportunities that match your skills and interests',
      icon: '💼',
      href: '/jobs',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: 'My Matches',
      description: 'View companies that have shown interest in your profile',
      icon: '💕',
      href: '/matches',
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
    },
    {
      title: 'Interview Schedule',
      description: 'Manage your upcoming interviews and calendar',
      icon: '📅',
      href: '/interviews',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      title: 'Edit Profile',
      description: 'Update your skills, experience, and preferences',
      icon: '👤',
      href: '/profile',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    }
  ];

  const recruiterActions = [
    {
      title: 'Post a Job',
      description: 'Create a new job posting to attract top candidates',
      icon: '➕',
      href: '/jobs/create',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: 'My Job Posts',
      description: 'Manage your active job postings and track applications',
      icon: '📋',
      href: '/jobs/manage',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      title: 'Browse Candidates',
      description: 'Discover talented students for your open positions',
      icon: '🔍',
      href: '/candidates',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    },
    {
      title: 'My Matches',
      description: 'View students who have shown interest in your jobs',
      icon: '💕',
      href: '/matches',
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
    },
    {
      title: 'Schedule Interviews',
      description: 'Manage your interview slots and calendar',
      icon: '📅',
      href: '/interviews',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      title: 'Company Profile',
      description: 'Update your company information and recruiting preferences',
      icon: '🏢',
      href: '/profile',
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
    }
  ];

  const actions = user.role === 'STUDENT' ? studentActions : recruiterActions;

  const stats = [
    {
      label: user.role === 'STUDENT' ? 'Jobs Available' : 'Active Posts',
      value: user.role === 'STUDENT' ? '1,234' : '12',
      icon: '💼',
      color: 'text-blue-600'
    },
    {
      label: 'Matches',
      value: '8',
      icon: '💕',
      color: 'text-pink-600'
    },
    {
      label: 'Interviews',
      value: '3',
      icon: '📅',
      color: 'text-green-600'
    },
    {
      label: user.role === 'STUDENT' ? 'Profile Views' : 'Applications',
      value: user.role === 'STUDENT' ? '45' : '89',
      icon: '👁️',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`block p-6 border rounded-lg transition-colors ${action.color}`}
              >
                <div className="flex items-start">
                  <span className="text-3xl mr-4">{action.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          
          <div className="space-y-4">
            {user.role === 'STUDENT' ? (
              <>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600">💼</span>
                  <div>
                    <p className="text-sm font-medium">New job match: Frontend Developer at TechCorp</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                  <span className="text-pink-600">💕</span>
                  <div>
                    <p className="text-sm font-medium">You have a new match with Startup Inc!</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600">📅</span>
                  <div>
                    <p className="text-sm font-medium">Interview scheduled for tomorrow at 2:00 PM</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600">👤</span>
                  <div>
                    <p className="text-sm font-medium">Alice Johnson applied for Frontend Developer position</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                  <span className="text-pink-600">💕</span>
                  <div>
                    <p className="text-sm font-medium">New mutual match with candidate Bob Smith</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600">📅</span>
                  <div>
                    <p className="text-sm font-medium">Interview completed with Sarah Lee - Backend Developer</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Pro Tips</h2>
          
          {user.role === 'STUDENT' ? (
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Complete your profile with projects and skills to get better matches</p>
              <p>• Upload a resume and project links to stand out to recruiters</p>
              <p>• Be active on the platform - regular swiping improves your visibility</p>
              <p>• Prepare for interviews by researching the company and role</p>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Write detailed job descriptions with clear requirements</p>
              <p>• Use relevant skills tags to attract the right candidates</p>
              <p>• Set up interview time slots to streamline scheduling</p>
              <p>• Respond quickly to matches to maintain engagement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}