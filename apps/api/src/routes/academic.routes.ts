import { Router } from 'express';
import {
  createAssignment,
  createFee,
  createSchoolYear,
  createSubject,
  createTerm,
  createTimetableEntry,
  listAssignments,
  listFees,
  listSchoolYears,
  listSubjects,
  listTimetable
} from '../controllers/academic.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';

export const subjectRoutes = Router();
export const schoolYearRoutes = Router();
export const timetableRoutes = Router();
export const assignmentRoutes = Router();
export const feeRoutes = Router();

const readRoles = requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER', 'CLASS_TUTOR', 'PARENT', 'STUDENT', 'ACCOUNTANT');
const academicWriteRoles = requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'SECRETARY');
const teacherWriteRoles = requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER', 'CLASS_TUTOR');
const feeWriteRoles = requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'ACCOUNTANT');

subjectRoutes.use(requireAuth);
subjectRoutes.get('/', readRoles, listSubjects);
subjectRoutes.post('/', academicWriteRoles, createSubject);

schoolYearRoutes.use(requireAuth);
schoolYearRoutes.get('/', readRoles, listSchoolYears);
schoolYearRoutes.post('/', academicWriteRoles, createSchoolYear);
schoolYearRoutes.post('/terms', academicWriteRoles, createTerm);

timetableRoutes.use(requireAuth);
timetableRoutes.get('/', readRoles, listTimetable);
timetableRoutes.post('/', academicWriteRoles, createTimetableEntry);

assignmentRoutes.use(requireAuth);
assignmentRoutes.get('/', readRoles, listAssignments);
assignmentRoutes.post('/', teacherWriteRoles, createAssignment);

feeRoutes.use(requireAuth);
feeRoutes.get('/', readRoles, listFees);
feeRoutes.post('/', feeWriteRoles, createFee);
