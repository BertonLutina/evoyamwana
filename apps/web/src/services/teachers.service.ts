import { API_ROUTES, type ApiSuccessResponse, type TeacherDto, type TeacherProfileInput } from '@evoyamwana/shared';
import { apiClient } from './api';

export interface TeacherFormPayload extends TeacherProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber: string;
}

export interface TeacherListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface TeacherListResponse {
  teachers: TeacherDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const buildQuery = (params: TeacherListParams) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const teachersService = {
  async list(params: TeacherListParams) {
    const response = await apiClient<ApiSuccessResponse<TeacherListResponse>>(`${API_ROUTES.teachers}${buildQuery(params)}`);
    return response.data;
  },

  async get(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ teacher: TeacherDto }>>(`${API_ROUTES.teachers}/${id}`);
    return response.data.teacher;
  },

  async getMe() {
    const response = await apiClient<ApiSuccessResponse<{ teacher: TeacherDto }>>(`${API_ROUTES.teachers}/me`);
    return response.data.teacher;
  },

  async create(payload: TeacherFormPayload) {
    const response = await apiClient<ApiSuccessResponse<{ teacher: TeacherDto }>>(API_ROUTES.teachers, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data.teacher;
  },

  async updateMe(payload: TeacherProfileInput) {
    const response = await apiClient<ApiSuccessResponse<{ teacher: TeacherDto }>>(`${API_ROUTES.teachers}/me`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return response.data.teacher;
  },

  async update(id: string, payload: TeacherProfileInput) {
    const response = await apiClient<ApiSuccessResponse<{ teacher: TeacherDto }>>(`${API_ROUTES.teachers}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return response.data.teacher;
  },

  async remove(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ teacher: TeacherDto }>>(`${API_ROUTES.teachers}/${id}`, {
      method: 'DELETE'
    });
    return response.data.teacher;
  }
};
