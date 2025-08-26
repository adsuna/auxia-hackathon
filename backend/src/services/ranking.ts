/**
 * Ranking service that implements the intelligent scoring algorithm
 * combining skills, text, eligibility, and freshness factors
 */

import { jaccardSimilarity } from '../utils/similarity';
import { globalTFIDFMatcher } from '../utils/tfidf';

export interface StudentProfile {
  id: string;
  name: string;
  branch: string;
  year: number;
  headline: string;
  skills: string[];
  projectUrl: string | null;
  createdAt: Date;
}

export interface JobProfile {
  id: string;
  title: string;
  description: string;
  skills: string[];
  batch: number | null;
  location: string;
  ctcMin: number;
  ctcMax: number;
  createdAt: Date;
}

export interface ScoringWeights {
  skills: number;
  text: number;
  eligibility: number;
  freshness: number;
}

export interface ScoredItem<T> {
  item: T;
  score: number;
  breakdown: {
    skillsScore: number;
    textScore: number;
    eligibilityScore: number;
    freshnessScore: number;
    newProfileBoost?: number;
  };
}

export class RankingService {
  private static readonly DEFAULT_WEIGHTS: ScoringWeights = {
    skills: 0.55,
    text: 0.20,
    eligibility: 0.15,
    freshness: 0.10
  };

  private static readonly NEW_PROFILE_BOOST = 0.05;
  private static readonly NEW_PROFILE_THRESHOLD = 20; // impressions

