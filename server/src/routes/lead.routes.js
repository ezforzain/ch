import { Router } from 'express';
import * as ctrl from '../controllers/lead.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createLeadValidator, updateLeadValidator } from '../validators/lead.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/', authLimiter, createLeadValidator, validate, ctrl.createLead);

router.use(protect, authorize('admin', 'superadmin'));
router.get('/', ctrl.getLeads);
router.get('/:id', mongoIdParam(), validate, ctrl.getLead);
router.patch('/:id', mongoIdParam(), updateLeadValidator, validate, ctrl.updateLead);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteLead);

export default router;
