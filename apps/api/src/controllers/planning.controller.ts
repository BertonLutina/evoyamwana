import type { RequestHandler } from 'express';
import { z } from 'zod';
import { planningService } from '../services/planning.service.js';
import { AppError } from '../utils/app-error.js';

const getAuthUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) throw new AppError('Authentication is required', 401);
  return req.user;
};

const querySchema = z.object({
  from: z.string().trim().optional(),
  to: z.string().trim().optional()
});

export const listPlannings: RequestHandler = async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const result = await planningService.list(getAuthUser(req), query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getPlanning: RequestHandler = async (req, res, next) => {
  try {
    const planning = await planningService.get(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: { planning } });
  } catch (error) {
    next(error);
  }
};

export const createPlanning: RequestHandler = async (req, res, next) => {
  try {
    const planning = await planningService.create(getAuthUser(req), req.body);
    res.status(201).json({ success: true, data: { planning } });
  } catch (error) {
    next(error);
  }
};

export const updatePlanning: RequestHandler = async (req, res, next) => {
  try {
    const planning = await planningService.update(getAuthUser(req), req.params.id, req.body);
    res.status(200).json({ success: true, data: { planning } });
  } catch (error) {
    next(error);
  }
};

export const deletePlanning: RequestHandler = async (req, res, next) => {
  try {
    const result = await planningService.remove(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listPlanningTargets: RequestHandler = async (req, res, next) => {
  try {
    const targets = await planningService.eligibleTargets(getAuthUser(req));
    res.status(200).json({ success: true, data: { targets } });
  } catch (error) {
    next(error);
  }
};
