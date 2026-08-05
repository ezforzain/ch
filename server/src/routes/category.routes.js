import { Router } from 'express';
import * as ctrl from '../controllers/category.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { categoryValidator } from '../validators/category.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();

router.get('/', ctrl.getCategories);
router.get('/:id', mongoIdParam(), validate, ctrl.getCategory);

router.use(protect, authorize('admin', 'superadmin'));
router.post('/', categoryValidator, validate, ctrl.createCategory);
router.patch('/:id', mongoIdParam(), categoryValidator, validate, ctrl.updateCategory);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteCategory);

export default router;
