import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { staffUsersService } from '../services/staff-users.service.js';
import { AppError } from '../utils/app-error.js';

const staffRoleSchema = z.enum([
  'SCHOOL_ADMIN',
  'DIRECTOR',
  'SECRETARY',
  'ACCOUNTANT',
  'CLASS_TUTOR',
  'DISCIPLINE_OFFICER',
  'LIBRARIAN',
  'NURSE',
  'TRANSPORT_MANAGER',
  'CANTEEN_MANAGER'
]);

const staffUserSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8).optional(),
  role: staffRoleSchema,
  schoolId: z.string().uuid().optional()
});

const getAuthUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) throw new AppError('Authentication is required', 401);
  return req.user;
};

export const listStaffUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await staffUsersService.listStaffUsers(getAuthUser(req));
    const response: ApiSuccessResponse<{ users: typeof users }> = { success: true, data: { users } };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createStaffUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await staffUsersService.createStaffUser(getAuthUser(req), staffUserSchema.parse(req.body));
    const response: ApiSuccessResponse<{ user: typeof user }> = { success: true, data: { user } };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
