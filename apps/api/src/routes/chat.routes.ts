import { Router } from 'express';
import { createChatConversation, listChatContacts, listChatConversations, sendChatMessage } from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/contacts', listChatContacts);
router.get('/conversations', listChatConversations);
router.post('/conversations', createChatConversation);
router.post('/messages', sendChatMessage);

export default router;
