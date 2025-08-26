import { Router } from 'express';
import { 
  createStudentProfile, 
  createRecruiterProfile, 
  updateStudentProfile, 
  updateRecruiterProfile,
  setUserRole 
} from '../controllers/profile';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All profile routes require authentication
router.use(authenticateToken);

// POST /profile/role - Set user role (STUDENT or RECRUITER)
router.post('/role', setUserRole);

// POST /profile/student - Create student profile
router.post('/student', createStudentProfile);

// PUT /profile/student - Update student profile
router.put('/student', updateStudentProfile);

// POST /profile/recruiter - Create recruiter profile
router.post('/recruiter', createRecruiterProfile);

// PUT /profile/recruiter - Update recruiter profile
router.put('/recruiter', updateRecruiterProfile);

export default router;