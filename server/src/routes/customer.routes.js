import { Router } from 'express';
import * as ctrl from '../controllers/customer.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();

router.use(protect, authorize('admin', 'superadmin'));
router.get('/', ctrl.getCustomers);
router.get('/:id', mongoIdParam(), validate, ctrl.getCustomer);

export default router;
