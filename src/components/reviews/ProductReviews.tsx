import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Star, CheckCircle, ShoppingBag, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useReviewStatus } from '@/hooks/useReviewStatus';
import { type ProductReview } from '@/api/reviews';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

interface ProductReviewsProps {
  productId: number;
  productName: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName
}) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  
  // Only call the hook if authenticated
  const reviewStatusData = isAuthenticated ? useReviewStatus(productId) : null;
  const reviewStatus = reviewStatusData?.reviewStatus;
  const isLoadingStatus = reviewStatusData?.isLoading;
  const statusError = reviewStatusData?.error;
  const refreshStatus = reviewStatusData?.refreshStatus;
  const canReview = reviewStatusData?.canReview;
  const hasPurchased = reviewStatusData?.hasPurchased;
  const hasDelivered = reviewStatusData?.hasDelivered;
  const hasPending = reviewStatusData?.hasPending;
  const hasReviewed = reviewStatusData?.hasReviewed;
  const purchaseDetails = reviewStatusData?.purchaseDetails;
  const pendingOrderDetails = reviewStatusData?.pendingOrderDetails;
  const deliveryStatus = reviewStatusData?.deliveryStatus;
  const existingReview = reviewStatusData?.existingReview;

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to write a review.',
        variant: 'destructive'
      });
      return;
    }
    if (!reviewStatus?.can_review) {
      if (!reviewStatus?.has_purchased) {
        toast({
          title: 'Purchase Required',
          description: 'You can only review products you have purchased.',
          variant: 'destructive'
        });
      } else if (!reviewStatus?.has_delivered) {
        toast({
          title: 'Delivery Required',
          description: 'You can only review products that have been delivered to you.',
          variant: 'destructive'
        });
      } else if (reviewStatus?.has_reviewed) {
        toast({
          title: 'Already Reviewed',
          description: 'You have already reviewed this product.',
          variant: 'destructive'
        });
      }
      return;
    }
    setShowReviewForm(true);
    setEditingReview(null);
  };

  const handleReviewSubmitted = (review: ProductReview) => {
    setShowReviewForm(false);
    setEditingReview(null);
    // Refresh review status using the hook
    refreshStatus();
  };

  const handleReviewUpdate = (review: ProductReview) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewDelete = (reviewId: number) => {
    // Refresh review status after deletion
    refreshStatus();
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  // Show review form if user is writing/editing a review (only for authenticated)
  if (isAuthenticated && showReviewForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <Button variant="outline" onClick={handleCancelReview}>
            Back to Reviews
          </Button>
        </div>
        <ReviewForm
          productId={productId}
          existingReview={editingReview}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={handleCancelReview}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-3xl mx-auto w-full">
      {/* Header - Review status badges only visible to authenticated user */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">Customer Reviews</h2>
        {isAuthenticated && reviewStatus && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center sm:justify-end">
            {!isLoadingStatus && (
              <>
                {reviewStatus.can_review && (
                  <Button onClick={handleWriteReview} className="w-full sm:w-auto">
                    Write a Review
                  </Button>
                )}
                {reviewStatus.has_reviewed && reviewStatus.existing_review && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <Star className="w-3 h-3 mr-1" />
                      <span className="hidden xs:inline">You reviewed this product</span>
                      <span className="inline xs:hidden">Reviewed</span>
                    </Badge>
                  </div>
                )}
                {reviewStatus.has_purchased && !reviewStatus.has_delivered && (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    <span className="hidden xs:inline">{reviewStatus.delivery_status === 'pending' ? 'Order processing - review after delivery' : 'Order shipped - review after delivery'}</span>
                    <span className="inline xs:hidden">Review after delivery</span>
                  </Badge>
                )}    
              </>
            )}
            {isLoadingStatus && (
              <div className="animate-pulse">
                <div className="h-9 w-24 bg-muted rounded"></div>
              </div>
            )}
          </div>
        )}
        {/* No login prompt for guests; just show reviews below */}
      </div>

      {/* Review Requirements Info - Only visible to authenticated users */}
      {isAuthenticated && reviewStatus && !isAdmin && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1 text-center sm:text-left">Review Guidelines</h4>
                <div className="text-sm text-muted-foreground space-y-1 text-center sm:text-left">
                  {reviewStatus.has_purchased && !reviewStatus.has_delivered && (
                    <p>• Your review will be available once your order is delivered (currently {reviewStatus.delivery_status})</p>
                  )}
                  {reviewStatus.can_review && (
                    <p>• You can now review this product based on your experience</p>
                  )}
                  <p>• Reviews help other customers make informed decisions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review List - always visible */}
      <ReviewList
        productId={productId}
        onReviewUpdate={isAuthenticated ? handleReviewUpdate : undefined}
        onReviewDelete={isAuthenticated ? handleReviewDelete : undefined}
        onWriteReview={isAuthenticated ? handleWriteReview : undefined}
        canUserWriteReview={isAuthenticated ? canReview : false}
      />
    </div>
  );
};

export default ProductReviews;

