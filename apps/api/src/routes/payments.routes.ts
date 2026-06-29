import { Router } from 'express';
import { z } from 'zod';
import { createPayment, deletePayment, getPayment, getPaymentStats, listPayments, updatePayment } from '../controllers/payments.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { requireRole } from '../middleware/auth/role.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const optionalUuid = z.preprocess((value) => (value === '' ? undefined : value), z.string().uuid().nullable().optional());
const optionalDate = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date').optional()
);

const paymentSchema = z.object({
  studentId: z.string().uuid(),
  parentId: optionalUuid,
  amount: z.coerce.number().positive(),
  amountPaid: z.coerce.number().min(0).optional(),
  dueDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date'),
  status: z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'OTHER']).optional(),
  receiptNumber: z.string().trim().optional(),
  description: z.string().trim().optional(),
  paidAt: optionalDate
});

router.use(requireAuth);
router.get('/stats', requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'ACCOUNTANT', 'CANTEEN_MANAGER'), getPaymentStats);
router.get('/', requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'ACCOUNTANT', 'CANTEEN_MANAGER', 'PARENT', 'STUDENT'), listPayments);
router.get('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'ACCOUNTANT', 'CANTEEN_MANAGER', 'PARENT', 'STUDENT'), getPayment);
router.post('/', requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'ACCOUNTANT'), validateBody(paymentSchema), createPayment);
router.put('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'ACCOUNTANT'), validateBody(paymentSchema.partial()), updatePayment);
router.delete('/:id', requireRole('SCHOOL_ADMIN', 'DIRECTOR', 'ACCOUNTANT'), deletePayment);

export default router;
