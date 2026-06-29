import { Router } from 'express';
import { z } from 'zod';
import {
  createTeacher,
  deleteTeacher,
  getCurrentTeacher,
  getTeacher,
  listTeachers,
  updateCurrentTeacher,
  updateTeacher
} from '../controllers/teachers.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const optionalDate = z.preprocess(
  (value) => (value === '' ? null : value),
  z
    .string()
    .refine((value) => value === null || !Number.isNaN(Date.parse(value)), 'Invalid date')
    .nullable()
    .optional()
);

const optionalUrl = z.preprocess(
  (value) => (value === '' ? null : value),
  z
    .string()
    .refine((value) => value.startsWith('/files/') || z.string().url().safeParse(value).success, 'Invalid file URL')
    .nullable()
    .optional()
);

const employmentStatusSchema = z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE']);

const teacherSchema = z.object({
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  email: z.string().trim().email(),
  employeeNumber: z.string().trim().min(2),
  phone: z.string().trim().optional().nullable(),
  password: z.string().min(8).optional(),
  birthDate: optionalDate,
  birthPlace: z.string().trim().optional().nullable(),
  gender: z.string().trim().optional().nullable(),
  nationality: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  photoUrl: optionalUrl,
  hireDate: optionalDate,
  qualification: z.string().trim().optional().nullable(),
  specialization: z.string().trim().optional().nullable(),
  nationalId: z.string().trim().optional().nullable(),
  emergencyContactName: z.string().trim().optional().nullable(),
  emergencyContactPhone: z.string().trim().optional().nullable(),
  bio: z.string().trim().optional().nullable(),
  employmentStatus: employmentStatusSchema.optional()
});

const teacherSelfUpdateSchema = z.object({
  phone: z.string().trim().optional().nullable(),
  birthDate: optionalDate,
  birthPlace: z.string().trim().optional().nullable(),
  gender: z.string().trim().optional().nullable(),
  nationality: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  photoUrl: optionalUrl,
  emergencyContactName: z.string().trim().optional().nullable(),
  emergencyContactPhone: z.string().trim().optional().nullable(),
  bio: z.string().trim().optional().nullable()
});

const teacherUpdateSchema = teacherSchema.partial().extend({
  password: z.string().min(8).optional()
});

const teacherReadRoles = ['SCHOOL_ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SECRETARY'] as const;
const teacherWriteRoles = ['SCHOOL_ADMIN', 'SUPER_ADMIN', 'SECRETARY'] as const;

router.use(requireAuth);
router.get('/me', requireRole('TEACHER', 'CLASS_TUTOR'), getCurrentTeacher);
router.patch('/me', requireRole('TEACHER', 'CLASS_TUTOR'), validateBody(teacherSelfUpdateSchema), updateCurrentTeacher);

router.get('/', requireRole(...teacherReadRoles), listTeachers);
router.get('/:id', requireRole(...teacherReadRoles), getTeacher);
router.post('/', requireRole(...teacherWriteRoles), validateBody(teacherSchema), createTeacher);
router.put('/:id', requireRole(...teacherWriteRoles), validateBody(teacherUpdateSchema), updateTeacher);
router.delete('/:id', requireRole(...teacherWriteRoles), deleteTeacher);

export default router;
