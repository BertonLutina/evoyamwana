import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { classesService } from '../services/classes.service.js';
import { AppError } from '../utils/app-error.js';

const getSchoolId = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user?.schoolId) {
    throw new AppError('School context is required', 403);
  }

  return req.user.schoolId;
};

const getUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) {
    throw new AppError('Authentication is required', 401);
  }

  return req.user;
};

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  academicYear: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
});

export const listClasses: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await classesService.listClasses(getUser(req), query);
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getClass: RequestHandler = async (req, res, next) => {
  try {
    const classRecord = await classesService.getClass(getUser(req), req.params.id);
    res.status(200).json({ success: true, data: { class: classRecord } });
  } catch (error) {
    next(error);
  }
};

export const createClass: RequestHandler = async (req, res, next) => {
  try {
    const classRecord = await classesService.createClass(getSchoolId(req), req.body);
    res.status(201).json({ success: true, data: { class: classRecord } });
  } catch (error) {
    next(error);
  }
};
