import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { gradesService } from '../services/grades.service.js';
import { AppError } from '../utils/app-error.js';

const getAuthUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) {
    throw new AppError('Authentication is required', 401);
  }
  return req.user;
};

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  term: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
});

export const listGrades: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await gradesService.listGrades(getAuthUser(req), query);
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const listStudentGradeSummaries: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await gradesService.listStudentSummaries(getAuthUser(req), query);
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createGrade: RequestHandler = async (req, res, next) => {
  try {
    const grade = await gradesService.createGrade(getAuthUser(req), req.body);
    res.status(201).json({ success: true, data: { grade } });
  } catch (error) {
    next(error);
  }
};

export const updateGrade: RequestHandler = async (req, res, next) => {
  try {
    const grade = await gradesService.updateGrade(getAuthUser(req), req.params.id, req.body);
    res.status(200).json({ success: true, data: { grade } });
  } catch (error) {
    next(error);
  }
};

export const deleteGrade: RequestHandler = async (req, res, next) => {
  try {
    const result = await gradesService.deleteGrade(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
