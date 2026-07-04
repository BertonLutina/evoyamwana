import { Router } from 'express';
import { z } from 'zod';
import { createPlanning, deletePlanning, getPlanning, listPlannings, listPlanningTargets, updatePlanning } from '../controllers/planning.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const planningSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().optional().nullable(),
  location: z.string().trim().optional().nullable(),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date'),
  startMinutes: z.coerce.number().int().min(0).max(1440),
  endMinutes: z.coerce.number().int().min(0).max(1440),
  participantUserIds: z.array(z.string().uuid()).optional()
});

router.use(requireAuth);
router.get('/', listPlannings);
router.get('/targets', listPlanningTargets);
router.get('/:id', getPlanning);
router.post('/', validateBody(planningSchema), createPlanning);
router.put('/:id', validateBody(planningSchema.partial()), updatePlanning);
router.delete('/:id', deletePlanning);

export default router;
