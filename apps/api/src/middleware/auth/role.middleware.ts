import type { UserRole } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { AppError } from '../../utils/app-error.js';

export const requireRole = (...roles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError('Authentication is required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('You do not have permission to access this resource', 403));
      return;
    }

    next();
  };
};
