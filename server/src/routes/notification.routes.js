import { Router } from 'express';
import * as ctrl from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();

router.use(protect);
router.get('/', ctrl.getMyNotifications);
router.patch('/read-all', ctrl.markAllAsRead);
router.patch('/:id/read', mongoIdParam(), validate, ctrl.markAsRead);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteNotification);

export default router;
