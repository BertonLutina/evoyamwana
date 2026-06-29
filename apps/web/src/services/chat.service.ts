import type { MessageDto, UserRole } from '@evoyamwana/shared';
import { apiClient } from './api';

export interface ChatContactDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  className?: string | null;
  relationLabel?: string | null;
}

export interface ChatConversationDto {
  id: string;
  contact?: ChatContactDto | null;
  participants?: ChatContactDto[];
  messages?: MessageDto[];
  lastMessage?: MessageDto | null;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
} & T;

const unwrap = <T>(response: ApiEnvelope<T>): T => (response.data ?? response) as T;

export const chatService = {
  async listContacts() {
    const response = await apiClient<ApiEnvelope<{ contacts: ChatContactDto[] }>>('/chat/contacts');
    return unwrap(response).contacts;
  },

  async listConversations() {
    const response = await apiClient<ApiEnvelope<{ conversations: ChatConversationDto[] }>>('/chat/conversations');
    return unwrap(response).conversations;
  },

  async createConversation(contactId: string) {
    const response = await apiClient<ApiEnvelope<{ conversation: ChatConversationDto }>>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ contactId, recipientId: contactId })
    });
    return unwrap(response).conversation;
  },

  async sendMessage(input: { conversationId: string; recipientId: string; body: string }) {
    const response = await apiClient<ApiEnvelope<{ message: MessageDto }>>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    return unwrap(response).message;
  }
};
