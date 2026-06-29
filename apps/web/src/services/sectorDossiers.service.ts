import { API_ROUTES, type ApiSuccessResponse } from '@evoyamwana/shared';
import { apiClient } from './api';
import type { SchoolHealthSeverity, SchoolHealthStatus } from './schoolHealth.service';

export type SchoolSector = 'TEACHERS' | 'PARENTS' | 'STUDENTS' | 'SECRETARY' | 'ACCOUNTANT' | 'CLASS_TUTOR' | 'DISCIPLINE' | 'LIBRARY' | 'NURSE' | 'TRANSPORT' | 'CANTEEN' | 'COLLABORATORS';

export interface SectorDossierDto {
  id: string;
  schoolId: string;
  sector: SchoolSector;
  title: string;
  description: string;
  owner?: string | null;
  status: SchoolHealthStatus;
  priority: SchoolHealthSeverity;
  dueDate?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SectorDossierPayload {
  sector: SchoolSector;
  title: string;
  description: string;
  owner?: string;
  status?: SchoolHealthStatus;
  priority?: SchoolHealthSeverity;
  dueDate?: string;
}

export interface SectorDossierListParams {
  search?: string;
  sector?: SchoolSector;
  status?: SchoolHealthStatus;
  priority?: SchoolHealthSeverity;
  page?: number;
  pageSize?: number;
}

export interface SectorDossierSummaryDto {
  totals: { total: number; open: number; critical: number };
  bySector: Array<{ sector: SchoolSector; _count: { _all: number } }>;
  byStatus: Array<{ status: SchoolHealthStatus; _count: { _all: number } }>;
}

const buildQuery = (params: SectorDossierListParams = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const sectorDossiersService = {
  async list(params: SectorDossierListParams = {}) {
    const response = await apiClient<ApiSuccessResponse<{ dossiers: SectorDossierDto[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>>(`${API_ROUTES.sectorDossiers}${buildQuery(params)}`);
    return response.data;
  },

  async summary() {
    const response = await apiClient<ApiSuccessResponse<{ summary: SectorDossierSummaryDto }>>(`${API_ROUTES.sectorDossiers}/summary`);
    return response.data.summary;
  },

  async create(payload: SectorDossierPayload) {
    const response = await apiClient<ApiSuccessResponse<{ dossier: SectorDossierDto }>>(API_ROUTES.sectorDossiers, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data.dossier;
  },

  async update(id: string, payload: Partial<SectorDossierPayload>) {
    const response = await apiClient<ApiSuccessResponse<{ dossier: SectorDossierDto }>>(`${API_ROUTES.sectorDossiers}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return response.data.dossier;
  },

  async archive(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ dossier: SectorDossierDto }>>(`${API_ROUTES.sectorDossiers}/${id}`, {
      method: 'DELETE'
    });
    return response.data.dossier;
  }
};
