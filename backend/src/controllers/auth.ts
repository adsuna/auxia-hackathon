import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { generateToken } from '../utils/jwt';

export async function loginOrSignup(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Valid email is required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid email format'
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find or create user
    let user = await UserService.findUserByEmail(normalizedEmail);
    let studentProfile;
    let recruiterProfile;

    if (!user) {
      // Create new user
      user = await UserService.createUser(normalizedEmail);
      await UserService.verifyUser(user.id);
      user.verifiedAt = new Date();
    } else if (!user.verifiedAt) {
      // Mark existing user as verified
      await UserService.verifyUser(user.id);
      user.verifiedAt = new Date();
    }

    // Get profiles
    if (user.role === 'STUDENT') {
      studentProfile = await UserService.getStudentProfile(user.id);
    } else if (user.role === 'RECRUITER') {
      recruiterProfile = await UserService.getRecruiterProfile(user.id);
    }

    // Generate JWT token
    const token = generateToken(user);

    // Determine if profile is complete
    const profileComplete = user.role === 'STUDENT' 
      ? !!studentProfile 
      : user.role === 'RECRUITER' 
        ? !!recruiterProfile 
        : true;

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        verifiedAt: user.verifiedAt
      },
      profileComplete
    });

  } catch (error) {
    console.error('Login/Signup error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login or signup'
    });
  }
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const userWithProfile = await UserService.getUserWithProfile(req.user.userId);

    if (!userWithProfile) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
      return;
    }

    const { user, studentProfile, recruiterProfile } = userWithProfile;

    const profileComplete = user.role === 'STUDENT' 
      ? !!studentProfile 
      : user.role === 'RECRUITER' 
        ? !!recruiterProfile 
        : true;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        verifiedAt: user.verifiedAt
      },
      profile: user.role === 'STUDENT' ? studentProfile : recruiterProfile,
      profileComplete
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user information'
    });
  }
}