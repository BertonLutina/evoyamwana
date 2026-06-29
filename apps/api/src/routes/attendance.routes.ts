import { Router } from 'express';
import { z } from 'zod';
import {
  getAttendanceReport,
  getClassAttendance,
  getMyAttendance,
  getStudentAttendance,
  recordAttendance,
  updateAttendance
} from '../controllers/attendance.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const statusSchema = z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']);

const recordAttendanceSchema = z.object({
  classId: z.string().uuid(),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date'),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: statusSchema,
      note: z.string().trim().optional()
    })
  ).min(1)
});

const updateAttendanceSchema = z.object({
  status: statusSchema,
  note: z.string().trim().optional()
});

router.use(requireAuth);
router.get('/me', requireRole('STUDENT'), getMyAttendance);
router.get('/class/:classId', requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER', 'CLASS_TUTOR', 'DISCIPLINE_OFFICER', 'NURSE'), getClassAttendance);
router.post('/', requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER', 'CLASS_TUTOR', 'DISCIPLINE_OFFICER'), validateBody(recordAttendanceSchema), recordAttendance);
router.put('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER', 'CLASS_TUTOR', 'DISCIPLINE_OFFICER'), validateBody(updateAttendanceSchema), updateAttendance);
router.get('/student/:studentId', requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER', 'CLASS_TUTOR', 'DISCIPLINE_OFFICER', 'NURSE', 'PARENT', 'STUDENT'), getStudentAttendance);
router.get('/reports/daily', requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'DISCIPLINE_OFFICER', 'NURSE'), getAttendanceReport);

export default router;
