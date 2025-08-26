'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) return null;

  const studentLinks = [
    { href: '/dashboard', label: '🏠 Dashboard', active: false },
    { href: '/feed', label: '💼 Browse Jobs', active: false },
    { href: '/matches', label: '💕 My Matches', active: false },
    { href: '/interviews', label: '📅 Interviews', active: false }
  ];

  const recruiterLinks = [
    { href: '/dashboard', label: '🏠 Dashboard', active: false },
    { href: '/jobs/manage', label: '📋 My Jobs', active: false },
    { href: '/jobs/create', label: '➕ Post Job', active: false },
    { href: '/matches', label: '💕 Matches', active: false },
    { href: '/interviews', label: '📅 Interviews', active: false }
  ];

  const links = user.role === 'STUDENT' ? studentLinks : recruiterLinks;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">SwipeHire</span>
              <span className="ml-2 text-sm text-gray-500">Campus</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {user.role === 'STUDENT' ? '🎓' : '💼'} {user.email}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/profile')}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Profile Settings"
              >
                👤
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Logout"
              >
                🚪
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2" />
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              👤 Profile Settings
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
            >
              🚪 Logout
            </button>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="text-sm text-gray-600">
              Logged in as {user.role === 'STUDENT' ? 'Student' : 'Recruiter'}
            </div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      )}
    </nav>
  );
}