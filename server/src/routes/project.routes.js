import { Router } from 'express';
import * as ctrl from '../controllers/project.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { projectValidator } from '../validators/project.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();
const projectImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'beforeImage', maxCount: 1 },
]);

router.get('/', ctrl.getProjects);
router.get('/:id', mongoIdParam(), validate, ctrl.getProject);

router.use(protect, authorize('admin', 'superadmin'));
router.post('/', projectImages, projectValidator, validate, ctrl.createProject);
router.patch('/:id', mongoIdParam(), projectImages, validate, ctrl.updateProject);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteProject);

export default router;
