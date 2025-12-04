import api from './axios.js';
import { buildApiHeaders } from './api-headers';

export interface OrderData {
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  billing_same_as_shipping: boolean;
  billing_name?: string;
  billing_email?: string;
  billing_phone?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
  payment_method: 'credit_card' | 'paypal' | 'stripe';
  notes?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  payment_status: string;
  tracking_number?: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state?: string;
  shipping_postal_code: string;
  shipping_country: string;
  billing_same_as_shipping?: boolean;
  billing_name?: string;
  billing_email?: string;
  billing_phone?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
  payment_method?: string;
  notes?: string;
  shipping_service?: 'DHL' | 'FedEx' | 'UPS';
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_name: string;
  variant_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  product_snapshot: any;
  variant?: {
    id: number;
    color: string;
    size: string;
    images: Array<{
      id: number;
      url: string;
      alt_text?: string;
    }>;
    product: {
      id: number;
      name: string;
      images: Array<{
        id: number;
        url: string;
        alt_text?: string;
      }>;
    };
  };
}

// getHeaders removed; use buildApiHeaders from api-headers.ts

export const createOrder = async (
  orderData: OrderData,
  bearerToken?: string
): Promise<{ message: string; order: Order }> => {
  try {
    const sessionId = localStorage.getItem('nordic_fashion_cart_session_id');
    
    const headers = buildApiHeaders(sessionId, bearerToken);
    
    const response = await api.post(
      '/orders',
      orderData,
      {
        headers,
        timeout: 30000, // 30 second timeout
      }
    );
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
};

export const fetchOrders = async (
  bearerToken?: string
): Promise<Order[]> => {
  try {
    // Get session ID from localStorage with fallback to sessionStorage
    let sessionId = localStorage.getItem('nordic_fashion_cart_session_id') || 
                   sessionStorage.getItem('nordic_fashion_cart_session_id') ||
                   localStorage.getItem('cart_session_id') ||
                   sessionStorage.getItem('cart_session_id');
    
    const response = await api.get(
      '/orders',
      {
        headers: buildApiHeaders(sessionId || undefined, bearerToken),
      }
    );
    
    // Handle both paginated and non-paginated responses
    if (response.data && Array.isArray(response.data)) {
      // If the response is already an array, return it directly
      return response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // If the response has a data property that's an array, return that
      return response.data.data;
    }
    
    // If we get here, the response format is unexpected
    return [];
    
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

export const fetchOrder = async (
  orderId: number | string,
  bearerToken?: string
): Promise<Order> => {
  try {
    const sessionId = localStorage.getItem('nordic_fashion_cart_session_id');
    
    const response = await api.get(
      `/orders/${orderId}`,
      {
        headers: buildApiHeaders(sessionId, bearerToken),
      }
    );
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order');
  }
};

// Admin-specific functions
export const fetchAllOrders = async (
  bearerToken: string
): Promise<Order[]> => {
  try {
    const response = await api.get(
      '/admin/orders',
      {
        headers: buildApiHeaders(undefined, bearerToken),
      }
    );
    
    // The API returns { data: Order[], pagination: {...} }
    // We need to extract the data array
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

export interface OrderUpdateData {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  shipping_service?: 'DHL' | 'FedEx' | 'UPS';
  notes?: string;
}

export const updateOrderStatus = async (
  orderId: number | string,
  updateData: OrderUpdateData,
  bearerToken: string
): Promise<Order> => {
  try {
    const response = await api.put(
      `/admin/orders/${orderId}`,
      updateData,
      {
        headers: buildApiHeaders(undefined, bearerToken),
      }
    );
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update order');
  }
};
