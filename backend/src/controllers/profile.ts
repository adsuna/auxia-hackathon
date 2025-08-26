import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { RecruiterProfileData } from '../types';

// Validation helpers
function validateStudentProfile(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!data.branch || typeof data.branch !== 'string' || data.branch.trim().length < 2) {
    errors.push('Branch must be at least 2 characters long');
  }

  if (!data.year || typeof data.year !== 'number' || data.year < 1 || data.year > 5) {
    errors.push('Year must be between 1 and 5');
  }

  if (!data.headline || typeof data.headline !== 'string' || data.headline.trim().length < 10) {
    errors.push('Headline must be at least 10 characters long');
  }

  if (!Array.isArray(data.skills) || data.skills.length < 5 || data.skills.length > 8) {
    errors.push('Skills must be an array with 5-8 items');
  } else {
    const invalidSkills = data.skills.filter((skill: any) => 
      typeof skill !== 'string' || skill.trim().length < 2
    );
    if (invalidSkills.length > 0) {
      errors.push('All skills must be at least 2 characters long');
    }
  }

  if (data.projectUrl && (typeof data.projectUrl !== 'string' || !isValidUrl(data.projectUrl))) {
    errors.push('Project URL must be a valid URL');
  }

  if (data.resumeUrl && (typeof data.resumeUrl !== 'string' || !isValidUrl(data.resumeUrl))) {
    errors.push('Resume URL must be a valid URL');
  }

  if (data.videoUrl && (typeof data.videoUrl !== 'string' || !isValidUrl(data.videoUrl))) {
    errors.push('Video URL must be a valid URL');
  }

  return { valid: errors.length === 0, errors };
}

function validateRecruiterProfile(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!data.org || typeof data.org !== 'string' || data.org.trim().length < 2) {
    errors.push('Organization must be at least 2 characters long');
  }

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 2) {
    errors.push('Title must be at least 2 characters long');
  }

  return { valid: errors.length === 0, errors };
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

function sanitizeSkills(skills: string[]): string[] {
  return skills
    .map(skill => sanitizeString(skill))
    .filter(skill => skill.length >= 2)
    .slice(0, 8); // Ensure max 8 skills
}

export async function createStudentProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    // Check if user is a student
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { studentProfile: true }
    });

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
      return;
    }

    if (user.role !== 'STUDENT') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Only students can create student profiles'
      });
      return;
    }

    if (user.studentProfile) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Student profile already exists'
      });
      return;
    }

    // Validate input
    console.log('📝 Profile data received:', req.body);
    const validation = validateStudentProfile(req.body);
    console.log('✅ Validation result:', validation);
    
    if (!validation.valid) {
      console.log('❌ Validation failed:', validation.errors);
      res.status(422).json({
        error: 'Validation Error',
        message: 'Invalid profile data',
        details: validation.errors
      });
      return;
    }

    // Sanitize data
    const profileData: any = {
      name: sanitizeString(req.body.name),
      branch: sanitizeString(req.body.branch),
      year: req.body.year,
      headline: sanitizeString(req.body.headline),
      skills: sanitizeSkills(req.body.skills),
    };

    if (req.body.projectUrl) {
      profileData.projectUrl = sanitizeString(req.body.projectUrl);
    }
    if (req.body.resumeUrl) {
      profileData.resumeUrl = sanitizeString(req.body.resumeUrl);
    }
    if (req.body.videoUrl) {
      profileData.videoUrl = sanitizeString(req.body.videoUrl);
    }

    // Create profile
    const profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        ...profileData
      }
    });

    res.status(201).json({
      success: true,
      data: profile,
      message: 'Student profile created successfully'
    });

  } catch (error) {
    console.error('Create student profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create student profile'
    });
  }
}

