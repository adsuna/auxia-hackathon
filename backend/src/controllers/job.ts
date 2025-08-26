import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { JobData, APIResponse } from '../types';
import { RankingService } from '../services/ranking';
import { FilterService } from '../services/filters';

// Create a new job posting
export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, description, skills, batch, location, ctcMin, ctcMax, videoUrl }: JobData = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      } as APIResponse);
    }

    // Validate required fields
    if (!title || !description || !skills || !Array.isArray(skills) || skills.length === 0 || !location || ctcMin === undefined || ctcMax === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, skills, location, ctcMin, ctcMax'
      } as APIResponse);
    }

    // Validate CTC range
    if (ctcMin < 0 || ctcMax < 0 || ctcMin > ctcMax) {
      return res.status(400).json({
        success: false,
        error: 'Invalid CTC range'
      } as APIResponse);
    }

    // Validate batch if provided
    if (batch !== undefined && (batch < 2020 || batch > 2030)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid batch year'
      } as APIResponse);
    }

    // Validate skills array
    if (skills.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'All skills must be non-empty strings'
      } as APIResponse);
    }

    // Validate video URL if provided
    if (videoUrl && !isValidUrl(videoUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid video URL format'
      } as APIResponse);
    }

    // Check if user is a recruiter
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { recruiterProfile: true }
    });

    if (!user || user.role !== 'RECRUITER' || !user.recruiterProfile) {
      return res.status(403).json({
        success: false,
        error: 'Only recruiters can create job postings'
      } as APIResponse);
    }

    // Create the job
    const jobData: any = {
      recruiterId: userId,
      title: title.trim(),
      description: description.trim(),
      skills: skills.map(skill => skill.trim()),
      location: location.trim(),
      ctcMin,
      ctcMax
    };

    if (batch !== undefined) {
      jobData.batch = batch;
    }

    if (videoUrl?.trim()) {
      jobData.videoUrl = videoUrl.trim();
    }

    const job = await prisma.job.create({
      data: jobData,
      include: {
        recruiter: {
          include: {
            recruiterProfile: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: job,
      message: 'Job created successfully'
    } as APIResponse);

  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as APIResponse);
  }
};

// Get jobs for a recruiter
export const getRecruiterJobs = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      } as APIResponse);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    // Get jobs for the recruiter
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { recruiterId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              matches: true,
              slots: true
            }
          }
        }
      }),
      prisma.job.count({
        where: { recruiterId: userId }
      })
    ]);

    return res.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + jobs.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as APIResponse);
  }
};

// Update a job
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, skills, batch, location, ctcMin, ctcMax, videoUrl }: Partial<JobData> = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      } as APIResponse);
    }

    // Check if job exists and belongs to the user
    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        recruiterId: userId
      }
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or unauthorized'
      } as APIResponse);
    }

    // Validate fields if provided
    const updateData: any = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Title cannot be empty'
        } as APIResponse);
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Description cannot be empty'
        } as APIResponse);
      }
      updateData.description = description.trim();
    }

    if (skills !== undefined) {
      if (!Array.isArray(skills) || skills.length === 0 || skills.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
        return res.status(400).json({
          success: false,
          error: 'Skills must be a non-empty array of strings'
        } as APIResponse);
      }
      updateData.skills = skills.map(skill => skill.trim());
    }

    if (batch !== undefined) {
      if (batch !== null && (batch < 2020 || batch > 2030)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid batch year'
        } as APIResponse);
      }
      updateData.batch = batch;
    }

    if (location !== undefined) {
      if (!location.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Location cannot be empty'
        } as APIResponse);
      }
      updateData.location = location.trim();
    }

    if (ctcMin !== undefined) {
      if (ctcMin < 0) {
        return res.status(400).json({
          success: false,
          error: 'Minimum CTC cannot be negative'
        } as APIResponse);
      }
      updateData.ctcMin = ctcMin;
    }

    if (ctcMax !== undefined) {
      if (ctcMax < 0) {
        return res.status(400).json({
          success: false,
          error: 'Maximum CTC cannot be negative'
        } as APIResponse);
      }
      updateData.ctcMax = ctcMax;
    }

    // Validate CTC range if both are being updated
    const finalCtcMin = ctcMin !== undefined ? ctcMin : existingJob.ctcMin;
    const finalCtcMax = ctcMax !== undefined ? ctcMax : existingJob.ctcMax;
    
    if (finalCtcMin > finalCtcMax) {
      return res.status(400).json({
        success: false,
        error: 'Minimum CTC cannot be greater than maximum CTC'
      } as APIResponse);
    }

    if (videoUrl !== undefined) {
      if (videoUrl && !isValidUrl(videoUrl)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid video URL format'
        } as APIResponse);
      }
      updateData.videoUrl = videoUrl?.trim() || null;
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        recruiter: {
          include: {
            recruiterProfile: true
          }
        }
      }
    });

    return res.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    } as APIResponse);

  } catch (error) {
    console.error('Error updating job:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as APIResponse);
  }
};

