import { API_ROUTES, type ApiSuccessResponse, type AuthResponse, type AuthUser } from '@evoyamwana/shared';
import type { LoginFormValues, RegisterSchoolFormValues } from '../types/forms';
import { apiClient } from './api';

const optionalValue = (value: string) => value.trim() || undefined;

export const authService = {
  login(values: LoginFormValues) {
    return apiClient<ApiSuccessResponse<AuthResponse>>(API_ROUTES.auth.login, {
      method: 'POST',
      body: JSON.stringify(values)
    }).then((response) => response.data);
  },

  me() {
    return apiClient<ApiSuccessResponse<{ user: AuthUser }>>(API_ROUTES.auth.me).then((response) => response.data.user);
  },

  registerSchool(values: RegisterSchoolFormValues) {
    return apiClient<ApiSuccessResponse<{ request: { id: string; status: string; schoolName: string; ownerEmail: string; createdAt: string }; message: string }>>(API_ROUTES.auth.registerSchool, {
      method: 'POST',
      body: JSON.stringify({
        ...values,
        legalName: optionalValue(values.legalName),
        address: optionalValue(values.address),
        schoolType: optionalValue(values.schoolType),
        schoolStatus: optionalValue(values.schoolStatus),
        accreditationNumber: optionalValue(values.accreditationNumber),
        schoolPhone: optionalValue(values.schoolPhone),
        documentUrl: optionalValue(values.documentUrl)
      })
    }).then((response) => response.data);
  }
};
