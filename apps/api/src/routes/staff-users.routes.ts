import { Router } from 'express';
import { createStaffUser, listStaffUsers } from '../controllers/staff-users.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';

const router = Router();

router.use(requireAuth, requireRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'SECRETARY'));

router.get('/', listStaffUsers);
router.post('/', createStaffUser);

export default router;
