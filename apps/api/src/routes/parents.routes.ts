import { Router } from 'express';
import { z } from 'zod';
import { createParent, getParent, listParents } from '../controllers/parents.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const parentSchema = z.object({
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  password: z.string().min(8).optional()
});

router.use(requireAuth);

const parentReadRoles = requireRole('SCHOOL_ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SECRETARY', 'ACCOUNTANT', 'CLASS_TUTOR', 'TRANSPORT_MANAGER');
const parentWriteRoles = requireRole('SCHOOL_ADMIN', 'SUPER_ADMIN', 'SECRETARY');

router.get('/', parentReadRoles, listParents);
router.get('/:id', parentReadRoles, getParent);
router.post('/', parentWriteRoles, validateBody(parentSchema), createParent);

export default router;
