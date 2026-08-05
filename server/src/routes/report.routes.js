import { Router } from 'express';
import * as ctrl from '../controllers/report.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, authorize('admin', 'superadmin'));
router.get('/sales', ctrl.salesReport);
router.get('/leads', ctrl.leadsReport);
router.get('/appointments', ctrl.appointmentsReport);
router.get('/users-growth', ctrl.usersGrowthReport);

export default router;
