import type { ApiSuccessResponse, PaymentDto } from '@evoyamwana/shared';
import { api } from './client';

export const paymentsApi = {
  async list() {
    const response = await api.get<ApiSuccessResponse<{ payments: PaymentDto[]; pagination: { total: number } }>>('/payments', {
      params: { page: 1, pageSize: 50 }
    });
    return response.data.data;
  },

  async pending() {
    const data = await this.list();
    const payments = data.payments.filter((payment) => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(payment.status));
    return { total: payments.length, payments };
  }
};
