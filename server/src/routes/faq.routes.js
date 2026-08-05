import { Router } from 'express';
import * as ctrl from '../controllers/faq.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { faqValidator } from '../validators/faq.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();

router.get('/', ctrl.getFAQs);
router.get('/:id', mongoIdParam(), validate, ctrl.getFAQ);

router.use(protect, authorize('admin', 'superadmin'));
router.post('/', faqValidator, validate, ctrl.createFAQ);
router.patch('/:id', mongoIdParam(), faqValidator, validate, ctrl.updateFAQ);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteFAQ);

export default router;
