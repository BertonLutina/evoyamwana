import { Router } from 'express';
import {
  archiveDirectorReport,
  createDirectorReport,
  getDirectorReport,
  getDirectorReportSummary,
  listDirectorReports,
  reportSchema,
  updateDirectorReport
} from '../controllers/director-reports.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), listDirectorReports);
router.get('/summary', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), getDirectorReportSummary);
router.get('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), getDirectorReport);
router.post('/', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), validateBody(reportSchema), createDirectorReport);
router.put('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), validateBody(reportSchema.partial()), updateDirectorReport);
router.delete('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), archiveDirectorReport);

export default router;
