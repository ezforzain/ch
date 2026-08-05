import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, authorize('admin', 'superadmin', 'seller'));
router.get('/summary', ctrl.getSummary);
router.get('/sales-trend', ctrl.getSalesTrend);
router.get('/top-products', ctrl.getTopProducts);
router.get('/order-status-breakdown', ctrl.getOrderStatusBreakdown);

export default router;
