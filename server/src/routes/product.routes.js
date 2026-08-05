import { Router } from 'express';
import * as ctrl from '../controllers/product.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { productValidator } from '../validators/product.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();
const productImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 8 },
]);

router.get('/', ctrl.getProducts);
router.get('/:id', mongoIdParam(), validate, ctrl.getProduct);

router.use(protect, authorize('admin', 'superadmin', 'seller'));
router.post('/', productImages, productValidator, validate, ctrl.createProduct);
router.patch('/:id', mongoIdParam(), productImages, validate, ctrl.updateProduct);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteProduct);

export default router;
