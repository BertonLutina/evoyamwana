import type { ApiSuccessResponse, DashboardSummaryDto } from '@evoyamwana/shared';
import { api } from './client';

export const dashboardApi = {
  async summary(date = new Date().toISOString().slice(0, 10)) {
    const response = await api.get<ApiSuccessResponse<{ summary: DashboardSummaryDto }>>('/dashboard', {
      params: { date }
    });
    return response.data.data.summary;
  }
};
