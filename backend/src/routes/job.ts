import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createJob,
  getRecruiterJobs,
  updateJob,
  deleteJob,
  getJobById,
  getJobFeed,
  getStudentFeed
} from '../controllers/job';

const router = Router();

// All job routes require authentication
router.use(authenticateToken);

// Create a new job (recruiters only)
router.post('/', createJob);

// Get jobs for the authenticated recruiter
router.get('/my-jobs', getRecruiterJobs);

// Get job feed for students (with intelligent ranking and filtering)
router.get('/feed', getJobFeed);

// Get student feed for recruiters (with intelligent ranking and filtering)
router.get('/students/feed', getStudentFeed);

// Get a specific job by ID
router.get('/:id', getJobById);

// Update a job (recruiters only, own jobs only)
router.put('/:id', updateJob);

// Delete a job (recruiters only, own jobs only)
router.delete('/:id', deleteJob);

export default router;