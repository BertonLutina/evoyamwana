import { Router } from 'express';
import { z } from 'zod';
import { createClass, getClass, listClasses } from '../controllers/classes.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const optionalUuid = z.preprocess((value) => (value === '' ? undefined : value), z.string().uuid().optional());

const classSchema = z.object({
  name: z.string().trim().min(2),
  level: z.string().trim().min(2),
  section: z.string().trim().optional(),
  academicYear: z.string().trim().min(4),
  teacherId: optionalUuid,
  room: z.string().trim().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  cycle: z.string().trim().optional(),
  option: z.string().trim().optional(),
  shift: z.string().trim().optional(),
  description: z.string().trim().optional()
});

router.use(requireAuth);
router.get(
  '/',
  requireRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER', 'CLASS_TUTOR', 'PARENT', 'STUDENT', 'DISCIPLINE_OFFICER', 'LIBRARIAN', 'NURSE', 'TRANSPORT_MANAGER', 'CANTEEN_MANAGER'),
  listClasses
);
router.get(
  '/:id',
  requireRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER', 'CLASS_TUTOR', 'PARENT', 'STUDENT', 'DISCIPLINE_OFFICER', 'LIBRARIAN', 'NURSE', 'TRANSPORT_MANAGER', 'CANTEEN_MANAGER'),
  getClass
);
router.post('/', requireRole('SCHOOL_ADMIN', 'SUPER_ADMIN', 'DIRECTOR'), validateBody(classSchema), createClass);

export default router;
