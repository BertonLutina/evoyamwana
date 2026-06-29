import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { teachersService } from '../services/teachers.service.js';
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
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
});

export const listTeachers: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await teachersService.listTeachers(getSchoolId(req), query);
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getTeacher: RequestHandler = async (req, res, next) => {
  try {
    const teacher = await teachersService.getTeacher(getSchoolId(req), req.params.id);
    res.status(200).json({ success: true, data: { teacher } });
  } catch (error) {
    next(error);
  }
};

export const getCurrentTeacher: RequestHandler = async (req, res, next) => {
  try {
    const teacher = await teachersService.getCurrentTeacher(getUser(req));
    res.status(200).json({ success: true, data: { teacher } });
  } catch (error) {
    next(error);
  }
};

export const createTeacher: RequestHandler = async (req, res, next) => {
  try {
    const teacher = await teachersService.createTeacher(getSchoolId(req), req.body);
    res.status(201).json({ success: true, data: { teacher } });
  } catch (error) {
    next(error);
  }
};

export const updateCurrentTeacher: RequestHandler = async (req, res, next) => {
  try {
    const teacher = await teachersService.updateCurrentTeacher(getUser(req), req.body);
    res.status(200).json({ success: true, data: { teacher } });
  } catch (error) {
    next(error);
  }
};

export const updateTeacher: RequestHandler = async (req, res, next) => {
  try {
    const teacher = await teachersService.updateTeacher(getSchoolId(req), req.params.id, req.body);
    res.status(200).json({ success: true, data: { teacher } });
  } catch (error) {
    next(error);
  }
};

export const deleteTeacher: RequestHandler = async (req, res, next) => {
  try {
    const teacher = await teachersService.deleteTeacher(getSchoolId(req), req.params.id);
    res.status(200).json({ success: true, data: { teacher } });
  } catch (error) {
    next(error);
  }
};
