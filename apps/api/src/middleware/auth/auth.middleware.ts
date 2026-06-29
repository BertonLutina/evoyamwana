import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser, UserRole } from '@evoyamwana/shared';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';

interface AuthTokenPayload extends jwt.JwtPayload {
  sub: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolId: string | null;
  schoolName?: string | null;
}

const isAuthTokenPayload = (payload: string | jwt.JwtPayload): payload is AuthTokenPayload => {
  return (
    typeof payload !== 'string' &&
    typeof payload.sub === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.fullName === 'string' &&
    typeof payload.role === 'string'
  );
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new AppError('Authentication token is required', 401));
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET);

    if (!isAuthTokenPayload(payload)) {
      next(new AppError('Invalid authentication token payload', 401));
      return;
    }

    const user: AuthUser = {
      id: payload.sub,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
      schoolId: payload.schoolId ?? null,
      schoolName: payload.schoolName ?? null
    };

    req.user = user;
    next();
  } catch {
    next(new AppError('Invalid or expired authentication token', 401));
  }
};
