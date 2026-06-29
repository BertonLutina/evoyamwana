import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { studentsService } from '../services/students.service.js';
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
  gender: z.string().trim().optional(),
  classId: z.string().uuid().optional(),
  schoolYearId: z.string().uuid().optional(),
  category: z.enum(['creche', 'maternelle', 'primaire', 'secondaire', 'secondaire_general', 'secondaire_technique', 'formation', 'haute_ecole', 'universite', 'mixte']).optional(),
  status: z.enum(['active', 'inactive', 'transferred', 'graduated', 'all']).default('active'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
});

export const listStudents: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await studentsService.listStudents(getSchoolId(req), query, getUser(req));
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const listStudentsByCategory: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.parse({ ...req.query, category: req.params.category });
    const result = await studentsService.listStudents(getSchoolId(req), query, getUser(req));
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const listStudentsByClass: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.parse({ ...req.query, classId: req.params.classId });
    const result = await studentsService.listStudents(getSchoolId(req), query, getUser(req));
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const listStudentsBySchoolYear: RequestHandler = async (req, res, next) => {
  try {
    const query = listQuerySchema.parse({ ...req.query, schoolYearId: req.params.schoolYearId });
    const result = await studentsService.listStudents(getSchoolId(req), query, getUser(req));
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getStudent: RequestHandler = async (req, res, next) => {
  try {
    const student = await studentsService.getStudentById(getSchoolId(req), req.params.id, getUser(req));
    res.status(200).json({ success: true, data: { student } });
  } catch (error) {
    next(error);
  }
};

export const getCurrentStudent: RequestHandler = async (req, res, next) => {
  try {
    const student = await studentsService.getCurrentStudent(getUser(req));
    res.status(200).json({ success: true, data: { student } });
  } catch (error) {
    next(error);
  }
};

export const createStudent: RequestHandler = async (req, res, next) => {
  try {
    const student = await studentsService.createStudent(getSchoolId(req), req.body);
    res.status(201).json({ success: true, data: { student } });
  } catch (error) {
    next(error);
  }
};

export const updateStudent: RequestHandler = async (req, res, next) => {
  try {
    const student = await studentsService.updateStudent(getSchoolId(req), req.params.id, req.body);
    res.status(200).json({ success: true, data: { student } });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent: RequestHandler = async (req, res, next) => {
  try {
    await studentsService.deleteStudent(getSchoolId(req), req.params.id);
    res.status(200).json({
      success: true,
      data: {
        message: 'Student deactivated successfully'
      }
    });
  } catch (error) {
    next(error);
  }
};
