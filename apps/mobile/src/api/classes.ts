import type { ApiSuccessResponse, ClassDto } from '@evoyamwana/shared';
import { api } from './client';

export interface ClassListResponse {
  classes: ClassDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const classesApi = {
  async list(search = '') {
    const response = await api.get<ApiSuccessResponse<ClassListResponse>>('/classes', {
      params: { search, pageSize: 20 }
    });
    return response.data.data;
  }
};
