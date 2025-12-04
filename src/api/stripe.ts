import api from './axios';

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
  token?: string
): Promise<CreatePaymentIntentResponse> => {
  const response = await api.post('/stripe/create-payment-intent', data);
  return response.data;
};

// Confirm a payment
export const confirmPayment = async (
  data: ConfirmPaymentRequest,
  token?: string
): Promise<ConfirmPaymentResponse> => {
  const response = await api.post('/stripe/confirm-payment', data);
  return response.data;
};

// Get payment intent status
export const getPaymentIntentStatus = async (
  paymentIntentId: string,
  token?: string
): Promise<{ status: string }> => {
  const response = await api.get(`/stripe/payment-intent/${paymentIntentId}`);
  return response.data;
};

