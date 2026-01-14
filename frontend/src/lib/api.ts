import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: { email: string; password: string; username: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Conversation endpoints
  async getConversations() {
    const response = await this.client.get('/conversations');
    return response.data;
  }

  async getConversation(id: string) {
    const response = await this.client.get(`/conversations/${id}`);
    return response.data;
  }

  async createConversation(data: {
    type: 'private' | 'group';
    participantIds: string[];
    name?: string;
  }) {
    const response = await this.client.post('/conversations', data);
    return response.data;
  }

  async deleteConversation(id: string) {
    const response = await this.client.delete(`/conversations/${id}`);
    return response.data;
  }

  // Message endpoints
  async getMessages(conversationId: string, page: number = 1, limit: number = 50) {
    const response = await this.client.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  }

  async sendMessage(data: {
    conversationId: string;
    content: string;
    type?: string;
    fileUrl?: string;
  }) {
    const response = await this.client.post('/messages', data);
    return response.data;
  }

  async editMessage(messageId: string, content: string) {
    const response = await this.client.put(`/messages/${messageId}`, { content });
    return response.data;
  }

  async deleteMessage(messageId: string) {
    const response = await this.client.delete(`/messages/${messageId}`);
    return response.data;
  }

  async searchMessages(conversationId: string, query: string) {
    const response = await this.client.get(`/conversations/${conversationId}/search`, {
      params: { query },
    });
    return response.data;
  }

  // Report endpoints
  async reportMessage(messageId: string, data: { reason: string; comment?: string }) {
    const response = await this.client.post('/reports', { messageId, ...data });
    return response.data;
  }

  async getReports() {
    const response = await this.client.get('/admin/reports');
    return response.data;
  }

  async reviewReport(reportId: string, data: { status: string; reviewComment?: string }) {
    const response = await this.client.put(`/admin/reports/${reportId}`, data);
    return response.data;
  }

  // User endpoints
  async suspendUser(userId: string, data: { endDate?: Date; reason: string }) {
    const response = await this.client.post(`/admin/users/${userId}/suspend`, data);
    return response.data;
  }
}

export const api = new ApiClient();