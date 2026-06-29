import { Router } from 'express';
import { getConversation, listMessageContacts, listMyMessages, markMessageRead, sendMessage } from '../controllers/messages.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { validateBody } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const sendMessageSchema = z.object({
  recipientId: z.string().uuid(),
  body: z.string().trim().min(1),
  subject: z.string().trim().optional()
});

router.use(requireAuth);
router.get('/', listMyMessages);
router.get('/contacts', listMessageContacts);
router.get('/conversation/:userId', getConversation);
router.post('/', validateBody(sendMessageSchema), sendMessage);
router.put('/:id/read', markMessageRead);

export default router;
