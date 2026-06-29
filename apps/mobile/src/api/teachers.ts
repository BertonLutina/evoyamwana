import type { ApiSuccessResponse, TeacherDto } from '@evoyamwana/shared';
import { api } from './client';

export interface TeacherListResponse {
  teachers: TeacherDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const teachersApi = {
  async list(search = '') {
    const response = await api.get<ApiSuccessResponse<TeacherListResponse>>('/teachers', {
      params: { search, pageSize: 20 }
    });
    return response.data.data;
  }
};
