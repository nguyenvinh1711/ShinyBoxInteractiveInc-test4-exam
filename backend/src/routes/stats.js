import { Router } from 'express';
import statsController from '../controllers/stats.js';

const router = Router();

// GET /api/stats
router.get('/', statsController.getStats);



export default router;