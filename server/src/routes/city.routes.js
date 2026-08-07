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
// No cityValidator here (unlike POST) — it requires `name`, which a partial PATCH like the
// Admin Panel's archive/unarchive toggle (`{ isActive }` only) wouldn't include. Mongoose's
// runValidators only checks fields actually present in the update, so this still rejects a bad
// `name` if one is sent, matching blog/project/service/teamMember/testimonial's PATCH routes.
router.patch('/:id', mongoIdParam(), validate, ctrl.updateCity);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteCity);

export default router;
