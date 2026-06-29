import { Router } from 'express';
import { z } from 'zod';
import {
  createStudent,
  deleteStudent,
  getCurrentStudent,
  getStudent,
  listStudents,
  listStudentsByCategory,
  listStudentsByClass,
  listStudentsBySchoolYear,
  updateStudent
} from '../controllers/students.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const optionalUuid = z.preprocess((value) => (value === '' ? undefined : value), z.string().uuid().optional());
const optionalUrl = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z
    .string()
    .refine((value) => value.startsWith('/files/') || z.string().url().safeParse(value).success, 'Invalid file URL')
    .optional()
);
const optionalDate = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')
    .optional()
);
const categorySchema = z.enum(['creche', 'maternelle', 'primaire', 'secondaire', 'secondaire_general', 'secondaire_technique', 'formation', 'haute_ecole', 'universite', 'mixte']);
const statusSchema = z.enum(['active', 'inactive', 'transferred', 'graduated']);
const relationshipSchema = z.enum(['father', 'mother', 'guardian', 'tutor', 'other']);
const registrationTypeSchema = z.enum(['new', 'transfer', 're_registration']);

const guardianParentSchema = z.object({
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional()
});

const guardianSchema = z.object({
  guardianId: z.string().uuid().optional().or(z.literal('')),
  parent: guardianParentSchema.optional(),
  relationshipType: relationshipSchema.default('guardian'),
  isPrimaryContact: z.boolean().default(false),
  canPickUpChild: z.boolean().default(false),
  emergencyContact: z.boolean().default(false)
}).refine((guardian) => Boolean(guardian.guardianId || guardian.parent), {
  message: 'Select an existing parent or enter parent details'
});

const medicalInfoSchema = z.object({
  bloodType: z.string().trim().optional(),
  allergies: z.string().trim().optional(),
  chronicDiseases: z.string().trim().optional(),
  medication: z.string().trim().optional(),
  doctorName: z.string().trim().optional(),
  doctorPhone: z.string().trim().optional(),
  emergencyNotes: z.string().trim().optional()
});

const maternelleInfoSchema = z.object({
  toiletTrained: z.boolean().default(false),
  napNeeded: z.boolean().default(false),
  foodRestrictions: z.string().trim().optional(),
  authorizedPickupPersons: z.unknown().optional(),
  adaptationNotes: z.string().trim().optional(),
  favoriteLanguage: z.string().trim().optional(),
  separationDifficulty: z.boolean().default(false)
});

const primaryInfoSchema = z.object({
  previousSchool: z.string().trim().optional(),
  readingLevel: z.string().trim().optional(),
  writingLevel: z.string().trim().optional(),
  mathLevel: z.string().trim().optional(),
  specialNeeds: z.string().trim().optional(),
  extracurricularNotes: z.string().trim().optional()
});

const secondaryInfoSchema = z.object({
  previousSchool: z.string().trim().optional(),
  section: z.string().trim().optional(),
  optionName: z.string().trim().optional(),
  orientationNotes: z.string().trim().optional(),
  disciplinaryNotes: z.string().trim().optional(),
  academicLevel: z.string().trim().optional(),
  repeatedClass: z.boolean().default(false)
});

const universityInfoSchema = z.object({
  previousInstitution: z.string().trim().optional(),
  diplomaObtained: z.string().trim().optional(),
  program: z.string().trim().optional(),
  faculty: z.string().trim().optional(),
  department: z.string().trim().optional(),
  academicYear: z.string().trim().optional(),
  registrationType: registrationTypeSchema.optional(),
  scholarshipStatus: z.string().trim().optional(),
  studentEmail: z.string().trim().email().optional(),
  nationalIdNumber: z.string().trim().optional()
});

const studentSchema = z.object({
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  gender: z.string().trim().optional(),
  birthDate: optionalDate,
  birthPlace: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
  photoUrl: optionalUrl,
  studentCode: z.string().trim().min(2).optional(),
  studentNumber: z.string().trim().min(2).optional(),
  category: categorySchema.default('primaire'),
  status: statusSchema.default('active'),
  classId: optionalUuid,
  schoolYearId: optionalUuid,
  parentIds: z.array(z.string().uuid()).default([]),
  guardians: z.array(guardianSchema).default([]),
  medicalInfo: medicalInfoSchema.optional(),
  maternelleInfo: maternelleInfoSchema.optional(),
  primaryInfo: primaryInfoSchema.optional(),
  secondaryInfo: secondaryInfoSchema.optional(),
  universityInfo: universityInfoSchema.optional()
});

const updateStudentSchema = studentSchema.partial().extend({
  parentIds: z.array(z.string().uuid()).optional()
});

router.use(requireAuth);
router.get('/me', requireRole('STUDENT'), getCurrentStudent);

const studentReadRoles = requireRole(
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'DIRECTOR',
  'SECRETARY',
  'ACCOUNTANT',
  'CLASS_TUTOR',
  'DISCIPLINE_OFFICER',
  'LIBRARIAN',
  'NURSE',
  'TRANSPORT_MANAGER',
  'CANTEEN_MANAGER',
  'PARENT'
);
const studentWriteRoles = requireRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'SECRETARY');

router.get('/', studentReadRoles, listStudents);
router.get('/category/:category', studentReadRoles, listStudentsByCategory);
router.get('/class/:classId', studentReadRoles, listStudentsByClass);
router.get('/school-year/:schoolYearId', studentReadRoles, listStudentsBySchoolYear);
router.get('/:id', studentReadRoles, getStudent);
router.post('/', studentWriteRoles, validateBody(studentSchema), createStudent);
router.put('/:id', studentWriteRoles, validateBody(updateStudentSchema), updateStudent);
router.delete('/:id', studentWriteRoles, deleteStudent);

export default router;
