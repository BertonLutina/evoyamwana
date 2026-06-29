import { Router } from 'express';
import { z } from 'zod';
import { africanCountryNames } from '@evoyamwana/shared';
import { getCurrentUser, login, logout, registerSchool } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

export const registerSchoolSchema = z.object({
  schoolName: z.string().trim().min(2),
  legalName: z.string().trim().min(2).optional(),
  country: z.string().trim().min(2).refine((country) => africanCountryNames.includes(country), {
    message: 'Country must be an African country'
  }),
  city: z.string().trim().min(2),
  address: z.string().trim().min(5).optional(),
  schoolType: z.enum(['creche', 'maternelle', 'primary', 'secondary', 'secondary_general', 'secondary_technical', 'training_center', 'haute_ecole', 'university', 'primary_secondary', 'mixed']).optional(),
  schoolStatus: z.enum(['private', 'public', 'faith_based', 'community']).optional(),
  accreditationNumber: z.string().trim().min(2).optional(),
  schoolEmail: z.string().trim().email().toLowerCase(),
  schoolPhone: z.string().trim().optional(),
  ownerFullName: z.string().trim().min(2),
  ownerEmail: z.string().trim().email().toLowerCase(),
  password: z.string().min(8),
  documentUrl: z.string().trim().optional()
});

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8)
});

router.post('/register-school', validateBody(registerSchoolSchema), registerSchool);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', requireAuth, getCurrentUser);
router.post('/logout', requireAuth, logout);

export default router;
