import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

/**
 * Database utility functions for common operations
 */

/**
 * Check if database connection is healthy
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Get database statistics for monitoring
 */
export async function getDatabaseStats() {
  try {
    const [
      userCount,
      studentCount,
      recruiterCount,
      jobCount,
      matchCount,
      interviewCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.studentProfile.count(),
      prisma.recruiterProfile.count(),
      prisma.job.count(),
      prisma.match.count(),
      prisma.interview.count()
    ]);

    return {
      users: userCount,
      students: studentCount,
      recruiters: recruiterCount,
      jobs: jobCount,
      matches: matchCount,
      interviews: interviewCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    throw error;
  }
}

/**
 * Execute database operations within a transaction
 */
export async function withTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback);
}

/**
 * Safely disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Reset database (for testing purposes only)
 */
export async function resetDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production');
  }

  // Delete in correct order to respect foreign key constraints
  await prisma.interview.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.match.deleteMany();
  await prisma.like.deleteMany();
  await prisma.exposure.deleteMany();
  await prisma.report.deleteMany();
  await prisma.job.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Common database error handler
 */
export function handleDatabaseError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new Error('A record with this information already exists');
      case 'P2025':
        throw new Error('Record not found');
      case 'P2003':
        throw new Error('Foreign key constraint failed');
      case 'P2014':
        throw new Error('Invalid ID provided');
      default:
        throw new Error(`Database error: ${error.message}`);
    }
  }
  
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new Error('Unknown database error occurred');
  }
  
  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new Error('Invalid data provided');
  }
  
  throw error;
}