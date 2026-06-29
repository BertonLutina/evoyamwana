import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { dashboardService } from '../services/dashboard.service.js';
import { AppError } from '../utils/app-error.js';

const currentUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) throw new AppError('Authentication is required', 401);
  return req.user;
};

const summaryQuery = z.object({
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date').optional()
});

export const getDashboardSummary: RequestHandler = async (req, res, next) => {
  try {
    const { date } = summaryQuery.parse(req.query);
    const summary = await dashboardService.getSummary(currentUser(req), date);
    const response: ApiSuccessResponse<{ summary: unknown }> = { success: true, data: { summary } };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
