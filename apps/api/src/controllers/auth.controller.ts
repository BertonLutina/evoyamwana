import type { ApiSuccessResponse, AuthResponse, AuthUser } from '@evoyamwana/shared';
import type { RequestHandler } from 'express';
import { authService } from '../services/auth.service.js';
import { AppError } from '../utils/app-error.js';

const authResponse = (result: AuthResponse): ApiSuccessResponse<AuthResponse> => ({
  success: true,
  data: result
});

export const registerSchool: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.registerSchool(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(authResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const response: ApiSuccessResponse<{ user: AuthUser }> = {
      success: true,
      data: {
        user: req.user
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Logout successful. Discard the access token on the client.'
    }
  });
};
