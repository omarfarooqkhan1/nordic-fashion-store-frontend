import api from './axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  timestamp: string;
  cached?: boolean;
  fallback?: boolean;
}

export const chatbotApi = {
  // Send a message to the chatbot
  sendMessage: async (prompt: string): Promise<ChatResponse> => {
    try {
      const response = await api.post<ChatResponse>('/chatbot', { prompt });
      return response.data;
    } catch (error: any) {
      // Check if it's a network error or CORS issue
      if (!error.response) {
        return {
          success: false,
          error: 'Network error - please check your connection and try again',
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to send message',
        timestamp: new Date().toISOString()
      };
    }
  }
};