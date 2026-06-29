import { API_ROUTES, type ApiSuccessResponse, type UserRole } from '@evoyamwana/shared';
import { apiClient } from './api';

export type StaffUserRole = Extract<
  UserRole,
  | 'SCHOOL_ADMIN'
  | 'DIRECTOR'
  | 'SECRETARY'
  | 'ACCOUNTANT'
  | 'CLASS_TUTOR'
  | 'DISCIPLINE_OFFICER'
  | 'LIBRARIAN'
  | 'NURSE'
  | 'TRANSPORT_MANAGER'
  | 'CANTEEN_MANAGER'
>;

export interface StaffUserDto {
  id: string;
  fullName: string;
  email: string;
  role: StaffUserRole;
  createdAt: string;
  school?: {
    id: string;
    name: string;
    city?: string | null;
  } | null;
}

export interface CreateStaffUserInput {
  fullName: string;
  email: string;
  password?: string;
  role: StaffUserRole;
  schoolId?: string;
}

export const staffUsersService = {
  async list() {
    const response = await apiClient<ApiSuccessResponse<{ users: StaffUserDto[] }>>(API_ROUTES.staffUsers);
    return response.data.users;
  },

  async create(input: CreateStaffUserInput) {
    const response = await apiClient<ApiSuccessResponse<{ user: StaffUserDto }>>(API_ROUTES.staffUsers, {
      method: 'POST',
      body: JSON.stringify(input)
    });
    return response.data.user;
  }
};
