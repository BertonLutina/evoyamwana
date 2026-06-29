import { API_ROUTES, type ApiSuccessResponse } from '@evoyamwana/shared';
import { apiClient } from './api';

export type SchoolHealthCategory = 'ATTENDANCE' | 'PEDAGOGY' | 'FINANCE' | 'INFRASTRUCTURE' | 'SAFETY' | 'HEALTH' | 'REPUTATION' | 'COMPLIANCE';
export type SchoolHealthStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
export type SchoolHealthSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SchoolHealthRecordDto {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  category: SchoolHealthCategory;
  status: SchoolHealthStatus;
  severity: SchoolHealthSeverity;
  owner?: string | null;
  dueDate?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolHealthPayload {
  title: string;
  description: string;
  category: SchoolHealthCategory;
  status?: SchoolHealthStatus;
  severity?: SchoolHealthSeverity;
  owner?: string;
  dueDate?: string;
}

export interface SchoolHealthListParams {
  search?: string;
  category?: SchoolHealthCategory;
  status?: SchoolHealthStatus;
  severity?: SchoolHealthSeverity;
  page?: number;
  pageSize?: number;
}

export interface SchoolHealthSummaryDto {
  score: number | null;
  totals: {
    records: number;
    open: number;
    critical: number;
    resolved: number;
  };
  byCategory: Array<{ category: SchoolHealthCategory; _count: { _all: number } }>;
  byStatus: Array<{ status: SchoolHealthStatus; _count: { _all: number } }>;
  bySeverity: Array<{ severity: SchoolHealthSeverity; _count: { _all: number } }>;
}

export interface SchoolHealthProgressionDto {
  schoolYear: string;
  labels: string[];
  values: Array<number | null>;
  points: Array<{ label: string; score: number | null; monthEnd: string }>;
}

const buildQuery = (params: SchoolHealthListParams = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const schoolHealthService = {
  async list(params: SchoolHealthListParams = {}) {
    const response = await apiClient<ApiSuccessResponse<{ records: SchoolHealthRecordDto[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>>(`${API_ROUTES.schoolHealth}${buildQuery(params)}`);
    return response.data;
  },

  async summary() {
    const response = await apiClient<ApiSuccessResponse<{ summary: SchoolHealthSummaryDto }>>(`${API_ROUTES.schoolHealth}/summary`);
    return response.data.summary;
  },

  async progression() {
    const response = await apiClient<ApiSuccessResponse<{ progression: SchoolHealthProgressionDto }>>(`${API_ROUTES.schoolHealth}/progression`);
    return response.data.progression;
  },

  async create(payload: SchoolHealthPayload) {
    const response = await apiClient<ApiSuccessResponse<{ record: SchoolHealthRecordDto }>>(API_ROUTES.schoolHealth, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data.record;
  },

  async update(id: string, payload: Partial<SchoolHealthPayload>) {
    const response = await apiClient<ApiSuccessResponse<{ record: SchoolHealthRecordDto }>>(`${API_ROUTES.schoolHealth}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return response.data.record;
  },

  async archive(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ record: SchoolHealthRecordDto }>>(`${API_ROUTES.schoolHealth}/${id}`, {
      method: 'DELETE'
    });
    return response.data.record;
  }
};
