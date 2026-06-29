import type { ApiSuccessResponse, AuthResponse } from '@evoyamwana/shared';
import { api } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterSchoolPayload {
  schoolName: string;
  country: string;
  city: string;
  schoolEmail: string;
  schoolPhone?: string;
  ownerFullName: string;
  ownerEmail: string;
  password: string;
}

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/login', payload);
    return response.data.data;
  },

  async registerSchool(payload: RegisterSchoolPayload) {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/register-school', payload);
    return response.data.data;
  },

  async me() {
    const response = await api.get<ApiSuccessResponse<{ user: AuthResponse['user'] }>>('/auth/me');
    return response.data.data.user;
  }
};
