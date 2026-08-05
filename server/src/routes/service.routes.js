import { Router } from 'express';
import * as ctrl from '../controllers/service.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { serviceValidator } from '../validators/service.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();
const serviceImage = upload.fields([{ name: 'image', maxCount: 1 }]);

router.get('/', ctrl.getServices);
router.get('/:id', mongoIdParam(), validate, ctrl.getService);

router.use(protect, authorize('admin', 'superadmin'));
router.post('/', serviceImage, serviceValidator, validate, ctrl.createService);
router.patch('/:id', mongoIdParam(), serviceImage, validate, ctrl.updateService);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteService);

export default router;
