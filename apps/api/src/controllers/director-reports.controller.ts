import type { RequestHandler } from 'express';
import { z } from 'zod';
import { directorReportsService } from '../services/director-reports.service.js';
import { AppError } from '../utils/app-error.js';

const getAuthUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) throw new AppError('Authentication is required', 401);
  return req.user;
};

const typeEnum = z.enum(['ACADEMIC', 'ATTENDANCE', 'FINANCE', 'DISCIPLINE', 'HEALTH', 'INFRASTRUCTURE', 'REPUTATION', 'PARTNERSHIP', 'COMPLIANCE', 'MEETING']);
const statusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED']);
const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const reportSchema = z.object({
  type: typeEnum,
  title: z.string().trim().min(2),
  summary: z.string().trim().min(2),
  period: z.string().trim().min(2),
  owner: z.string().trim().optional().nullable(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  dueDate: z.string().trim().optional().nullable()
});

export const querySchema = z.object({
  search: z.string().trim().optional(),
  type: typeEnum.optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

export const listDirectorReports: RequestHandler = async (req, res, next) => {
  try {
    const result = await directorReportsService.list(getAuthUser(req), querySchema.parse(req.query));
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getDirectorReportSummary: RequestHandler = async (req, res, next) => {
  try {
    const summary = await directorReportsService.summary(getAuthUser(req));
    res.status(200).json({ success: true, data: { summary } });
  } catch (error) {
    next(error);
  }
};

export const getDirectorReport: RequestHandler = async (req, res, next) => {
  try {
    const report = await directorReportsService.get(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
};

export const createDirectorReport: RequestHandler = async (req, res, next) => {
  try {
    const report = await directorReportsService.create(getAuthUser(req), reportSchema.parse(req.body));
    res.status(201).json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
};

export const updateDirectorReport: RequestHandler = async (req, res, next) => {
  try {
    const report = await directorReportsService.update(getAuthUser(req), req.params.id, reportSchema.partial().parse(req.body));
    res.status(200).json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
};

export const archiveDirectorReport: RequestHandler = async (req, res, next) => {
  try {
    const report = await directorReportsService.archive(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
};
