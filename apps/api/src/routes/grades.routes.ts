import { Router } from 'express';
import { z } from 'zod';
import { createGrade, deleteGrade, listGrades, listStudentGradeSummaries, updateGrade } from '../controllers/grades.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const gradeSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  score: z.coerce.number().min(0),
  maxScore: z.coerce.number().positive(),
  coefficient: z.coerce.number().positive().optional(),
  term: z.string().trim().min(2),
  comment: z.string().trim().optional()
});

router.use(requireAuth);
router.get('/summaries/students', requireRole('SCHOOL_ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'TEACHER', 'CLASS_TUTOR', 'PARENT', 'STUDENT'), listStudentGradeSummaries);
router.get('/', requireRole('SCHOOL_ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'TEACHER', 'CLASS_TUTOR', 'PARENT', 'STUDENT'), listGrades);
router.post('/', requireRole('SCHOOL_ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'TEACHER', 'CLASS_TUTOR'), validateBody(gradeSchema), createGrade);
router.put('/:id', requireRole('SCHOOL_ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'TEACHER', 'CLASS_TUTOR'), validateBody(gradeSchema.partial()), updateGrade);
router.delete('/:id', requireRole('SCHOOL_ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'TEACHER', 'CLASS_TUTOR'), deleteGrade);

export default router;
