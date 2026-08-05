import { Router } from 'express';
import * as ctrl from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(protect);
router.post('/image', upload.single('image'), ctrl.uploadSingle);
router.post('/images', upload.array('images', 10), ctrl.uploadMultiple);

export default router;
