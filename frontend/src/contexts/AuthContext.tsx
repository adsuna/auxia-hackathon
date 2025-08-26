'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN';
  verifiedAt: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  profileComplete: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; profileComplete: boolean } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE_STATUS'; payload: boolean }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string; profileComplete: boolean } };

const initialState: AuthState = {
  user: null,
  token: null,
  profileComplete: false,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        profileComplete: action.payload.profileComplete,
        isLoading: false,
        isAuthenticated: true,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'UPDATE_PROFILE_STATUS':
      return {
        ...state,
        profileComplete: action.payload,
      };
    
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        profileComplete: action.payload.profileComplete,
        isLoading: false,
        isAuthenticated: true,
      };
    
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfileStatus: (complete: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Import and update API client token
          const { apiClient } = await import('../lib/api');
          apiClient.setToken(token);
          
          dispatch({
            type: 'RESTORE_SESSION',
            payload: {
              user: data.user,
              token,
              profileComplete: data.profileComplete,
            },
          });
        } else {
          localStorage.removeItem('auth_token');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Session restore failed:', error);
        localStorage.removeItem('auth_token');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        
        // Import and update API client token
        const { apiClient } = await import('../lib/api');
        apiClient.setToken(data.token);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.user,
            token: data.token,
            profileComplete: data.profileComplete,
          },
        });
        return { success: true };
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    
    // Import and clear API client token
    const { apiClient } = await import('../lib/api');
    apiClient.clearToken();
    
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfileStatus = (complete: boolean) => {
    dispatch({ type: 'UPDATE_PROFILE_STATUS', payload: complete });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateProfileStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}