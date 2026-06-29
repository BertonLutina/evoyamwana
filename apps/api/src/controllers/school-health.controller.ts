import type { RequestHandler } from 'express';
import { z } from 'zod';
import { schoolHealthService } from '../services/school-health.service.js';
import { AppError } from '../utils/app-error.js';

const getAuthUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) throw new AppError('Authentication is required', 401);
  return req.user;
};

const querySchema = z.object({
  search: z.string().trim().optional(),
  category: z.enum(['ATTENDANCE', 'PEDAGOGY', 'FINANCE', 'INFRASTRUCTURE', 'SAFETY', 'HEALTH', 'REPUTATION', 'COMPLIANCE']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

export const listSchoolHealthRecords: RequestHandler = async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const result = await schoolHealthService.list(getAuthUser(req), query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getSchoolHealthSummary: RequestHandler = async (req, res, next) => {
  try {
    const summary = await schoolHealthService.summary(getAuthUser(req));
    res.status(200).json({ success: true, data: { summary } });
  } catch (error) {
    next(error);
  }
};

export const getSchoolHealthProgression: RequestHandler = async (req, res, next) => {
  try {
    const schoolYearStart = req.query.schoolYearStart ? Number(req.query.schoolYearStart) : undefined;
    const progression = await schoolHealthService.progression(getAuthUser(req), schoolYearStart);
    res.status(200).json({ success: true, data: { progression } });
  } catch (error) {
    next(error);
  }
};

export const getSchoolHealthRecord: RequestHandler = async (req, res, next) => {
  try {
    const record = await schoolHealthService.get(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: { record } });
  } catch (error) {
    next(error);
  }
};

export const createSchoolHealthRecord: RequestHandler = async (req, res, next) => {
  try {
    const record = await schoolHealthService.create(getAuthUser(req), req.body);
    res.status(201).json({ success: true, data: { record } });
  } catch (error) {
    next(error);
  }
};

export const updateSchoolHealthRecord: RequestHandler = async (req, res, next) => {
  try {
    const record = await schoolHealthService.update(getAuthUser(req), req.params.id, req.body);
    res.status(200).json({ success: true, data: { record } });
  } catch (error) {
    next(error);
  }
};

export const archiveSchoolHealthRecord: RequestHandler = async (req, res, next) => {
  try {
    const record = await schoolHealthService.archive(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: { record } });
  } catch (error) {
    next(error);
  }
};
