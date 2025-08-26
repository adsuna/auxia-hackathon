const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    console.log('🔗 API Client - Setting token:', token.substring(0, 20) + '...');
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('🔗 API Client - Sending token:', this.token.substring(0, 20) + '...');
    } else {
      console.log('🔗 API Client - No token available');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          message: data.message,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new APIClient(API_BASE_URL);

// Profile API methods
export const profileAPI = {
  setRole: (role: 'STUDENT' | 'RECRUITER') => 
    apiClient.post('/profile/role', { role }),
  
  createStudentProfile: (data: {
    name: string;
    branch: string;
    year: number;
    headline: string;
    skills: string[];
    projectUrl?: string;
    resumeUrl?: string;
    videoUrl?: string;
  }) => apiClient.post('/profile/student', data),
  
  updateStudentProfile: (data: {
    name: string;
    branch: string;
    year: number;
    headline: string;
    skills: string[];
    projectUrl?: string;
    resumeUrl?: string;
    videoUrl?: string;
  }) => apiClient.put('/profile/student', data),
  
  createRecruiterProfile: (data: {
    name: string;
    org: string;
    title: string;
  }) => apiClient.post('/profile/recruiter', data),
  
  updateRecruiterProfile: (data: {
    name: string;
    org: string;
    title: string;
  }) => apiClient.put('/profile/recruiter', data),
};

// Job API methods
export const jobAPI = {
  createJob: (data: {
    title: string;
    description: string;
    skills: string[];
    batch?: number;
    location: string;
    ctcMin: number;
    ctcMax: number;
    videoUrl?: string;
  }) => apiClient.post('/jobs', data),
  
  getMyJobs: (page = 1, limit = 20) => 
    apiClient.get(`/jobs/my-jobs?page=${page}&limit=${limit}`),
  
  getJobFeed: (params?: {
    page?: number;
    limit?: number;
    skills?: string[];
    year?: number;
    batch?: number;
    skillsFilter?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.skills) searchParams.set('skills', params.skills.join(','));
    if (params?.year) searchParams.set('year', params.year.toString());
    if (params?.batch) searchParams.set('batch', params.batch.toString());
    if (params?.skillsFilter) searchParams.set('skillsFilter', 'true');
    
    return apiClient.get(`/jobs/feed?${searchParams.toString()}`);
  },
  
  getJobById: (id: string) => 
    apiClient.get(`/jobs/${id}`),
  
  updateJob: (id: string, data: {
    title?: string;
    description?: string;
    skills?: string[];
    batch?: number;
    location?: string;
    ctcMin?: number;
    ctcMax?: number;
    videoUrl?: string;
  }) => apiClient.put(`/jobs/${id}`, data),
  
  deleteJob: (id: string) => 
    apiClient.delete(`/jobs/${id}`),
};