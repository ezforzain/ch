import { Router } from 'express';
import * as ctrl from '../controllers/message.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createMessageValidator, replyValidator } from '../validators/message.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/', authLimiter, optionalAuth, createMessageValidator, validate, ctrl.createMessage);

router.use(protect, authorize('admin', 'superadmin'));
router.get('/', ctrl.getMessages);
router.get('/:id', mongoIdParam(), validate, ctrl.getMessage);
router.patch('/:id', mongoIdParam(), validate, ctrl.updateMessage);
router.patch('/:id/read', mongoIdParam(), validate, ctrl.markMessageRead);
router.patch('/:id/reply', mongoIdParam(), replyValidator, validate, ctrl.replyToMessage);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteMessage);

export default router;
