import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  order_id?: number;
  customer_email: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
}

export interface ConfirmPaymentRequest {
  payment_intent_id: string;
  payment_method_id: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  payment_intent: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
}

// Create a payment intent
export const createPaymentIntent = async (
  data: CreatePaymentIntentRequest,
  token: string
): Promise<CreatePaymentIntentResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/stripe/create-payment-intent`,
    data,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

// Confirm a payment
export const confirmPayment = async (
  data: ConfirmPaymentRequest,
  token: string
): Promise<ConfirmPaymentResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/stripe/confirm-payment`,
    data,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

// Get payment intent status
export const getPaymentIntentStatus = async (
  paymentIntentId: string,
  token: string
): Promise<{ status: string }> => {
  const response = await axios.get(
    `${API_BASE_URL}/stripe/payment-intent/${paymentIntentId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

