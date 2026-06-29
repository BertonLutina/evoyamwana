import type { ApiSuccessResponse, StudentDto } from '@evoyamwana/shared';
import { api } from './client';

export interface StudentListResponse {
  students: StudentDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const studentsApi = {
  async list(search = '') {
    const response = await api.get<ApiSuccessResponse<StudentListResponse>>('/students', {
      params: { search, status: 'active', pageSize: 20 }
    });
    return response.data.data;
  }
};
