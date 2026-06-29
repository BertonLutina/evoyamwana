import { API_ROUTES, type ApiSuccessResponse, type DashboardSummaryDto } from '@evoyamwana/shared';
import { apiClient } from './api';

export const dashboardService = {
  async getSummary(date = new Date().toISOString().slice(0, 10)) {
    const response = await apiClient<ApiSuccessResponse<{ summary: DashboardSummaryDto }>>(`${API_ROUTES.dashboard}?date=${date}`);
    return {
      ...response.data.summary,
      collaboratorDossiers: response.data.summary.collaboratorDossiers ?? []
    };
  }
};
