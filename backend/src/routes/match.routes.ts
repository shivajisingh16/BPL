import { Router } from 'express';
import { matchController } from '../controllers/match.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/', matchController.list);
router.get('/grouped', matchController.grouped);
router.get('/playoffs', matchController.playoffs);
router.get('/upcoming', matchController.upcoming);
router.get('/summary', matchController.summary);
router.get('/:id', matchController.getById);

// Admin-only write — recalculates stats & leaderboard implicitly
router.put('/:id', requireAuth, matchController.update);

export default router;
