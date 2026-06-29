import { API_ROUTES, type ApiSuccessResponse, type UserRole } from '@evoyamwana/shared';
import { apiClient } from './api';

export interface PlatformSchoolDto {
  id: string;
  name: string;
  country: string;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
  _count: {
    users: number;
    students: number;
    teachers: number;
    parents: number;
    classes: number;
  };
}

export interface PlatformUserDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  school?: {
    id: string;
    name: string;
    city?: string | null;
  } | null;
}

export interface PlatformReportDto {
  totals: Record<'schools' | 'users' | 'students' | 'teachers' | 'parents' | 'classes' | 'attendance' | 'grades' | 'messages', number>;
  roleBreakdown: Array<{ role: UserRole; _count: { role: number } }>;
}

export interface SchoolRegistrationRequestDto {
  id: string;
  schoolName: string;
  legalName?: string | null;
  country: string;
  city: string;
  address?: string | null;
  schoolType?: string | null;
  schoolStatus?: string | null;
  accreditationNumber?: string | null;
  schoolEmail: string;
  schoolPhone?: string | null;
  ownerFullName: string;
  ownerEmail: string;
  documentUrl?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  createdAt: string;
}

export interface PlatformListParams {
  search?: string;
  role?: UserRole;
  status?: string;
  page?: number;
  pageSize?: number;
}

const buildQuery = (params: PlatformListParams = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const platformService = {
  async schoolRegistrations(params: PlatformListParams = {}) {
    const response = await apiClient<ApiSuccessResponse<{ requests: SchoolRegistrationRequestDto[] }>>(`${API_ROUTES.platform}/school-registrations${buildQuery(params)}`);
    return response.data.requests;
  },

  async approveSchoolRegistration(id: string) {
    const response = await apiClient<ApiSuccessResponse<{ request: SchoolRegistrationRequestDto }>>(`${API_ROUTES.platform}/school-registrations/${id}/approve`, {
      method: 'POST'
    });
    return response.data;
  },

  async rejectSchoolRegistration(id: string, reason?: string) {
    const response = await apiClient<ApiSuccessResponse<{ request: SchoolRegistrationRequestDto }>>(`${API_ROUTES.platform}/school-registrations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    return response.data.request;
  },

  async schools(params: PlatformListParams = {}) {
    const response = await apiClient<ApiSuccessResponse<{ schools: PlatformSchoolDto[] }>>(`${API_ROUTES.platform}/schools${buildQuery(params)}`);
    return response.data.schools;
  },

  async admins(params: PlatformListParams = {}) {
    const response = await apiClient<ApiSuccessResponse<{ users: PlatformUserDto[] }>>(`${API_ROUTES.platform}/admins${buildQuery(params)}`);
    return response.data.users;
  },

  async users(params: PlatformListParams = {}) {
    const response = await apiClient<ApiSuccessResponse<{ users: PlatformUserDto[] }>>(`${API_ROUTES.platform}/users${buildQuery(params)}`);
    return response.data.users;
  },

  async reports() {
    const response = await apiClient<ApiSuccessResponse<PlatformReportDto>>(`${API_ROUTES.platform}/reports`);
    return response.data;
  }
};
