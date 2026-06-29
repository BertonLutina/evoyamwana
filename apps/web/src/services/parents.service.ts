import { API_ROUTES, type ApiSuccessResponse, type ParentDto } from '@evoyamwana/shared';
import { apiClient } from './api';

export interface ParentFormPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  password?: string;
}

export interface ParentListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ParentListResponse {
  parents: ParentDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const buildQuery = (params: ParentListParams) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const parentsService = {
  async list(params: ParentListParams) {
    const response = await apiClient<ApiSuccessResponse<ParentListResponse>>(`${API_ROUTES.parents}${buildQuery(params)}`);
    return response.data;
  },

  async get(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ parent: ParentDto }>>(`${API_ROUTES.parents}/${id}`);
    return response.data.parent;
  },

  async create(payload: ParentFormPayload) {
    const response = await apiClient<ApiSuccessResponse<{ parent: ParentDto }>>(API_ROUTES.parents, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data.parent;
  }
};
