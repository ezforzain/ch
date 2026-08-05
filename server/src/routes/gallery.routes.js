import { Router } from 'express';
import * as ctrl from '../controllers/gallery.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { galleryItemValidator } from '../validators/gallery.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();
const galleryImage = upload.fields([{ name: 'image', maxCount: 1 }]);

router.get('/', ctrl.getGalleryItems);
router.get('/:id', mongoIdParam(), validate, ctrl.getGalleryItem);

router.use(protect, authorize('admin', 'superadmin'));
router.post('/', galleryImage, galleryItemValidator, validate, ctrl.createGalleryItem);
router.patch('/:id', mongoIdParam(), galleryImage, validate, ctrl.updateGalleryItem);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteGalleryItem);

export default router;
