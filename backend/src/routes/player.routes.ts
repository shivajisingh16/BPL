import { Router } from 'express';
import { playerController } from '../controllers/player.controller';

const router = Router();

router.get('/', playerController.list);
router.get('/stats', playerController.stats);
router.get('/:name/stats', playerController.statsByName);

export default router;
