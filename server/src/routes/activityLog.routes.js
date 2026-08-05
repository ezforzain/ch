import { Router } from 'express';
import * as ctrl from '../controllers/activityLog.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, authorize('admin', 'superadmin'));
router.get('/', ctrl.getActivityLogs);

export default router;
