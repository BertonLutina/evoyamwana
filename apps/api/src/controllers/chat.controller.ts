import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { chatService } from '../services/chat.service.js';
import { AppError } from '../utils/app-error.js';

const getAuthUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) {
    throw new AppError('Authentication is required', 401);
  }
  return req.user;
};

const createConversationSchema = z.object({
  contactId: z.string().uuid().optional(),
  recipientId: z.string().uuid().optional()
}).refine((value) => value.contactId || value.recipientId, {
  message: 'contactId or recipientId is required'
});

const sendChatMessageSchema = z.object({
  conversationId: z.string().trim().optional(),
  recipientId: z.string().uuid(),
  body: z.string().trim().min(1),
  subject: z.string().trim().optional()
});

export const listChatContacts: RequestHandler = async (req, res, next) => {
  try {
    const contacts = await chatService.listContacts(getAuthUser(req));
    const response: ApiSuccessResponse<{ contacts: typeof contacts }> = { success: true, data: { contacts } };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const listChatConversations: RequestHandler = async (req, res, next) => {
  try {
    const conversations = await chatService.listConversations(getAuthUser(req));
    res.status(200).json({ success: true, data: { conversations } });
  } catch (error) {
    next(error);
  }
};

export const createChatConversation: RequestHandler = async (req, res, next) => {
  try {
    const input = createConversationSchema.parse(req.body);
    const conversation = await chatService.createConversation(getAuthUser(req), input.contactId ?? input.recipientId ?? '');
    res.status(201).json({ success: true, data: { conversation } });
  } catch (error) {
    next(error);
  }
};

export const sendChatMessage: RequestHandler = async (req, res, next) => {
  try {
    const input = sendChatMessageSchema.parse(req.body);
    const message = await chatService.sendMessage(getAuthUser(req), input);
    res.status(201).json({ success: true, data: { message } });
  } catch (error) {
    next(error);
  }
};
