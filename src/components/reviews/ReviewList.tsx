
import React, { useState, useEffect } from 'react';

// Simple modal for media preview
const MediaPreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  media: { url: string; type: string } | null;
}> = ({ open, onClose, media }) => {
  if (!open || !media) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={onClose}>
      <div className="bg-white rounded shadow-lg max-w-full max-h-full p-2 relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-gray-700 hover:text-black" onClick={onClose}>&times;</button>
        {media.type === 'image' ? (
          <img src={media.url} alt="Media preview" className="max-w-[80vw] max-h-[80vh] object-contain" />
        ) : media.type === 'video' ? (
          <video src={media.url} controls autoPlay className="max-w-[80vw] max-h-[80vh] object-contain" />
        ) : null}
      </div>
    </div>
  );
};

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, MessageSquare, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getProductReviews, deleteReview, type ProductReview, type ReviewsListResponse } from '@/api/reviews';
import { formatDistanceToNow } from 'date-fns';

interface ReviewListProps {
  productId: number;
  onReviewUpdate: (review: ProductReview) => void;
  onReviewDelete: (reviewId: number) => void;
  onWriteReview: () => void;
  canUserWriteReview?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  onReviewUpdate,
  onReviewDelete,
  onWriteReview,
  canUserWriteReview
}) => {
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const handleMediaClick = (media: { url: string; type: string }) => {
    setPreviewMedia(media);
    setIsPreviewOpen(true);
  };
  const { user, isAdmin, token } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [productInfo, setProductInfo] = useState<ReviewsListResponse['product'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, currentPage]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await getProductReviews(productId, currentPage);
      // Try to handle both possible shapes
      let reviews: ProductReview[] = [];
      let product: ReviewsListResponse['product'] | null = null;
      let totalPages = 1;
      if (response.data) {
        // Laravel resource shape: { data: ProductReview[], ...pagination, product }
        if (Array.isArray(response.data.data)) {
          reviews = response.data.data;
          product = (response.data as any).product || null;
          totalPages = response.data.last_page || 1;
        } else if (
          response.data.data &&
          typeof response.data.data === 'object' &&
          Array.isArray((response.data.data as any).data)
        ) {
          // Nested shape: { data: { data: ProductReview[], last_page, ... }, product }
          const nested = response.data.data as { data: ProductReview[]; last_page?: number };
          reviews = nested.data;
          product = (response.data as any).product || null;
          totalPages = nested.last_page || 1;
        }
      }
      setReviews(reviews);
      setProductInfo(product);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    setIsDeleting(reviewId);
    try {
      await deleteReview(productId, reviewId);
      toast({
        title: 'Review Deleted',
        description: 'Your review has been deleted successfully.',
      });
      onReviewDelete(reviewId);
      fetchReviews();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete review. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const canEditReview = (review: ProductReview) => {
    return user && review.user_id === user.id && review.status !== 'approved';
  };

  let filteredReviews = reviews;
  if (!isAdmin) {
    filteredReviews = reviews.filter(
      (review) =>
        review.status === 'approved' ||
        (user && review.user_id === user.id)
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading reviews...</span>
      </div>
    );
  }

  if (filteredReviews.length === 0) {
    if (isAdmin) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share your experience with this product!
          </p>
          {canUserWriteReview && (
            <Button onClick={onWriteReview}>
              Write the First Review
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-3xl mx-auto">
      {/* Reviews Summary */}
      {productInfo && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="text-center min-w-[100px]">
                  <div className="text-3xl font-bold text-primary">
                    {Number(productInfo.average_rating).toFixed(1)}
                  </div>
                  <StarRating rating={productInfo.average_rating} size="sm" />
                  <div className="text-sm text-muted-foreground">
                    {productInfo.review_count} review{productInfo.review_count !== 1 ? 's' : ''}
                  </div>
                </div>
                <Separator orientation="vertical" className="h-16 hidden sm:block" />
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold mb-2">Customer Reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on verified purchases
                  </p>
                </div>
              </div>
              {/* Only show the button if user can write a review */}
              {canUserWriteReview && (
                <Button onClick={onWriteReview} className="w-full md:w-auto mt-4 md:mt-0">
                  Write a Review
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const isOwnReview = user && review.user && user.id === review.user.id;
          return (
            <Card key={review.id}>
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {review.user && review.user.name ? review.user.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {isOwnReview ? 'Your review' : (review.user && review.user.name ? review.user.name : 'Unknown')}
                        {/* Show email only for admin and only for pending reviews */}
                        {isAdmin && review.status === 'pending' && review.user?.email ? ` (${review.user.email})` : ''}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                    {review.is_verified_purchase && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Purchase
                      </Badge>
                    )}
                    {/* Moderation status badge */}
                    {review.status === 'pending' && (
                      <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-400 bg-yellow-50">
                        Pending Approval
                      </Badge>
                    )}
                    {review.status === 'rejected' && (
                      <Badge variant="outline" className="text-xs text-red-600 border-red-400 bg-red-50">
                        Rejected
                      </Badge>
                    )}
                    {canEditReview(review) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReviewUpdate(review)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={isDeleting === review.id}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {/* Admin Approve/Reject buttons for pending reviews */}
                    {isAdmin && review.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={async () => {
                            if (!token) {
                              toast({ title: 'Admin token missing', description: 'Please log in again as admin.', variant: 'destructive' });
                              return;
                            }
                            try {
                              // Use shared getHeaders for Authorization
                              const { approveReview } = await import('@/api/reviews');
                              const { buildApiHeaders } = await import('@/api/api-headers');
                              await approveReview(review.id, buildApiHeaders(undefined, token));
                              toast({ title: 'Review approved' });
                              fetchReviews();
                            } catch (e) {
                              toast({ title: 'Error approving review', description: (e as any)?.response?.data?.message || undefined, variant: 'destructive' });
                            }
                          }}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (!token) {
                              toast({ title: 'Admin token missing', description: 'Please log in again as admin.', variant: 'destructive' });
                              return;
                            }
                            try {
                              // Use shared getHeaders for Authorization
                              const { rejectReview } = await import('@/api/reviews');
                              const { buildApiHeaders } = await import('@/api/api-headers');
                              await rejectReview(review.id, buildApiHeaders(undefined, token));
                              toast({ title: 'Review rejected' });
                              fetchReviews();
                            } catch (e) {
                              toast({ title: 'Error rejecting review', description: (e as any)?.response?.data?.message || undefined, variant: 'destructive' });
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <StarRating rating={review.rating} size="sm" />
                </div>

                {review.title && (
                  <h4 className="font-semibold mb-2">{review.title}</h4>
                )}

                {review.review_text && (
                  <p className="text-muted-foreground leading-relaxed">
                    {review.review_text}
                  </p>
                )}

                {/* Media Section */}
                {review.media && review.media.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {review.media.map((media, idx) => (
                      <button
                        key={media.url || idx}
                        className="w-24 h-24 border rounded overflow-hidden flex items-center justify-center bg-gray-50 focus:outline-none"
                        type="button"
                        onClick={() => handleMediaClick(media)}
                        title="Click to preview"
                      >
                        {media.type === 'image' ? (
                          <img
                            src={media.url}
                            alt={`Review media ${idx + 1}`}
                            className="object-cover w-full h-full"
                          />
                        ) : media.type === 'video' ? (
                          <video
                            src={media.url}
                            className="object-cover w-full h-full"
                            muted
                            playsInline
                          />
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
                {/* Media Preview Modal */}
                <MediaPreviewModal open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} media={previewMedia} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;

