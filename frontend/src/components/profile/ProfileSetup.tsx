'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import RoleSelection from './RoleSelection';
import StudentProfileForm from './StudentProfileForm';
import RecruiterProfileForm from './RecruiterProfileForm';

type SetupStep = 'role' | 'profile' | 'complete';

export default function ProfileSetup() {
  const [step, setStep] = useState<SetupStep>('role');
  const [userRole, setUserRole] = useState<'STUDENT' | 'RECRUITER' | null>(null);
  const { user, profileComplete } = useAuth();

  useEffect(() => {
    if (user?.role && user.role !== 'ADMIN') {
      setUserRole(user.role);
      if (profileComplete) {
        setStep('complete');
      } else {
        setStep('profile');
      }
    }
  }, [user, profileComplete]);

  const handleRoleSelected = (role: 'STUDENT' | 'RECRUITER') => {
    setUserRole(role);
    setStep('profile');
  };

  const handleProfileComplete = () => {
    setStep('complete');
  };

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Profile Complete!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your profile has been set up successfully. You can now start using SwipeHire Campus.
            </p>
          </div>
          <div>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'role') {
    return <RoleSelection onRoleSelected={handleRoleSelected} />;
  }

  if (step === 'profile' && userRole) {
    if (userRole === 'STUDENT') {
      return <StudentProfileForm onComplete={handleProfileComplete} />;
    } else {
      return <RecruiterProfileForm onComplete={handleProfileComplete} />;
    }
  }

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-600 mt-2">Loading...</p>
      </div>
    </div>
  );
}