import type { RequestHandler } from 'express';
import { z } from 'zod';
import { sectorDossiersService } from '../services/sector-dossiers.service.js';
import { AppError } from '../utils/app-error.js';

const getAuthUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) throw new AppError('Authentication is required', 401);
  return req.user;
};

const sectorEnum = z.enum(['TEACHERS', 'PARENTS', 'STUDENTS', 'SECRETARY', 'ACCOUNTANT', 'CLASS_TUTOR', 'DISCIPLINE', 'LIBRARY', 'NURSE', 'TRANSPORT', 'CANTEEN', 'COLLABORATORS']);
const statusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED']);
const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const bodySchema = z.object({
  sector: sectorEnum,
  title: z.string().trim().min(2),
  description: z.string().trim().min(2),
  owner: z.string().trim().optional().nullable(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  dueDate: z.string().trim().optional().nullable()
});

const updateBodySchema = bodySchema.partial();

export const querySchema = z.object({
  search: z.string().trim().optional(),
  sector: sectorEnum.optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

export const listSectorDossiers: RequestHandler = async (req, res, next) => {
  try {
    const result = await sectorDossiersService.list(getAuthUser(req), querySchema.parse(req.query));
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getSectorDossierSummary: RequestHandler = async (req, res, next) => {
  try {
    const summary = await sectorDossiersService.summary(getAuthUser(req));
    res.status(200).json({ success: true, data: { summary } });
  } catch (error) {
    next(error);
  }
};

export const getSectorDossier: RequestHandler = async (req, res, next) => {
  try {
    const dossier = await sectorDossiersService.get(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: { dossier } });
  } catch (error) {
    next(error);
  }
};

export const createSectorDossier: RequestHandler = async (req, res, next) => {
  try {
    const dossier = await sectorDossiersService.create(getAuthUser(req), bodySchema.parse(req.body));
    res.status(201).json({ success: true, data: { dossier } });
  } catch (error) {
    next(error);
  }
};

export const updateSectorDossier: RequestHandler = async (req, res, next) => {
  try {
    const dossier = await sectorDossiersService.update(getAuthUser(req), req.params.id, updateBodySchema.parse(req.body));
    res.status(200).json({ success: true, data: { dossier } });
  } catch (error) {
    next(error);
  }
};

export const archiveSectorDossier: RequestHandler = async (req, res, next) => {
  try {
    const dossier = await sectorDossiersService.archive(getAuthUser(req), req.params.id);
    res.status(200).json({ success: true, data: { dossier } });
  } catch (error) {
    next(error);
  }
};
