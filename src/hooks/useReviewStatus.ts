import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { canUserReview, type CanReviewResponse } from '@/api/reviews';

interface UseReviewStatusReturn {
  reviewStatus: CanReviewResponse['data'] | null;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  canReview: boolean;
  hasPurchased: boolean;
  hasDelivered: boolean;
  hasPending: boolean;
  hasReviewed: boolean;
  purchaseDetails: any;
  pendingOrderDetails: any;
  deliveryStatus: 'delivered' | 'pending' | 'none';
  existingReview: any;
}

export const useReviewStatus = (productId: number): UseReviewStatusReturn => {
  const { user, isAuthenticated } = useAuth();
  const [reviewStatus, setReviewStatus] = useState<CanReviewResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviewStatus = useCallback(async () => {
    
    if (!isAuthenticated || !user) {
      setReviewStatus(null);
      setIsLoading(false);
      return;
    }

    if (!productId || productId <= 0) {
      setReviewStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await canUserReview(productId);
      setReviewStatus(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check review status');
      setReviewStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [productId, isAuthenticated, user]);

  // Initial fetch
  useEffect(() => {
    fetchReviewStatus();
  }, [fetchReviewStatus]);

  // Auto-refresh when user changes or product changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReviewStatus();
    }
  }, [user?.id, productId, isAuthenticated]);

  // Set up periodic refresh (every 5 minutes) to catch order status changes
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      fetchReviewStatus();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, user, fetchReviewStatus]);

  return {
    reviewStatus,
    isLoading,
    error,
    refreshStatus: fetchReviewStatus,
    canReview: reviewStatus?.can_review ?? false,
    hasPurchased: reviewStatus?.has_purchased ?? false,
    hasDelivered: reviewStatus?.has_delivered ?? false,
    hasPending: reviewStatus?.has_pending ?? false,
    hasReviewed: reviewStatus?.has_reviewed ?? false,
    purchaseDetails: reviewStatus?.purchase_details ?? null,
    pendingOrderDetails: reviewStatus?.pending_order_details ?? null,
    deliveryStatus: reviewStatus?.delivery_status ?? 'none',
    existingReview: reviewStatus?.existing_review ?? null,
  };
};
