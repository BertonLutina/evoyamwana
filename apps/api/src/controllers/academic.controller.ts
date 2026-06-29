import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { academicService } from '../services/academic.service.js';
import { AppError } from '../utils/app-error.js';

const getSchoolId = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user?.schoolId) throw new AppError('School context is required', 403);
  return req.user.schoolId;
};

const getUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) throw new AppError('Authentication is required', 401);
  return req.user;
};

const listQuery = z.object({
  search: z.string().trim().optional(),
  classId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  schoolYearId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

const subjectSchema = z.object({
  name: z.string().trim().min(2),
  code: z.string().trim().min(1),
  classId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  coefficient: z.coerce.number().positive().default(1),
  description: z.string().trim().optional()
});

const schoolYearSchema = z.object({
  name: z.string().trim().min(4),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.boolean().optional()
});

const termSchema = z.object({
  schoolYearId: z.string().uuid(),
  name: z.string().trim().min(2),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  order: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional()
});

const timetableSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid().optional(),
  dayOfWeek: z.coerce.number().int().min(1).max(7),
  startsAt: z.string().trim().min(4),
  endsAt: z.string().trim().min(4),
  room: z.string().trim().optional(),
  term: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

const assignmentSchema = z.object({
  teacherId: z.string().uuid(),
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  title: z.string().trim().min(2),
  description: z.string().trim().optional(),
  dueDate: z.string(),
  maxScore: z.coerce.number().positive(),
  term: z.string().trim().min(1),
  attachmentUrl: z.string().trim().optional()
});

const feeSchema = z.object({
  name: z.string().trim().min(2),
  amount: z.coerce.number().positive(),
  billingCycle: z.enum(['trimester', 'annual', 'monthly', 'one_time']).optional(),
  classId: z.string().uuid().optional(),
  category: z.string().trim().optional(),
  term: z.string().trim().optional(),
  dueDate: z.string().optional(),
  description: z.string().trim().optional()
});

const send = <T>(res: Parameters<RequestHandler>[1], data: T, status = 200) => {
  const response: ApiSuccessResponse<T> = { success: true, data };
  res.status(status).json(response);
};

export const listSubjects: RequestHandler = async (req, res, next) => {
  try { send(res, await academicService.listSubjects(getUser(req), listQuery.parse(req.query))); } catch (error) { next(error); }
};
export const createSubject: RequestHandler = async (req, res, next) => {
  try { send(res, { subject: await academicService.createSubject(getSchoolId(req), subjectSchema.parse(req.body)) }, 201); } catch (error) { next(error); }
};
export const listSchoolYears: RequestHandler = async (req, res, next) => {
  try { send(res, await academicService.listSchoolYears(getUser(req), listQuery.parse(req.query))); } catch (error) { next(error); }
};
export const createSchoolYear: RequestHandler = async (req, res, next) => {
  try { send(res, { schoolYear: await academicService.createSchoolYear(getSchoolId(req), schoolYearSchema.parse(req.body)) }, 201); } catch (error) { next(error); }
};
export const createTerm: RequestHandler = async (req, res, next) => {
  try { send(res, { term: await academicService.createTerm(getSchoolId(req), termSchema.parse(req.body)) }, 201); } catch (error) { next(error); }
};
export const listTimetable: RequestHandler = async (req, res, next) => {
  try { send(res, await academicService.listTimetable(getUser(req), listQuery.parse(req.query))); } catch (error) { next(error); }
};
export const createTimetableEntry: RequestHandler = async (req, res, next) => {
  try { send(res, { entry: await academicService.createTimetableEntry(getSchoolId(req), timetableSchema.parse(req.body)) }, 201); } catch (error) { next(error); }
};
export const listAssignments: RequestHandler = async (req, res, next) => {
  try { send(res, await academicService.listAssignments(getUser(req), listQuery.parse(req.query))); } catch (error) { next(error); }
};
export const createAssignment: RequestHandler = async (req, res, next) => {
  try { send(res, { assignment: await academicService.createAssignment(getSchoolId(req), assignmentSchema.parse(req.body)) }, 201); } catch (error) { next(error); }
};
export const listFees: RequestHandler = async (req, res, next) => {
  try { send(res, await academicService.listFees(getUser(req), listQuery.parse(req.query))); } catch (error) { next(error); }
};
export const createFee: RequestHandler = async (req, res, next) => {
  try { send(res, { fee: await academicService.createFee(getSchoolId(req), feeSchema.parse(req.body)) }, 201); } catch (error) { next(error); }
};
