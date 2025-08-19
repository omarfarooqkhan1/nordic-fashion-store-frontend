import api from './axios';

export interface ProductReview {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  title?: string;
  review_text?: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email?: string;
  };
  media?: { url: string; type: string }[];
  status: 'pending' | 'approved' | 'rejected'; // Add status to ProductReview
}

export interface CreateReviewData {
  rating: number;
  title?: string;
  review_text?: string;
}

export interface UpdateReviewData extends Partial<CreateReviewData> {}

export interface ReviewResponse {
  success: boolean;
  data: ProductReview;
  message: string;
}

export interface ReviewsListResponse {
  success: boolean;
  data: {
    data: ProductReview[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  product: {
    id: number;
    name: string;
    average_rating: number;
    review_count: number;
  };
}

export interface CanReviewResponse {
  success: boolean;
  data: {
    can_review: boolean;
    has_purchased: boolean;
    has_delivered: boolean;
    has_pending: boolean;
    has_reviewed: boolean;
    purchase_details: any;
    pending_order_details: any;
    delivery_status: 'delivered' | 'pending' | 'none';
    existing_review: ProductReview | null;
    message?: string;
  };
}

// Get reviews for a product
export const getProductReviews = async (productId: number, page: number = 1): Promise<ReviewsListResponse> => {
  const response = await api.get(`/products/${productId}/reviews?page=${page}`);
  return response.data;
};

// Check if user can review a product
export const canUserReview = async (productId: number): Promise<CanReviewResponse> => {
  const response = await api.get(`/products/${productId}/can-review`);
  return response.data;
};

// Create a new review
export const createReview = async (productId: number, reviewData: CreateReviewData | FormData): Promise<ReviewResponse> => {
  const isForm = reviewData instanceof FormData;
  const response = await api.post(`/products/${productId}/reviews`, reviewData, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  return response.data;
};

// Update an existing review
export const updateReview = async (productId: number, reviewId: number, reviewData: UpdateReviewData | FormData): Promise<ReviewResponse> => {
  const isForm = reviewData instanceof FormData;
  const response = await api.post(`/products/${productId}/reviews/${reviewId}?_method=PUT`, reviewData, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  return response.data;
};

// Delete a review
export const deleteReview = async (productId: number, reviewId: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/products/${productId}/reviews/${reviewId}`);
  return response.data;
};

// Get pending reviews (admin)
export const getPendingReviews = async (): Promise<ProductReview[]> => {
  const response = await api.get('/admin/reviews/pending');
  return response.data.data;
};

// Approve review (admin)

// Accepts either a token string or a headers object for admin
export const approveReview = async (reviewId: number, tokenOrHeaders?: string | Record<string, string>): Promise<void> => {
  let config;
  if (typeof tokenOrHeaders === 'object') {
    config = { headers: tokenOrHeaders };
  } else if (typeof tokenOrHeaders === 'string') {
    config = tokenOrHeaders ? { headers: { Authorization: `Bearer ${tokenOrHeaders}` } } : undefined;
  } else {
    config = undefined;
  }
  await api.post(
    `/admin/reviews/${reviewId}/approve`,
    {},
    config
  );
};

// Reject review (admin)

// Accepts either a token string or a headers object for admin
export const rejectReview = async (reviewId: number, tokenOrHeaders?: string | Record<string, string>): Promise<void> => {
  let config;
  if (typeof tokenOrHeaders === 'object') {
    config = { headers: tokenOrHeaders };
  } else if (typeof tokenOrHeaders === 'string') {
    config = tokenOrHeaders ? { headers: { Authorization: `Bearer ${tokenOrHeaders}` } } : undefined;
  } else {
    config = undefined;
  }
  await api.post(
    `/admin/reviews/${reviewId}/reject`,
    {},
    config
  );
};
