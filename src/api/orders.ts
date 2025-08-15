import api from './axios.js';

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
}

const getHeaders = (sessionId?: string, bearerToken?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }

  return headers;
};

export const createOrder = async (
  orderData: OrderData,
  bearerToken?: string
): Promise<{ message: string; order: Order }> => {
  try {
    const sessionId = localStorage.getItem('nordic_fashion_cart_session_id');
    
    console.log('🔧 createOrder function called with:', {
      orderData,
      bearerToken: bearerToken ? 'Present' : 'Not provided',
      sessionId: sessionId ? 'Present' : 'Not found'
    });
    
    const headers = getHeaders(sessionId, bearerToken);
    console.log('📋 Request headers:', headers);
    
    console.log('📡 Making API request to /orders/test');
    const response = await api.post(
      '/orders',
      orderData,
      {
        headers,
        timeout: 30000, // 30 second timeout
      }
    );
    
    console.log('📥 API response received:', {
      status: response.status,
      data: response.data
    });
    
    return response.data;
  } catch (error: any) {
    console.error('🚨 Error in createOrder:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
};

export const fetchOrders = async (
  bearerToken?: string
): Promise<Order[]> => {
  try {
    const sessionId = localStorage.getItem('nordic_fashion_cart_session_id');
    
    const response = await api.get(
      '/orders',
      {
        headers: getHeaders(sessionId, bearerToken),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching orders:', error);
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
        headers: getHeaders(sessionId, bearerToken),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order:', error);
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
        headers: getHeaders(undefined, bearerToken),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all orders:', error);
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
        headers: getHeaders(undefined, bearerToken),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error updating order:', error);
    throw new Error(error.response?.data?.message || 'Failed to update order');
  }
};
