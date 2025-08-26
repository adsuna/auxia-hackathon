/**
 * Database filtering service for implementing hard filters
 * for role eligibility and seen content prevention
 */

import { PrismaClient } from '@prisma/client';

export interface FilterOptions {
  userId: string;
  userRole: 'student' | 'recruiter';
  page?: number;
  limit?: number;
  excludeCompanies?: string[];
}

export interface StudentFilterOptions extends FilterOptions {
  studentYear?: number;
}

export interface JobFilterOptions extends FilterOptions {
  jobBatch?: number;
}

export class FilterService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get filtered jobs for a student with hard filters applied
   */
  async getFilteredJobsForStudent(options: StudentFilterOptions) {
    const { userId, studentYear, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Get jobs with hard filters applied
    const jobs = await this.prisma.job.findMany({
      where: {
        // Exclude jobs from the same user (if student is also a recruiter)
        recruiterId: {
          not: userId
        },
        // Batch eligibility filter
        OR: [
          { batch: null }, // Jobs open to all batches
          { batch: studentYear } // Jobs matching student's year
        ],
        // Exclude already liked jobs
        NOT: {
          likes: {
            some: {
              fromUser: userId,
              toType: 'job'
            }
          }
        },
        // Exclude jobs hidden due to dislikes (within 7 days)
        NOT: {
          likes: {
            some: {
              fromUser: userId,
              toType: 'job',
              stage: -1, // Dislike
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
              }
            }
          }
        }
      },
      include: {
        recruiter: {
          select: {
            name: true,
            org: true,
            title: true
          }
        },
        _count: {
          select: {
            exposures: {
              where: {
                userId: userId
              }
            }
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc' // Default ordering, will be re-ranked by scoring algorithm
      }
    });

    return jobs;
  }

  /**
   * Get filtered students for a recruiter with hard filters applied
   */
  async getFilteredStudentsForRecruiter(options: JobFilterOptions) {
    const { userId, jobBatch, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Get students with hard filters applied
    const students = await this.prisma.studentProfile.findMany({
      where: {
        // Exclude the recruiter themselves (if they have a student profile)
        userId: {
          not: userId
        },
        // Batch eligibility filter
        OR: [
          { year: jobBatch }, // Students matching job's target batch
          { year: null } // Handle edge case where year is not set
        ],
        // Exclude already liked students
        user: {
          NOT: {
            likesReceived: {
              some: {
                fromUser: userId,
                toType: 'student'
              }
            }
          }
        },
        // Exclude students hidden due to dislikes (within 7 days)
        user: {
          NOT: {
            likesReceived: {
              some: {
                fromUser: userId,
                toType: 'student',
                stage: -1, // Dislike
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
                }
              }
            }
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
            _count: {
              select: {
                exposures: {
                  where: {
                    userId: userId // Count exposures from this recruiter
                  }
                }
              }
            }
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: {
        user: {
          createdAt: 'desc' // Default ordering, will be re-ranked by scoring algorithm
        }
      }
    });

    return students;
  }

  /**
   * Check if a user has already liked a specific entity
   */
  async hasUserLikedEntity(
    userId: string, 
    entityType: 'job' | 'student', 
    entityId: string
  ): Promise<boolean> {
    const like = await this.prisma.like.findFirst({
      where: {
        fromUser: userId,
        toType: entityType,
        toId: entityId,
        stage: {
          gte: 0 // Only positive likes (not dislikes)
        }
      }
    });

    return like !== null;
  }

  /**
   * Check if a user has disliked an entity within the cooldown period
   */
  async isEntityInCooldown(
    userId: string, 
    entityType: 'job' | 'student', 
    entityId: string,
    cooldownDays: number = 7
  ): Promise<boolean> {
    const dislike = await this.prisma.like.findFirst({
      where: {
        fromUser: userId,
        toType: entityType,
        toId: entityId,
        stage: -1, // Dislike
        createdAt: {
          gte: new Date(Date.now() - cooldownDays * 24 * 60 * 60 * 1000)
        }
      }
    });

    return dislike !== null;
  }

  /**
   * Get impression count for entities (for new profile boost calculation)
   */
  async getImpressionCounts(
    entityType: 'job' | 'student',
    entityIds: string[]
  ): Promise<Map<string, number>> {
    const exposures = await this.prisma.exposure.groupBy({
      by: ['entityId'],
      where: {
        entityType: entityType,
        entityId: {
          in: entityIds
        }
      },
      _count: {
        entityId: true
      }
    });

    const impressionMap = new Map<string, number>();
    exposures.forEach(exposure => {
      impressionMap.set(exposure.entityId, exposure._count.entityId);
    });

    // Ensure all requested entities have a count (default to 0)
    entityIds.forEach(id => {
      if (!impressionMap.has(id)) {
        impressionMap.set(id, 0);
      }
    });

    return impressionMap;
  }

  /**
   * Record an exposure (impression) for analytics and filtering
   */
  async recordExposure(
    userId: string,
    entityType: 'job' | 'student',
    entityId: string
  ): Promise<void> {
    try {
      await this.prisma.exposure.create({
        data: {
          userId,
          entityType,
          entityId,
          shownAt: new Date()
        }
      });
    } catch (error) {
      // Ignore duplicate exposures (if there's a unique constraint)
      console.warn('Failed to record exposure:', error);
    }
  }

  /**
   * Get user's daily like count for rate limiting
   */
  async getDailyLikeCount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await this.prisma.like.count({
      where: {
        fromUser: userId,
        stage: {
          gte: 0 // Only count positive likes
        },
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    return count;
  }

  /**
   * Check if user has reached daily like limit
   */
  async hasReachedDailyLikeLimit(
    userId: string, 
    dailyLimit: number = 30
  ): Promise<boolean> {
    const dailyCount = await this.getDailyLikeCount(userId);
    return dailyCount >= dailyLimit;
  }

  /**
   * Get remaining likes for the day
   */
  async getRemainingLikes(
    userId: string, 
    dailyLimit: number = 30
  ): Promise<number> {
    const dailyCount = await this.getDailyLikeCount(userId);
    return Math.max(0, dailyLimit - dailyCount);
  }

  /**
   * Apply company diversity filter to jobs
   */
  applyCompanyDiversityFilter<T extends { recruiter: { org: string } }>(
    items: T[],
    maxPerCompany: number = 3
  ): T[] {
    const companyCount = new Map<string, number>();
    const result: T[] = [];

    for (const item of items) {
      const company = item.recruiter.org;
      const currentCount = companyCount.get(company) || 0;
      
      if (currentCount < maxPerCompany) {
        result.push(item);
        companyCount.set(company, currentCount + 1);
      }
    }

    return result;
  }
}