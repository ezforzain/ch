import { Router } from 'express';
import * as ctrl from '../controllers/seller.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { mongoIdParam } from '../validators/common.validator.js';
import { body } from 'express-validator';

const router = Router();

router.use(protect);
router.get('/me/stats', authorize('seller'), ctrl.getMySellerStats);

router.use(authorize('admin', 'superadmin'));
router.get('/', ctrl.getSellers);
router.get('/:id', mongoIdParam(), validate, ctrl.getSeller);
router.patch(
  '/:id/status',
  mongoIdParam(),
  body('status').isIn(['pending', 'approved', 'rejected', 'suspended']),
  validate,
  ctrl.updateSellerStatus,
);

export default router;
