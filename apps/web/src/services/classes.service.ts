import { API_ROUTES, type ApiSuccessResponse, type ClassDto } from '@evoyamwana/shared';
import { apiClient } from './api';

export interface ClassFormPayload {
  name: string;
  level: string;
  section?: string;
  academicYear: string;
  teacherId?: string;
  room?: string;
  capacity?: number;
  cycle?: string;
  option?: string;
  shift?: string;
  description?: string;
}

export interface ClassListParams {
  search?: string;
  academicYear?: string;
  page?: number;
  pageSize?: number;
}

export interface ClassListResponse {
  classes: ClassDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const buildQuery = (params: ClassListParams) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const classesService = {
  async list(params: ClassListParams) {
    const response = await apiClient<ApiSuccessResponse<ClassListResponse>>(`${API_ROUTES.classes}${buildQuery(params)}`);
    return response.data;
  },

  async get(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ class: ClassDto }>>(`${API_ROUTES.classes}/${id}`);
    return response.data.class;
  },

  async create(payload: ClassFormPayload) {
    const response = await apiClient<ApiSuccessResponse<{ class: ClassDto }>>(API_ROUTES.classes, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data.class;
  }
};