export async function createRecruiterProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    // Check if user is a recruiter
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { recruiterProfile: true }
    });

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
      return;
    }

    if (user.role !== 'RECRUITER') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Only recruiters can create recruiter profiles'
      });
      return;
    }

    if (user.recruiterProfile) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Recruiter profile already exists'
      });
      return;
    }

    // Validate input
    const validation = validateRecruiterProfile(req.body);
    if (!validation.valid) {
      res.status(422).json({
        error: 'Validation Error',
        message: 'Invalid profile data',
        details: validation.errors
      });
      return;
    }

    // Sanitize data
    const profileData: RecruiterProfileData = {
      name: sanitizeString(req.body.name),
      org: sanitizeString(req.body.org),
      title: sanitizeString(req.body.title),
    };

    // Create profile
    const profile = await prisma.recruiterProfile.create({
      data: {
        userId: user.id,
        ...profileData
      }
    });

    res.status(201).json({
      success: true,
      data: profile,
      message: 'Recruiter profile created successfully'
    });

  } catch (error) {
    console.error('Create recruiter profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create recruiter profile'
    });
  }
}

export async function updateStudentProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    // Check if user is a student and has a profile
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { studentProfile: true }
    });

    if (!user || user.role !== 'STUDENT') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Only students can update student profiles'
      });
      return;
    }

    if (!user.studentProfile) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Student profile not found'
      });
      return;
    }

    // Validate input
    const validation = validateStudentProfile(req.body);
    if (!validation.valid) {
      res.status(422).json({
        error: 'Validation Error',
        message: 'Invalid profile data',
        details: validation.errors
      });
      return;
    }

    // Sanitize data
    const profileData: any = {
      name: sanitizeString(req.body.name),
      branch: sanitizeString(req.body.branch),
      year: req.body.year,
      headline: sanitizeString(req.body.headline),
      skills: sanitizeSkills(req.body.skills),
    };

    if (req.body.projectUrl) {
      profileData.projectUrl = sanitizeString(req.body.projectUrl);
    }
    if (req.body.resumeUrl) {
      profileData.resumeUrl = sanitizeString(req.body.resumeUrl);
    }
    if (req.body.videoUrl) {
      profileData.videoUrl = sanitizeString(req.body.videoUrl);
    }

    // Update profile
    const profile = await prisma.studentProfile.update({
      where: { userId: user.id },
      data: profileData
    });

    res.json({
      success: true,
      data: profile,
      message: 'Student profile updated successfully'
    });

  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update student profile'
    });
  }
}

export async function updateRecruiterProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    // Check if user is a recruiter and has a profile
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { recruiterProfile: true }
    });

    if (!user || user.role !== 'RECRUITER') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Only recruiters can update recruiter profiles'
      });
      return;
    }

    if (!user.recruiterProfile) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Recruiter profile not found'
      });
      return;
    }

    // Validate input
    const validation = validateRecruiterProfile(req.body);
    if (!validation.valid) {
      res.status(422).json({
        error: 'Validation Error',
        message: 'Invalid profile data',
        details: validation.errors
      });
      return;
    }

    // Sanitize data
    const profileData: RecruiterProfileData = {
      name: sanitizeString(req.body.name),
      org: sanitizeString(req.body.org),
      title: sanitizeString(req.body.title),
    };

    // Update profile
    const profile = await prisma.recruiterProfile.update({
      where: { userId: user.id },
      data: profileData
    });

    res.json({
      success: true,
      data: profile,
      message: 'Recruiter profile updated successfully'
    });

  } catch (error) {
    console.error('Update recruiter profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update recruiter profile'
    });
  }
}

export async function setUserRole(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const { role } = req.body;

    if (!role || !['STUDENT', 'RECRUITER'].includes(role)) {
      res.status(422).json({
        error: 'Validation Error',
        message: 'Role must be either STUDENT or RECRUITER'
      });
      return;
    }

    // Check if user exists and doesn't already have a role set
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        studentProfile: true,
        recruiterProfile: true
      }
    });

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
      return;
    }

    // Allow role change only if no profile exists yet
    if (user.studentProfile || user.recruiterProfile) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Cannot change role after profile is created'
      });
      return;
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: role as 'STUDENT' | 'RECRUITER' }
    });

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        verifiedAt: updatedUser.verifiedAt
      },
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('Set user role error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user role'
    });
  }
}