// Delete a job
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      } as APIResponse);
    }

    // Check if job exists and belongs to the user
    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        recruiterId: userId
      },
      include: {
        _count: {
          select: {
            matches: true,
            slots: true
          }
        }
      }
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or unauthorized'
      } as APIResponse);
    }

    // Check if job has active matches or slots
    if (existingJob._count.matches > 0 || existingJob._count.slots > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete job with existing matches or slots'
      } as APIResponse);
    }

    // Delete the job
    await prisma.job.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Job deleted successfully'
    } as APIResponse);

  } catch (error) {
    console.error('Error deleting job:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as APIResponse);
  }
};

// Get a single job by ID
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      } as APIResponse);
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        recruiter: {
          include: {
            recruiterProfile: true
          }
        },
        _count: {
          select: {
            matches: true,
            slots: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      } as APIResponse);
    }

    // Check if user can access this job
    // Recruiters can see their own jobs, students can see all jobs
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      } as APIResponse);
    }

    if (user.role === 'RECRUITER' && job.recruiterId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view this job'
      } as APIResponse);
    }

    return res.json({
      success: true,
      data: job
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching job:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as APIResponse);
  }
};

// Get job feed for students with intelligent ranking and filtering
export const getJobFeed = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      } as APIResponse);
    }

    // Get user profile to determine filtering criteria
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true
      }
    });

    if (!user || user.role !== 'STUDENT' || !user.studentProfile) {
      return res.status(403).json({
        success: false,
        error: 'Only students can access job feed'
      } as APIResponse);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const explorationRatio = parseFloat(req.query.exploration as string) || 0.2;

    const studentProfile = user.studentProfile;
    
    // Initialize filter service
    const filterService = new FilterService(prisma);

    // Check rate limiting
    const remainingLikes = await filterService.getRemainingLikes(userId);
    
    // Get filtered jobs using hard filters
    const filteredJobs = await filterService.getFilteredJobsForStudent({
      userId,
      userRole: 'student',
      studentYear: studentProfile.year,
      page,
      limit: limit * 2 // Get more jobs for better ranking
    });

    if (filteredJobs.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          hasMore: false
        },
        remainingLikes,
        message: 'No more jobs available'
      });
    }

    // Convert to ranking service format
    const jobProfiles = filteredJobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      skills: job.skills,
      batch: job.batch,
      location: job.location,
      ctcMin: job.ctcMin,
      ctcMax: job.ctcMax,
      createdAt: job.createdAt
    }));

    const studentRankingProfile = {
      id: studentProfile.userId,
      name: studentProfile.name,
      branch: studentProfile.branch,
      year: studentProfile.year,
      headline: studentProfile.headline,
      skills: studentProfile.skills,
      projectUrl: studentProfile.projectUrl,
      createdAt: user.createdAt
    };

    // Get impression counts for new profile boost
    const jobIds = jobProfiles.map(job => job.id);
    const impressionCounts = await filterService.getImpressionCounts('job', jobIds);

    // Initialize TF-IDF vocabulary if needed (should be done on app startup)
    await RankingService.initializeVocabulary([studentRankingProfile], jobProfiles);

    // Rank jobs using intelligent scoring
    const rankedJobs = RankingService.rankJobsForStudent(
      studentRankingProfile,
      jobProfiles,
      impressionCounts,
      explorationRatio
    );

    // TODO: Fix company diversity filter - temporarily disabled
    // Apply company diversity filter
    // const diverseJobs = filterService.applyCompanyDiversityFilter(
    //   rankedJobs.map(scored => {
    //     const originalJob = filteredJobs.find(job => job.id === scored.item.id);
    //     return {
    //       ...scored,
    //       recruiter: originalJob?.recruiter || { org: 'Unknown', name: '', title: '' }
    //     };
    //   }),
    //   3
    // );

    // Limit to requested page size - using rankedJobs directly for now
    const paginatedJobs = rankedJobs.slice(0, limit);

    // Record exposures for analytics
    await Promise.all(
      paginatedJobs.map(scored => 
        filterService.recordExposure(userId, 'job', scored.item.id)
      )
    );

    // Format response with ranking information
    const responseData = paginatedJobs.map(scored => {
      const originalJob = filteredJobs.find(job => job.id === scored.item.id);
      return {
        ...originalJob,
        matchScore: scored.score,
        ranking: {
          skillsScore: scored.breakdown.skillsScore,
          textScore: scored.breakdown.textScore,
          eligibilityScore: scored.breakdown.eligibilityScore,
          freshnessScore: scored.breakdown.freshnessScore,
          newProfileBoost: scored.breakdown.newProfileBoost
        }
      };
    });

    return res.json({
      success: true,
      data: responseData,
      pagination: {
        page,
        limit,
        total: filteredJobs.length,
        hasMore: page * limit < filteredJobs.length
      },
      remainingLikes,
      filters: {
        explorationRatio,
        diversityEnabled: true,
        maxPerCompany: 3
      }
    });

  } catch (error) {
    console.error('Error fetching job feed:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as APIResponse);
  }
};

