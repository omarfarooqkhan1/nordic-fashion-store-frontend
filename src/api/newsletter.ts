import api from './axios';

export interface NewsletterSubscription {
  id: number;
  email: string;
  name?: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at?: string;
  subscription_source: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterStats {
  total_subscribers: number;
  active_subscribers: number;
  inactive_subscribers: number;
  recent_subscribers: number;
  subscription_sources: Record<string, number>;
}

export interface NewsletterSubscribeRequest {
  email: string;
  name?: string;
  source?: string;
}

export interface NewsletterStatusResponse {
  subscribed: boolean;
  subscription?: NewsletterSubscription;
}

export interface NewsletterListResponse {
  subscribers: NewsletterSubscription[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

// Public newsletter API functions
export const newsletterApi = {
  // Subscribe to newsletter
  subscribe: async (data: NewsletterSubscribeRequest) => {
    const response = await api.post('/newsletter/subscribe', data);
    return response.data;
  },

  // Unsubscribe from newsletter
  unsubscribe: async (email: string) => {
    const response = await api.post('/newsletter/unsubscribe', { email });
    return response.data;
  },

  // Check subscription status
  checkStatus: async (email: string): Promise<NewsletterStatusResponse> => {
    const response = await api.get('/newsletter/status', { params: { email } });
    return response.data;
  },

  // Update user newsletter preference (authenticated users only)
  updateUserPreference: async (newsletter_subscription: boolean) => {
    const response = await api.put('/newsletter/preference', { newsletter_subscription });
    return response.data;
  },
};

// Admin newsletter API functions
export const adminNewsletterApi = {
  // Get all subscribers with pagination and filtering
  getSubscribers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | '';
    source?: string;
  }): Promise<NewsletterListResponse> => {
    const response = await api.get('/admin/newsletter', { params });
    return response.data;
  },

  // Get newsletter statistics
  getStats: async (): Promise<NewsletterStats> => {
    const response = await api.get('/admin/newsletter/stats');
    return response.data;
  },

  // Manually add a subscriber
  addSubscriber: async (data: { email: string; name?: string }) => {
    const response = await api.post('/admin/newsletter', data);
    return response.data;
  },

  // Update subscriber
  updateSubscriber: async (id: number, data: { is_active: boolean; name?: string }) => {
    const response = await api.put(`/admin/newsletter/${id}`, data);
    return response.data;
  },

  // Delete subscriber
  deleteSubscriber: async (id: number) => {
    const response = await api.delete(`/admin/newsletter/${id}`);
    return response.data;
  },

  // Export subscribers to CSV
  exportSubscribers: async (params?: {
    search?: string;
    status?: 'active' | 'inactive' | '';
    source?: string;
  }) => {
    const response = await api.get('/admin/newsletter/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Send newsletter broadcast
  sendBroadcast: async (data: {
    subject: string;
    content: string;
    send_to?: 'all' | 'active' | 'test';
  }) => {
    const response = await api.post('/admin/newsletter/broadcast', data);
    return response.data;
  },
};