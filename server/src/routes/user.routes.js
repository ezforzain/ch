import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateUserValidator, updateMeValidator, addressValidator } from '../validators/user.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();
const avatarUpload = upload.fields([{ name: 'avatar', maxCount: 1 }]);

router.use(protect);

router.patch('/me', avatarUpload, updateMeValidator, validate, ctrl.updateMe);
router.post('/me/addresses', addressValidator, validate, ctrl.addAddress);
router.delete('/me/addresses/:addressId', ctrl.removeAddress);

router.use(authorize('admin', 'superadmin'));
router.get('/', ctrl.getUsers);
router.get('/:id', mongoIdParam(), validate, ctrl.getUser);
router.patch('/:id', mongoIdParam(), updateUserValidator, validate, ctrl.updateUser);
router.delete('/:id', mongoIdParam(), authorize('superadmin'), validate, ctrl.deleteUser);

export default router;