// Get student feed for recruiters with intelligent ranking
export const getStudentFeed = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      } as APIResponse);
    }

    // Get user profile to determine filtering criteria
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        recruiterProfile: true
      }
    });

    if (!user || user.role !== 'RECRUITER' || !user.recruiterProfile) {
      return res.status(403).json({
        success: false,
        error: 'Only recruiters can access student feed'
      } as APIResponse);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const explorationRatio = parseFloat(req.query.exploration as string) || 0.2;
    const jobId = req.query.jobId as string;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Job ID is required to get student feed'
      } as APIResponse);
    }

    // Get the job to use for ranking
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        recruiterId: userId
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or unauthorized'
      } as APIResponse);
    }

    // Initialize filter service
    const filterService = new FilterService(prisma);

    // Check rate limiting
    const remainingLikes = await filterService.getRemainingLikes(userId);

    // Get filtered students using hard filters
    const filteredStudents = await filterService.getFilteredStudentsForRecruiter({
      userId,
      userRole: 'recruiter',
      jobBatch: job.batch || undefined,
      page,
      limit: limit * 2 // Get more students for better ranking
    });

    if (filteredStudents.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          hasMore: false
        },
        remainingLikes,
        message: 'No more students available'
      });
    }

    // Convert to ranking service format
    const jobProfile = {
      id: job.id,
      title: job.title,
      description: job.description,
      skills: job.skills,
      batch: job.batch,
      location: job.location,
      ctcMin: job.ctcMin,
      ctcMax: job.ctcMax,
      createdAt: job.createdAt
    };

    const studentProfiles = filteredStudents.map(student => ({
      id: student.userId,
      name: student.name,
      branch: student.branch,
      year: student.year,
      headline: student.headline,
      skills: student.skills,
      projectUrl: student.projectUrl,
      createdAt: (student as any).user?.createdAt || new Date()
    }));

    // Get impression counts for new profile boost
    const studentIds = studentProfiles.map(student => student.id);
    const impressionCounts = await filterService.getImpressionCounts('student', studentIds);

    // Initialize TF-IDF vocabulary if needed
    await RankingService.initializeVocabulary(studentProfiles, [jobProfile]);

    // Rank students using intelligent scoring
    const rankedStudents = RankingService.rankStudentsForJob(
      jobProfile,
      studentProfiles,
      impressionCounts,
      explorationRatio
    );

    // Limit to requested page size
    const paginatedStudents = rankedStudents.slice(0, limit);

    // Record exposures for analytics
    await Promise.all(
      paginatedStudents.map(scored => 
        filterService.recordExposure(userId, 'student', scored.item.id)
      )
    );

    // Format response with ranking information
    const responseData = paginatedStudents.map(scored => {
      const originalStudent = filteredStudents.find(student => student.userId === scored.item.id);
      return {
        ...originalStudent,
        matchScore: scored.score,
        ranking: {
          skillsScore: scored.breakdown.skillsScore,
          textScore: scored.breakdown.textScore,
          eligibilityScore: scored.breakdown.eligibilityScore,
          freshnessScore: scored.breakdown.freshnessScore,
          newProfileBoost: scored.breakdown.newProfileBoost
        }
      };
    });

    return res.json({
      success: true,
      data: responseData,
      pagination: {
        page,
        limit,
        total: filteredStudents.length,
        hasMore: page * limit < filteredStudents.length
      },
      remainingLikes,
      job: {
        id: job.id,
        title: job.title,
        skills: job.skills
      },
      filters: {
        explorationRatio,
        jobBatch: job.batch
      }
    });

  } catch (error) {
    console.error('Error fetching student feed:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as APIResponse);
  }
};

// Helper function to validate URLs
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}