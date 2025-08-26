import { useAuth as useAuthContext } from '../contexts/AuthContext';

// Re-export the useAuth hook for convenience
export const useAuth = useAuthContext;

// Additional auth-related hooks can be added here
export function useRequireAuth() {
  const auth = useAuthContext();
  
  if (!auth.isAuthenticated && !auth.isLoading) {
    throw new Error('Authentication required');
  }
  
  return auth;
}

export function useRequireRole(requiredRole: string) {
  const auth = useRequireAuth();
  
  if (auth.user?.role !== requiredRole) {
    throw new Error(`Role ${requiredRole} required`);
  }
  
  return auth;
}

export function useIsStudent() {
  const auth = useAuthContext();
  return auth.user?.role === 'STUDENT';
}

export function useIsRecruiter() {
  const auth = useAuthContext();
  return auth.user?.role === 'RECRUITER';
}

export function useIsAdmin() {
  const auth = useAuthContext();
  return auth.user?.role === 'ADMIN';
}