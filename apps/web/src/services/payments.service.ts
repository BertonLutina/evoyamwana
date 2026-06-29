import { API_ROUTES, type ApiSuccessResponse, type PaymentDto, type PaymentMethod, type PaymentStatus } from '@evoyamwana/shared';
import { apiClient } from './api';

export interface PaymentFormPayload {
  studentId: string;
  parentId?: string;
  amount: number;
  amountPaid?: number;
  dueDate: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  receiptNumber?: string;
  description?: string;
  paidAt?: string;
}

export interface PaymentListParams {
  search?: string;
  status?: PaymentStatus;
  studentId?: string;
  parentId?: string;
  page?: number;
  pageSize?: number;
}

export interface PaymentListResponse {
  payments: PaymentDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const buildQuery = (params: PaymentListParams = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const paymentsService = {
  async list(params: PaymentListParams = {}) {
    const response = await apiClient<ApiSuccessResponse<PaymentListResponse>>(`${API_ROUTES.payments}${buildQuery(params)}`);
    return response.data;
  },

  async get(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ payment: PaymentDto }>>(`${API_ROUTES.payments}/${id}`);
    return response.data.payment;
  },

  async create(payload: PaymentFormPayload) {
    const response = await apiClient<ApiSuccessResponse<{ payment: PaymentDto }>>(API_ROUTES.payments, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data.payment;
  },

  async update(id: string, payload: Partial<PaymentFormPayload>) {
    const response = await apiClient<ApiSuccessResponse<{ payment: PaymentDto }>>(`${API_ROUTES.payments}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return response.data.payment;
  },

  async cancel(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ payment: PaymentDto }>>(`${API_ROUTES.payments}/${id}`, {
      method: 'DELETE'
    });
    return response.data.payment;
  }
};
