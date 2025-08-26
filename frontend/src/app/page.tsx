'use client';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import ProfileSetup from '../components/profile/ProfileSetup';
import { useAuth } from '../hooks/useAuth';

function Dashboard() {
  const { user, logout, profileComplete } = useAuth();

  // Show profile setup if profile is not complete
  if (!profileComplete) {
    return <ProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to SwipeHire Campus
            </h1>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Logout
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Authentication System Active! 🎉
            </h2>
            <p className="text-blue-700">
              You have successfully logged in with email OTP authentication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">User Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Role:</span> {user?.role}</p>
                <p><span className="font-medium">User ID:</span> {user?.id}</p>
                <p><span className="font-medium">Verified:</span> {user?.verifiedAt ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Authentication Features</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Email OTP verification</li>
                <li>✅ JWT token authentication</li>
                <li>✅ Protected routes</li>
                <li>✅ Role-based access control</li>
                <li>✅ Session persistence</li>
                <li>✅ Automatic token refresh</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-900 mb-2">Next Steps</h3>
            <p className="text-green-700 text-sm">
              The authentication system is now complete and ready for the next tasks:
              user profile management, job posting system, and the matching algorithm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}