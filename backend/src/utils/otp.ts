import crypto from 'crypto';

export interface OTPData {
  code: string;
  email: string;
  expiresAt: Date;
  attempts: number;
}

// In-memory store for OTPs (in production, use Redis)
const otpStore = new Map<string, OTPData>();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [key, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function storeOTP(email: string, code: string): void {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  otpStore.set(email.toLowerCase(), {
    code,
    email: email.toLowerCase(),
    expiresAt,
    attempts: 0
  });
}

export function verifyOTP(email: string, code: string): { valid: boolean; error?: string } {
  const normalizedEmail = email.toLowerCase();
  const otpData = otpStore.get(normalizedEmail);

  if (!otpData) {
    return { valid: false, error: 'OTP not found or expired' };
  }

  if (otpData.expiresAt < new Date()) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: 'OTP expired' };
  }

  if (otpData.attempts >= 3) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: 'Too many attempts' };
  }

  if (otpData.code !== code) {
    otpData.attempts++;
    return { valid: false, error: 'Invalid OTP' };
  }

  // OTP is valid, remove it from store
  otpStore.delete(normalizedEmail);
  return { valid: true };
}

export function hasValidOTP(email: string): boolean {
  const normalizedEmail = email.toLowerCase();
  const otpData = otpStore.get(normalizedEmail);
  return otpData !== undefined && otpData.expiresAt > new Date();
}