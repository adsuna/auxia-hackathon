import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../utils/jwt';
import { prisma } from '../lib/prisma';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export async function authenticateToken(
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    console.log('🔐 Auth middleware - Headers:', req.headers.authorization);
    const token = extractTokenFromHeader(req.headers.authorization);
    console.log('🔐 Auth middleware - Extracted token:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      console.log('🔐 Auth middleware - No token found');
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Access token required' 
      });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token' 
      });
      return;
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not found' 
      });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Authentication failed' 
    });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
}

export const requireStudent = requireRole(['STUDENT']);
export const requireRecruiter = requireRole(['RECRUITER']);
export const requireAdmin = requireRole(['ADMIN']);