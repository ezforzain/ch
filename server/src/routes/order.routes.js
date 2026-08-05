import { Router } from 'express';
import * as ctrl from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createOrderValidator, updateOrderStatusValidator } from '../validators/order.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();

router.use(protect);
router.post('/', authorize('customer'), createOrderValidator, validate, ctrl.createOrder);
router.get('/me', authorize('customer'), ctrl.getMyOrders);
router.get('/seller', authorize('seller'), ctrl.getSellerOrders);
router.get('/', authorize('admin', 'superadmin'), ctrl.getOrders);
router.get('/:id', mongoIdParam(), validate, ctrl.getOrder);
router.patch(
  '/:id/status',
  authorize('admin', 'superadmin'),
  mongoIdParam(),
  updateOrderStatusValidator,
  validate,
  ctrl.updateOrderStatus,
);
// Alias of the above — lets the admin panel's generic collection editor (which always
// PATCHes `${endpoint}/${id}`) update order status without a route special-case.
router.patch(
  '/:id',
  authorize('admin', 'superadmin'),
  mongoIdParam(),
  updateOrderStatusValidator,
  validate,
  ctrl.updateOrderStatus,
);
router.delete('/:id', authorize('admin', 'superadmin'), mongoIdParam(), validate, ctrl.deleteOrder);

export default router;
