import { apiClient } from './api';

const getAuthToken = () => localStorage.getItem('authToken') ?? undefined;

export type SupportMessage = {
  id: string;
  subject: string;
  message: string;
  status?: string;
  createdAt?: string;
};

type SupportResponse = {
  _id?: string;
  id?: string;
  subject?: string;
  message?: string;
  status?: string;
  createdAt?: string;
};

export const supportService = {
  createMessage: async (data: { subject: string; message: string }): Promise<SupportMessage> => {
    const token = getAuthToken();
    const response = await apiClient.post<SupportResponse>('/api/support', data, token);

    return {
      id: response.id ?? response._id ?? '',
      subject: response.subject ?? data.subject,
      message: response.message ?? data.message,
      status: response.status ?? 'open',
      createdAt: response.createdAt,
    };
  },
};
