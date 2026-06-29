import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { parentsService } from '../services/parents.service.js';
import { AppError } from '../utils/app-error.js';

const getSchoolId = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user?.schoolId) {
    throw new AppError('School context is required', 403);
  }

  return req.user.schoolId;
};

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
});

export const listParents: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await parentsService.listParents(getSchoolId(req), query);
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getParent: RequestHandler = async (req, res, next) => {
  try {
    const parent = await parentsService.getParent(getSchoolId(req), req.params.id);
    res.status(200).json({ success: true, data: { parent } });
  } catch (error) {
    next(error);
  }
};

export const createParent: RequestHandler = async (req, res, next) => {
  try {
    const parent = await parentsService.createParent(getSchoolId(req), req.body);
    res.status(201).json({ success: true, data: { parent } });
  } catch (error) {
    next(error);
  }
};
