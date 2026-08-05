import { Router } from 'express';
import * as ctrl from '../controllers/city.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { cityValidator } from '../validators/city.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();

router.get('/', ctrl.getCities);
router.get('/:id', mongoIdParam(), validate, ctrl.getCity);

router.use(protect, authorize('admin', 'superadmin'));
router.post('/', cityValidator, validate, ctrl.createCity);
router.patch('/:id', mongoIdParam(), cityValidator, validate, ctrl.updateCity);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteCity);

export default router;
