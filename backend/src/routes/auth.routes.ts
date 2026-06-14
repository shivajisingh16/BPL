import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login  — exchange credentials for a token
router.post('/login', authController.login);

// GET  /api/auth/me     — current user (requires a valid token)
router.get('/me', requireAuth, authController.me);

export default router;