  /**
   * Calculate score for a student viewing a job
   */
  static scoreJobForStudent(
    student: StudentProfile,
    job: JobProfile,
    impressionCount: number = 0,
    weights: ScoringWeights = RankingService.DEFAULT_WEIGHTS
  ): ScoredItem<JobProfile> {
    // Skills similarity using Jaccard index
    const skillsScore = jaccardSimilarity(student.skills, job.skills);

    // Text similarity using TF-IDF
    const studentText = `${student.headline} ${student.projectUrl || ''}`;
    const jobText = `${job.title} ${job.description}`;
    const textScore = globalTFIDFMatcher.textSimilarity(studentText, jobText);

    // Eligibility score (batch matching)
    const eligibilityScore = job.batch === null || job.batch === student.year ? 1 : 0;

    // Freshness score (exponential decay)
    const daysSinceCreated = (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const freshnessScore = Math.max(0.7, Math.min(1.2, Math.exp(-daysSinceCreated / 7)));

    // New profile boost
    const newProfileBoost = impressionCount < RankingService.NEW_PROFILE_THRESHOLD 
      ? RankingService.NEW_PROFILE_BOOST 
      : 0;

    // Calculate final score
    const baseScore = 
      weights.skills * skillsScore +
      weights.text * textScore +
      weights.eligibility * eligibilityScore +
      weights.freshness * freshnessScore;

    const finalScore = baseScore + newProfileBoost;

    return {
      item: job,
      score: finalScore,
      breakdown: {
        skillsScore,
        textScore,
        eligibilityScore,
        freshnessScore,
        newProfileBoost: newProfileBoost > 0 ? newProfileBoost : undefined
      }
    };
  }

  /**
   * Calculate score for a recruiter viewing a student
   */
  static scoreStudentForJob(
    job: JobProfile,
    student: StudentProfile,
    impressionCount: number = 0,
    weights: ScoringWeights = RankingService.DEFAULT_WEIGHTS
  ): ScoredItem<StudentProfile> {
    // Skills similarity using Jaccard index
    const skillsScore = jaccardSimilarity(job.skills, student.skills);

    // Text similarity using TF-IDF
    const jobText = `${job.title} ${job.description}`;
    const studentText = `${student.headline} ${student.projectUrl || ''}`;
    const textScore = globalTFIDFMatcher.textSimilarity(jobText, studentText);

    // Eligibility score (batch matching)
    const eligibilityScore = job.batch === null || job.batch === student.year ? 1 : 0;

    // Freshness score (for student profile)
    const daysSinceCreated = (Date.now() - student.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const freshnessScore = Math.max(0.7, Math.min(1.2, Math.exp(-daysSinceCreated / 7)));

    // New profile boost
    const newProfileBoost = impressionCount < RankingService.NEW_PROFILE_THRESHOLD 
      ? RankingService.NEW_PROFILE_BOOST 
      : 0;

    // Calculate final score
    const baseScore = 
      weights.skills * skillsScore +
      weights.text * textScore +
      weights.eligibility * eligibilityScore +
      weights.freshness * freshnessScore;

    const finalScore = baseScore + newProfileBoost;

    return {
      item: student,
      score: finalScore,
      breakdown: {
        skillsScore,
        textScore,
        eligibilityScore,
        freshnessScore,
        newProfileBoost: newProfileBoost > 0 ? newProfileBoost : undefined
      }
    };
  }

  /**
   * Rank and sort a list of jobs for a student
   */
  static rankJobsForStudent(
    student: StudentProfile,
    jobs: JobProfile[],
    impressionCounts: Map<string, number> = new Map(),
    explorationRatio: number = 0.2
  ): ScoredItem<JobProfile>[] {
    // Score all jobs
    const scoredJobs = jobs.map(job => 
      RankingService.scoreJobForStudent(
        student, 
        job, 
        impressionCounts.get(job.id) || 0
      )
    );

    // Sort by score (descending)
    scoredJobs.sort((a, b) => b.score - a.score);

    // Apply exploration: mix in some random jobs
    if (explorationRatio > 0 && scoredJobs.length > 1) {
      const explorationCount = Math.floor(scoredJobs.length * explorationRatio);
      const topJobs = scoredJobs.slice(0, scoredJobs.length - explorationCount);
      const explorationJobs = RankingService.shuffleArray(
        scoredJobs.slice(scoredJobs.length - explorationCount)
      );
      
      return [...topJobs, ...explorationJobs];
    }

    return scoredJobs;
  }

  /**
   * Rank and sort a list of students for a job
   */
  static rankStudentsForJob(
    job: JobProfile,
    students: StudentProfile[],
    impressionCounts: Map<string, number> = new Map(),
    explorationRatio: number = 0.2
  ): ScoredItem<StudentProfile>[] {
    // Score all students
    const scoredStudents = students.map(student => 
      RankingService.scoreStudentForJob(
        job, 
        student, 
        impressionCounts.get(student.id) || 0
      )
    );

    // Sort by score (descending)
    scoredStudents.sort((a, b) => b.score - a.score);

    // Apply exploration: mix in some random students
    if (explorationRatio > 0 && scoredStudents.length > 1) {
      const explorationCount = Math.floor(scoredStudents.length * explorationRatio);
      const topStudents = scoredStudents.slice(0, scoredStudents.length - explorationCount);
      const explorationStudents = RankingService.shuffleArray(
        scoredStudents.slice(scoredStudents.length - explorationCount)
      );
      
      return [...topStudents, ...explorationStudents];
    }

    return scoredStudents;
  }

  /**
   * Apply diversity controls to limit cards per company
   */
  static applyCompanyDiversity<T extends { item: JobProfile }>(
    scoredJobs: T[],
    maxPerCompany: number = 3
  ): T[] {
    const companyCount = new Map<string, number>();
    const result: T[] = [];

    for (const scoredJob of scoredJobs) {
      // Extract company from job (assuming it's in the description or we need to add it to the model)
      // For now, we'll use a simple heuristic or add company field later
      const company = 'default'; // TODO: Extract from job.company field when added to schema
      
      const currentCount = companyCount.get(company) || 0;
      if (currentCount < maxPerCompany) {
        result.push(scoredJob);
        companyCount.set(company, currentCount + 1);
      }
    }

    return result;
  }

  /**
   * Utility function to shuffle an array (Fisher-Yates algorithm)
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Initialize TF-IDF vocabulary from existing data
   */
  static async initializeVocabulary(
    students: StudentProfile[],
    jobs: JobProfile[]
  ): Promise<void> {
    const documents = [
      ...students.map(s => ({
        id: s.id,
        text: `${s.headline} ${s.projectUrl || ''}`
      })),
      ...jobs.map(j => ({
        id: j.id,
        text: `${j.title} ${j.description}`
      }))
    ];

    globalTFIDFMatcher.buildVocabulary(documents);
  }
}