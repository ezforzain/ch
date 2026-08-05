import { Router } from 'express';
import * as ctrl from '../controllers/blog.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { blogPostValidator } from '../validators/blog.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();
const coverImage = upload.fields([{ name: 'coverImage', maxCount: 1 }]);

router.get('/', ctrl.getPosts);
router.get('/slug/:slug', ctrl.getPostBySlug);
router.get('/:id', mongoIdParam(), validate, ctrl.getPost);

router.use(protect, authorize('admin', 'superadmin'));
router.post('/', coverImage, blogPostValidator, validate, ctrl.createPost);
router.patch('/:id', mongoIdParam(), coverImage, validate, ctrl.updatePost);
router.delete('/:id', mongoIdParam(), validate, ctrl.deletePost);

export default router;
