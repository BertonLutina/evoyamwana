import type { ApiSuccessResponse } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { fileService, fileToDto } from '../services/files.service.js';
import { AppError } from '../utils/app-error.js';

const getAuthUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) {
    throw new AppError('Authentication is required', 401);
  }
  return req.user;
};

const fileIdSchema = z.string().uuid();

export const uploadFile: RequestHandler = async (req, res, next) => {
  try {
    const uploaded = req.file;
    if (!uploaded) {
      throw new AppError('No file uploaded', 400);
    }

    const record = await fileService.createStoredFile(
      getAuthUser(req),
      {
        originalName: uploaded.originalname,
        mimeType: uploaded.mimetype,
        size: uploaded.size,
        tempPath: uploaded.path
      },
      typeof req.body?.purpose === 'string' ? req.body.purpose : undefined
    );

    const response: ApiSuccessResponse<{ file: ReturnType<typeof fileToDto> }> = {
      success: true,
      data: { file: fileToDto(record) }
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const downloadFile: RequestHandler = async (req, res, next) => {
  try {
    const id = fileIdSchema.parse(req.params.id);
    const { record, stream } = await fileService.getDownload(getAuthUser(req), id);
    res.setHeader('Content-Type', record.mimeType);
    res.setHeader('Content-Length', String(record.size));
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(record.originalName)}"`);
    stream.on('error', next);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};
