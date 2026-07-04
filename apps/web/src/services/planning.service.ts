import { API_ROUTES, type ApiSuccessResponse, type PlanningDto, type PlanningPayload, type PlanningTargetDto } from '@evoyamwana/shared';
import { apiClient } from './api';

export const planningService = {
  async list(params?: { from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const response = await apiClient<ApiSuccessResponse<{ plannings: PlanningDto[] }>>(`${API_ROUTES.planning}${suffix}`);
    return response.data.plannings;
  },

  async get(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ planning: PlanningDto }>>(`${API_ROUTES.planning}/${id}`);
    return response.data.planning;
  },

  async create(payload: PlanningPayload) {
    const response = await apiClient<ApiSuccessResponse<{ planning: PlanningDto }>>(API_ROUTES.planning, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data.planning;
  },

  async update(id: string, payload: Partial<PlanningPayload>) {
    const response = await apiClient<ApiSuccessResponse<{ planning: PlanningDto }>>(`${API_ROUTES.planning}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return response.data.planning;
  },

  async remove(id: string) {
    await apiClient<ApiSuccessResponse<{ id: string }>>(`${API_ROUTES.planning}/${id}`, { method: 'DELETE' });
  },

  async targets() {
    const response = await apiClient<ApiSuccessResponse<{ targets: PlanningTargetDto[] }>>(`${API_ROUTES.planning}/targets`);
    return response.data.targets;
  }
};
