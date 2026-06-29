import type { ApiSuccessResponse, ParentDto } from '@evoyamwana/shared';
import { api } from './client';

export interface ParentListResponse {
  parents: ParentDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const parentsApi = {
  async list(search = '') {
    const response = await api.get<ApiSuccessResponse<ParentListResponse>>('/parents', {
      params: { search, pageSize: 20 }
    });
    return response.data.data;
  }
};
