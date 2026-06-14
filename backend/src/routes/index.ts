import { Router } from 'express';
import authRoutes from './auth.routes';
import matchRoutes from './match.routes';
import playerRoutes from './player.routes';
import leaderboardRoutes from './leaderboard.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'bpl-api' } });
});

router.use('/auth', authRoutes);
router.use('/matches', matchRoutes);
router.use('/players', playerRoutes);
router.use('/leaderboard', leaderboardRoutes);

export default router;
