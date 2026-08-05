import { Router } from 'express';
import * as ctrl from '../controllers/appointment.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createAppointmentValidator, updateAppointmentValidator } from '../validators/appointment.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/', authLimiter, createAppointmentValidator, validate, ctrl.createAppointment);

router.use(protect, authorize('admin', 'superadmin'));
router.get('/', ctrl.getAppointments);
router.get('/:id', mongoIdParam(), validate, ctrl.getAppointment);
router.patch('/:id', mongoIdParam(), updateAppointmentValidator, validate, ctrl.updateAppointment);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteAppointment);

export default router;
