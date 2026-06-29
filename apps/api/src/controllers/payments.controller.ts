import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { paymentsService } from '../services/payments.service.js';
import { AppError } from '../utils/app-error.js';

const getAuthUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) {
    throw new AppError('Authentication is required', 401);
  }

  return req.user;
};

export const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  studentId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'OTHER']).optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
});

export const listPayments: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await paymentsService.listPayments(getAuthUser(req), query);
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getPayment: RequestHandler = async (req, res, next) => {
  try {
    const payment = await paymentsService.getPaymentById(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: { payment } });
  } catch (error) {
    next(error);
  }
};

export const getPaymentStats: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const stats = await paymentsService.getPaymentStats(getAuthUser(req), query);
    res.status(200).json({ success: true, data: { stats } });
  } catch (error) {
    next(error);
  }
};

export const createPayment: RequestHandler = async (req, res, next) => {
  try {
    const payment = await paymentsService.createPayment(getAuthUser(req), req.body);
    res.status(201).json({ success: true, data: { payment } });
  } catch (error) {
    next(error);
  }
};

export const updatePayment: RequestHandler = async (req, res, next) => {
  try {
    const payment = await paymentsService.updatePayment(getAuthUser(req), req.params.id, req.body);
    res.status(200).json({ success: true, data: { payment } });
  } catch (error) {
    next(error);
  }
};

export const deletePayment: RequestHandler = async (req, res, next) => {
  try {
    const payment = await paymentsService.deletePayment(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: { payment } });
  } catch (error) {
    next(error);
  }
};
