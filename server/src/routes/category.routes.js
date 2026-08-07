import { Router } from 'express';
import * as ctrl from '../controllers/category.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { categoryValidator } from '../validators/category.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();
const image = upload.fields([{ name: 'image', maxCount: 1 }]);

router.get('/', ctrl.getCategories);
router.get('/:id', mongoIdParam(), validate, ctrl.getCategory);

router.use(protect, authorize('admin', 'superadmin'));
router.post('/', image, categoryValidator, validate, ctrl.createCategory);
// No categoryValidator here (unlike POST) — it requires `name`, which a partial PATCH like
// the Admin Panel's archive/unarchive toggle (`{ isActive }` only) wouldn't include. Mongoose's
// runValidators only checks fields actually present in the update, so this still rejects a bad
// `name` if one is sent, matching blog/project/service/teamMember/testimonial's PATCH routes.
router.patch('/:id', mongoIdParam(), image, validate, ctrl.updateCategory);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteCategory);

export default router;
