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
// No faqValidator here (unlike POST) — it requires `question`/`answer`, which a partial PATCH
// like the Admin Panel's archive/unarchive toggle (`{ isActive }` only) wouldn't include.
// Mongoose's runValidators only checks fields actually present in the update, so this still
// rejects bad values if sent, matching blog/project/service/teamMember/testimonial's PATCH routes.
router.patch('/:id', mongoIdParam(), validate, ctrl.updateFAQ);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteFAQ);

export default router;
