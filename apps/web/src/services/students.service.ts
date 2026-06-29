import { API_ROUTES, type ApiSuccessResponse, type StudentDto } from '@evoyamwana/shared';
import { apiClient } from './api';

export interface StudentFormPayload {
  category?: 'creche' | 'maternelle' | 'primaire' | 'secondaire' | 'secondaire_general' | 'secondaire_technique' | 'formation' | 'haute_ecole' | 'universite' | 'mixte';
  firstName: string;
  lastName: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  photoUrl?: string;
  studentCode?: string;
  classId?: string;
  schoolYearId?: string;
  status?: 'active' | 'inactive' | 'transferred' | 'graduated';
  parentIds: string[];
  guardians?: Array<{
    guardianId?: string;
    parent?: {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    relationshipType?: 'father' | 'mother' | 'guardian' | 'tutor' | 'other';
    isPrimaryContact?: boolean;
    canPickUpChild?: boolean;
    emergencyContact?: boolean;
  }>;
  medicalInfo?: Record<string, unknown>;
  maternelleInfo?: Record<string, unknown>;
  primaryInfo?: Record<string, unknown>;
  secondaryInfo?: Record<string, unknown>;
  universityInfo?: Record<string, unknown>;
}

export interface StudentListParams {
  search?: string;
  gender?: string;
  category?: 'creche' | 'maternelle' | 'primaire' | 'secondaire' | 'secondaire_general' | 'secondaire_technique' | 'formation' | 'haute_ecole' | 'universite' | 'mixte';
  status?: 'active' | 'inactive' | 'transferred' | 'graduated' | 'all';
  page?: number;
  pageSize?: number;
}

export interface StudentListResponse {
  students: StudentDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const buildQuery = (params: StudentListParams) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const studentsService = {
  async list(params: StudentListParams) {
    const response = await apiClient<ApiSuccessResponse<StudentListResponse>>(`${API_ROUTES.students}${buildQuery(params)}`);
    return response.data;
  },

  async get(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ student: StudentDto }>>(`${API_ROUTES.students}/${id}`);
    return response.data.student;
  },

  async getMe() {
    const response = await apiClient<ApiSuccessResponse<{ student: StudentDto }>>(`${API_ROUTES.students}/me`);
    return response.data.student;
  },

  async create(payload: StudentFormPayload) {
    const response = await apiClient<ApiSuccessResponse<{ student: StudentDto }>>(API_ROUTES.students, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data.student;
  },

  async update(id: string, payload: StudentFormPayload) {
    const response = await apiClient<ApiSuccessResponse<{ student: StudentDto }>>(`${API_ROUTES.students}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return response.data.student;
  },

  async deactivate(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ message: string }>>(`${API_ROUTES.students}/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  }
};
