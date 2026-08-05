import { Router } from 'express';
import * as ctrl from '../controllers/testimonial.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { testimonialValidator } from '../validators/testimonial.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();
const portrait = upload.fields([{ name: 'portrait', maxCount: 1 }]);

router.get('/', ctrl.getTestimonials);
router.get('/:id', mongoIdParam(), validate, ctrl.getTestimonial);

router.use(protect, authorize('admin', 'superadmin'));
router.post('/', portrait, testimonialValidator, validate, ctrl.createTestimonial);
router.patch('/:id', mongoIdParam(), portrait, validate, ctrl.updateTestimonial);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteTestimonial);

export default router;
