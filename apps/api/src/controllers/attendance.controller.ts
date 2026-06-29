import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { attendanceService } from '../services/attendance.service.js';
import { AppError } from '../utils/app-error.js';

const currentUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) throw new AppError('Authentication is required', 401);
  return req.user;
};

const dateQuery = z.object({
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')
});

export const getClassAttendance: RequestHandler = async (req, res, next) => {
  try {
    const { date } = dateQuery.parse(req.query);
    const register = await attendanceService.getClassAttendance(currentUser(req), req.params.classId, date);
    const response: ApiSuccessResponse<{ register: unknown }> = { success: true, data: { register } };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const recordAttendance: RequestHandler = async (req, res, next) => {
  try {
    const attendance = await attendanceService.recordAttendance(currentUser(req), req.body);
    res.status(201).json({ success: true, data: { attendance } });
  } catch (error) {
    next(error);
  }
};

export const updateAttendance: RequestHandler = async (req, res, next) => {
  try {
    const attendance = await attendanceService.updateAttendance(currentUser(req), req.params.id, req.body);
    res.status(200).json({ success: true, data: { attendance } });
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendance: RequestHandler = async (req, res, next) => {
  try {
    const attendance = await attendanceService.getStudentAttendance(currentUser(req), req.params.studentId);
    res.status(200).json({ success: true, data: { attendance } });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance: RequestHandler = async (req, res, next) => {
  try {
    const payload = await attendanceService.getMyAttendance(currentUser(req));
    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceReport: RequestHandler = async (req, res, next) => {
  try {
    const { date } = dateQuery.parse(req.query);
    const report = await attendanceService.getReport(currentUser(req), date);
    res.status(200).json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
};
