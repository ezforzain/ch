import { Router } from 'express';
import * as ctrl from '../controllers/teamMember.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { teamMemberValidator } from '../validators/teamMember.validator.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();
const photo = upload.fields([{ name: 'photo', maxCount: 1 }]);

router.get('/', ctrl.getTeamMembers);
router.get('/:id', mongoIdParam(), validate, ctrl.getTeamMember);

router.use(protect, authorize('admin', 'superadmin'));
router.post('/', photo, teamMemberValidator, validate, ctrl.createTeamMember);
router.patch('/:id', mongoIdParam(), photo, validate, ctrl.updateTeamMember);
router.delete('/:id', mongoIdParam(), validate, ctrl.deleteTeamMember);

export default router;
