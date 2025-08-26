import { Router } from 'express';
import { loginOrSignup, getCurrentUser } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /auth/login - Login or signup with email only
router.post('/login', loginOrSignup);

// GET /auth/me - Get current user information (protected)
router.get('/me', authenticateToken, getCurrentUser);

export default router;