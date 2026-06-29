import { Router } from 'express';
import { z } from 'zod';
import { archiveSectorDossier, createSectorDossier, getSectorDossier, getSectorDossierSummary, listSectorDossiers, updateSectorDossier } from '../controllers/sector-dossiers.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const dossierSchema = z.object({
  sector: z.enum(['TEACHERS', 'PARENTS', 'STUDENTS', 'SECRETARY', 'ACCOUNTANT', 'CLASS_TUTOR', 'DISCIPLINE', 'LIBRARY', 'NURSE', 'TRANSPORT', 'CANTEEN', 'COLLABORATORS']),
  title: z.string().trim().min(2),
  description: z.string().trim().min(3),
  owner: z.string().trim().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dueDate: z.preprocess((value) => (value === '' ? undefined : value), z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date').optional())
});

router.use(requireAuth);
router.get('/', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), listSectorDossiers);
router.get('/summary', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), getSectorDossierSummary);
router.get('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), getSectorDossier);
router.post('/', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), validateBody(dossierSchema), createSectorDossier);
router.put('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), validateBody(dossierSchema.partial()), updateSectorDossier);
router.delete('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR'), archiveSectorDossier);

export default router;
