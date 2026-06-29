import type { ApiErrorResponse } from '@evoyamwana/shared';
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    const response: ApiErrorResponse = {
      message: 'Validation failed',
      statusCode: 400,
      details: error.flatten()
    };
    res.status(400).json(response);
    return;
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const response: ApiErrorResponse = {
    message: error instanceof AppError ? error.message : 'Internal server error',
    statusCode,
    details: error instanceof AppError ? error.details : undefined
  };

  if (env.NODE_ENV !== 'production' && !(error instanceof AppError)) {
    response.details = { message: error.message, stack: error.stack };
  }

  res.status(statusCode).json(response);
};
