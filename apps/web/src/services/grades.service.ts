import { API_ROUTES, type ApiSuccessResponse, type GradeDto, type StudentGradeMetricsDto, type StudentGradeSummaryDto } from '@evoyamwana/shared';
import { apiClient } from './api';

export interface GradeFormPayload {
  studentId: string;
  classId: string;
  subjectId: string;
  score: number;
  maxScore: number;
  coefficient?: number;
  term: string;
  comment?: string;
}

export interface GradeListParams {
  search?: string;
  classId?: string;
  subjectId?: string;
  studentId?: string;
  term?: string;
  page?: number;
  pageSize?: number;
}

export interface GradeListResponse {
  grades: GradeDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentGradeSummaryResponse {
  summaries: StudentGradeSummaryDto[];
  metrics: StudentGradeMetricsDto;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const buildQuery = (params: GradeListParams) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const gradesService = {
  async list(params: GradeListParams) {
    const response = await apiClient<ApiSuccessResponse<GradeListResponse>>(`${API_ROUTES.grades}${buildQuery(params)}`);
    return response.data;
  },

  async summaries(params: GradeListParams) {
    const response = await apiClient<ApiSuccessResponse<StudentGradeSummaryResponse>>(`${API_ROUTES.grades}/summaries/students${buildQuery(params)}`);
    const fallbackMetrics = {
      evaluatedStudents: response.data.pagination.total,
      gradeCount: response.data.summaries.reduce((total, summary) => total + summary.gradeCount, 0),
      subjectCount: response.data.summaries.reduce((total, summary) => total + summary.subjectCount, 0),
      classCount: new Set(response.data.summaries.map((summary) => summary.class?.id).filter(Boolean)).size,
      averagePercent: response.data.summaries.length ? Math.round(response.data.summaries.reduce((total, summary) => total + summary.weightedAveragePercent, 0) / response.data.summaries.length) : null
    };
    return {
      ...response.data,
      metrics: response.data.metrics ?? fallbackMetrics
    };
  },

  async create(payload: GradeFormPayload) {
    const response = await apiClient<ApiSuccessResponse<{ grade: GradeDto }>>(API_ROUTES.grades, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data.grade;
  },

  async update(id: string, payload: GradeFormPayload) {
    const response = await apiClient<ApiSuccessResponse<{ grade: GradeDto }>>(`${API_ROUTES.grades}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return response.data.grade;
  },

  async remove(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ id: string }>>(`${API_ROUTES.grades}/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  }
};
