/**
 * User State Routes
 * All routes are authenticated via JWT middleware.
 */

import { Router, type IRouter } from 'express';
import { authenticate } from '../middleware/auth';
import { getMe, updateSummary, getMyReflections } from './userState.controller';

const router: IRouter = Router();

// All user-state routes require authentication
router.use(authenticate);

router.get('/me', getMe);
router.post('/update-summary', updateSummary);
router.get('/reflections', getMyReflections);

export default router;
