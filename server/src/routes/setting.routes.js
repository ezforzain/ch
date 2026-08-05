import { Router } from 'express';
import * as ctrl from '../controllers/setting.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateSettingsValidator } from '../validators/setting.validator.js';

const router = Router();

router.get('/', ctrl.getSettings);
router.patch('/', protect, authorize('admin', 'superadmin'), updateSettingsValidator, validate, ctrl.updateSettings);

export default router;
