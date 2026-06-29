import { API_ROUTES, type ApiSuccessResponse, type MessageDto, type UserRole } from '@evoyamwana/shared';
import { apiClient } from './api';

export interface MessageContactDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export const messagesService = {
  async listMine() {
    const response = await apiClient<ApiSuccessResponse<{ messages: MessageDto[] }>>(API_ROUTES.messages);
    return response.data.messages;
  },

  async listContacts() {
    const response = await apiClient<ApiSuccessResponse<{ contacts: MessageContactDto[] }>>(`${API_ROUTES.messages}/contacts`);
    return response.data.contacts;
  },

  async getConversation(userId: string) {
    const response = await apiClient<ApiSuccessResponse<{ messages: MessageDto[] }>>(`${API_ROUTES.messages}/conversation/${userId}`);
    return response.data.messages;
  },

  async send(recipientId: string, body: string, subject?: string) {
    const response = await apiClient<ApiSuccessResponse<{ message: MessageDto }>>(API_ROUTES.messages, {
      method: 'POST',
      body: JSON.stringify({ recipientId, body, subject })
    });
    return response.data.message;
  }
};
