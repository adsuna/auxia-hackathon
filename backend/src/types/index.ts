export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN';
  profileComplete: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface OTPRequest {
  email: string;
}

export interface OTPVerification {
  email: string;
  code: string;
}

export interface StudentProfileData {
  name: string;
  branch: string;
  year: number;
  headline: string;
  skills: string[];
  projectUrl?: string;
  resumeUrl?: string;
  videoUrl?: string;
}

export interface RecruiterProfileData {
  name: string;
  org: string;
  title: string;
}

export interface JobData {
  title: string;
  description: string;
  skills: string[];
  batch?: number;
  location: string;
  ctcMin: number;
  ctcMax: number;
  videoUrl?: string;
}

export interface LikeRequest {
  toType: 'JOB' | 'STUDENT';
  toId: string;
}

export interface SlotData {
  jobId: string;
  startTs: Date;
  endTs: Date;
}

export interface BookingRequest {
  matchId: string;
  slotId: string;
}