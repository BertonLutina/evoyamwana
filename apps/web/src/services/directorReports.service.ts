import { API_ROUTES, type ApiSuccessResponse } from '@evoyamwana/shared';
import { apiClient } from './api';
import type { SchoolHealthSeverity, SchoolHealthStatus } from './schoolHealth.service';

export type DirectorReportType = 'ACADEMIC' | 'ATTENDANCE' | 'FINANCE' | 'DISCIPLINE' | 'HEALTH' | 'INFRASTRUCTURE' | 'REPUTATION' | 'PARTNERSHIP' | 'COMPLIANCE' | 'MEETING';

export interface DirectorReportDto {
  id: string;
  schoolId: string;
  type: DirectorReportType;
  title: string;
  summary: string;
  period: string;
  owner?: string | null;
  status: SchoolHealthStatus;
  priority: SchoolHealthSeverity;
  dueDate?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DirectorReportPayload {
  type: DirectorReportType;
  title: string;
  summary: string;
  period: string;
  owner?: string;
  status?: SchoolHealthStatus;
  priority?: SchoolHealthSeverity;
  dueDate?: string;
}

export interface DirectorReportListParams {
  search?: string;
  type?: DirectorReportType;
  status?: SchoolHealthStatus;
  priority?: SchoolHealthSeverity;
  page?: number;
  pageSize?: number;
}

export interface DirectorReportSummaryDto {
  totals: { total: number; open: number; published: number; critical: number };
  byType: Array<{ type: DirectorReportType; _count: { _all: number } }>;
  byStatus: Array<{ status: SchoolHealthStatus; _count: { _all: number } }>;
}

const buildQuery = (params: DirectorReportListParams = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const directorReportsService = {
  async list(params: DirectorReportListParams = {}) {
    const response = await apiClient<ApiSuccessResponse<{ reports: DirectorReportDto[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>>(`${API_ROUTES.directorReports}${buildQuery(params)}`);
    return response.data;
  },

  async summary() {
    const response = await apiClient<ApiSuccessResponse<{ summary: DirectorReportSummaryDto }>>(`${API_ROUTES.directorReports}/summary`);
    return response.data.summary;
  },

  async create(payload: DirectorReportPayload) {
    const response = await apiClient<ApiSuccessResponse<{ report: DirectorReportDto }>>(API_ROUTES.directorReports, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data.report;
  },

  async update(id: string, payload: Partial<DirectorReportPayload>) {
    const response = await apiClient<ApiSuccessResponse<{ report: DirectorReportDto }>>(`${API_ROUTES.directorReports}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return response.data.report;
  },

  async archive(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ report: DirectorReportDto }>>(`${API_ROUTES.directorReports}/${id}`, {
      method: 'DELETE'
    });
    return response.data.report;
  }
};
