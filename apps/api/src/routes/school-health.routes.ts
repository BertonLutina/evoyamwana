import { Router } from 'express';
import { z } from 'zod';
import { archiveSchoolHealthRecord, createSchoolHealthRecord, getSchoolHealthProgression, getSchoolHealthRecord, getSchoolHealthSummary, listSchoolHealthRecords, updateSchoolHealthRecord } from '../controllers/school-health.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const healthRecordSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().min(3),
  category: z.enum(['ATTENDANCE', 'PEDAGOGY', 'FINANCE', 'INFRASTRUCTURE', 'SAFETY', 'HEALTH', 'REPUTATION', 'COMPLIANCE']),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  owner: z.string().trim().optional(),
  dueDate: z.preprocess((value) => (value === '' ? undefined : value), z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date').optional())
});

router.use(requireAuth);
router.get('/', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), listSchoolHealthRecords);
router.get('/summary', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), getSchoolHealthSummary);
router.get('/progression', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), getSchoolHealthProgression);
router.get('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), getSchoolHealthRecord);
router.post('/', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), validateBody(healthRecordSchema), createSchoolHealthRecord);
router.put('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), validateBody(healthRecordSchema.partial()), updateSchoolHealthRecord);
router.delete('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), archiveSchoolHealthRecord);

export default router;
