import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';

const router = Router();

router.use(requireAuth);
router.get(
  '/',
  requireRole(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'DIRECTOR',
    'SECRETARY',
    'ACCOUNTANT',
    'TEACHER',
    'CLASS_TUTOR',
    'PARENT',
    'STUDENT',
    'DISCIPLINE_OFFICER',
    'LIBRARIAN',
    'NURSE',
    'TRANSPORT_MANAGER',
    'CANTEEN_MANAGER'
  ),
  getDashboardSummary
);

export default router;
