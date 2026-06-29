import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { messagesService } from '../services/messages.service.js';
import { AppError } from '../utils/app-error.js';

const sendMessageSchema = z.object({
  recipientId: z.string().uuid(),
  body: z.string().trim().min(1),
  subject: z.string().trim().optional()
});

const getAuthUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) {
    throw new AppError('Authentication is required', 401);
  }
  return req.user;
};

export const getConversation: RequestHandler = async (req, res, next) => {
  try {
    const messages = await messagesService.getConversation(getAuthUser(req), req.params.userId);
    const response: ApiSuccessResponse<{ messages: typeof messages }> = { success: true, data: { messages } };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const listMyMessages: RequestHandler = async (req, res, next) => {
  try {
    const messages = await messagesService.listMyMessages(getAuthUser(req));
    res.status(200).json({ success: true, data: { messages } });
  } catch (error) {
    next(error);
  }
};

export const listMessageContacts: RequestHandler = async (req, res, next) => {
  try {
    const contacts = await messagesService.listContacts(getAuthUser(req));
    res.status(200).json({ success: true, data: { contacts } });
  } catch (error) {
    next(error);
  }
};

export const sendMessage: RequestHandler = async (req, res, next) => {
  try {
    const input = sendMessageSchema.parse(req.body);
    const message = await messagesService.sendMessage(getAuthUser(req), input);
    res.status(201).json({ success: true, data: { message } });
  } catch (error) {
    next(error);
  }
};

export const markMessageRead: RequestHandler = async (req, res, next) => {
  try {
    const message = await messagesService.markRead(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: { message } });
  } catch (error) {
    next(error);
  }
};
