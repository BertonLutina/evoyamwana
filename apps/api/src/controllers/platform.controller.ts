import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { platformService } from '../services/platform.service.js';
import { AppError } from '../utils/app-error.js';

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

export const listPlatformSchools: RequestHandler = async (req, res, next) => {
  try {
    const result = await platformService.listSchools(listQuerySchema.parse(req.query));
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const registrationQuerySchema = listQuerySchema.extend({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional()
});

const rejectSchema = z.object({
  reason: z.string().trim().optional()
});

const getAuthUserId = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) throw new AppError('Authentication is required', 401);
  return req.user.id;
};

export const listSchoolRegistrationRequests: RequestHandler = async (req, res, next) => {
  try {
    const result = await platformService.listSchoolRegistrationRequests(registrationQuerySchema.parse(req.query));
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const approveSchoolRegistrationRequest: RequestHandler = async (req, res, next) => {
  try {
    const result = await platformService.approveSchoolRegistrationRequest(z.string().uuid().parse(req.params.id), getAuthUserId(req));
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const rejectSchoolRegistrationRequest: RequestHandler = async (req, res, next) => {
  try {
    const input = rejectSchema.parse(req.body);
    const result = await platformService.rejectSchoolRegistrationRequest(z.string().uuid().parse(req.params.id), getAuthUserId(req), input.reason);
    const response: ApiSuccessResponse<{ request: typeof result }> = { success: true, data: { request: result } };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const listPlatformAdmins: RequestHandler = async (req, res, next) => {
  try {
    const result = await platformService.listAdmins(listQuerySchema.parse(req.query));
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const listPlatformUsers: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.extend({ role: z.string().trim().optional() }).parse(req.query);
    const result = await platformService.listUsers(query);
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getPlatformReports: RequestHandler = async (_req, res, next) => {
  try {
    const result = await platformService.getReports();
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
