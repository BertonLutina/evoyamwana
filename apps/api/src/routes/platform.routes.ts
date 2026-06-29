import { Router } from 'express';
import {
  approveSchoolRegistrationRequest,
  getPlatformReports,
  listPlatformAdmins,
  listPlatformSchools,
  listPlatformUsers,
  listSchoolRegistrationRequests,
  rejectSchoolRegistrationRequest
} from '../controllers/platform.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';

const router = Router();

router.use(requireAuth, requireRole('SUPER_ADMIN'));
router.get('/school-registrations', listSchoolRegistrationRequests);
router.post('/school-registrations/:id/approve', approveSchoolRegistrationRequest);
router.post('/school-registrations/:id/reject', rejectSchoolRegistrationRequest);
router.get('/schools', listPlatformSchools);
router.get('/admins', listPlatformAdmins);
router.get('/users', listPlatformUsers);
router.get('/reports', getPlatformReports);

export default router;
