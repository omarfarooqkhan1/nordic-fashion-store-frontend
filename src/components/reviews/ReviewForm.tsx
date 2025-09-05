import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/ui/StarRating';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createReview, 
  updateReview, 
  type CreateReviewData, 
  type ProductReview 
} from '@/api/reviews';

interface ReviewFormProps {
  productId: number;
  existingReview?: ProductReview | null;
  onReviewSubmitted: (review: ProductReview) => void;
  onCancel: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  existingReview,
  onReviewSubmitted,
  onCancel
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Media state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{ url: string; type: string; file?: File }[]>([]);
  const [existingMedia, setExistingMedia] = useState<{ url: string; type: string }[]>(existingReview?.media || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!existingReview;

  // Prevent editing if review is approved
  const isApproved = existingReview?.status === 'approved';

  // Generate previews for selected files
  useEffect(() => {
    if (selectedFiles.length === 0) {
      setMediaPreviews([]);
      return;
    }
    const previews = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      file,
    }));
    setMediaPreviews(previews);
    // Cleanup
    return () => previews.forEach(p => URL.revokeObjectURL(p.url));
  }, [selectedFiles]);

  // Remove selected file before upload
  const handleRemoveSelected = (idx: number) => {
    if (isApproved) return;
    setSelectedFiles(files => files.filter((_, i) => i !== idx));
  };

  // Remove existing media (for edit)
  const handleRemoveExisting = (idx: number) => {
    if (isApproved) return;
    setExistingMedia(media => media.filter((_, i) => i !== idx));
    // No need to call backend here; backend will delete removed media on update
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isApproved) return;
    if (!e.target.files) return;
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isApproved) {
      toast({
        title: 'Review Locked',
        description: 'You cannot edit an approved review.',
        variant: 'destructive'
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating before submitting your review.',
        variant: 'destructive'
      });
      return;
    }

    if (!title.trim() && !reviewText.trim()) {
      toast({
        title: 'Review Content Required',
        description: 'Please provide either a title or review text.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('rating', String(rating));
      if (title.trim()) formData.append('title', title.trim());
      if (reviewText.trim()) formData.append('review_text', reviewText.trim());
      // Always attach new files as 'media' (Laravel will treat as array)
      selectedFiles.forEach((file) => formData.append('media', file));
      // For edit: always send the list of existing media to keep (even if empty)
      if (isEditing) {
        formData.append('existing_media', JSON.stringify(existingMedia));
      }

      let response;
      if (isEditing && existingReview) {
        response = await updateReview(productId, existingReview.id, formData);
        toast({
          title: 'Review Updated',
          description: 'Your review has been updated successfully.',
        });
      } else {
        response = await createReview(productId, formData);
        toast({
          title: 'Review Submitted',
          description: 'Thank you for your review!',
        });
      }

      onReviewSubmitted(response.data);
    } catch (error: any) {
      let description = 'Failed to submit review. Please try again.';
      if (error.response?.status === 422 && error.response?.data?.errors) {
        // Laravel validation errors: { field: [msg, ...], ... }
        const errors = error.response.data.errors;
        description = Object.values(errors)
          .flat()
          .join(' ');
      } else if (error.response?.data?.message) {
        description = error.response.data.message;
      }
      toast({
        title: 'Error',
        description,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? 'Edit Review' : 'Write a Review'}
          {user && (
            <span className="text-sm text-muted-foreground">
              for {user.name}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selection */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating *</Label>
            <div className="flex items-center gap-4">
              <StarRating
                rating={rating}
                interactive={true}
                onRatingChange={setRating}
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              maxLength={255}
              disabled={isApproved}
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="reviewText">Review Details (Optional)</Label>
            <Textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your detailed thoughts about this product..."
              rows={4}
              maxLength={1000}
              disabled={isApproved}
            />
            <div className="text-xs text-muted-foreground text-right">
              {reviewText.length}/1000 characters
            </div>
          </div>


          {/* Media Upload Section */}
          <div className="space-y-2">
            <Label>Images/Videos (optional, max 5)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              disabled={isSubmitting || isApproved}
              className="block w-full border border-gray-200 rounded p-2"
            />
            <div className="flex flex-wrap gap-3 mt-2">
              {/* Existing media (edit) */}
              {existingMedia.map((media, idx) => (
                <div key={media.url} className="relative w-24 h-24 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                  {media.type === 'image' ? (
                    <img src={media.url} alt="media" className="object-cover w-full h-full" />
                  ) : (
                    <video src={media.url} controls className="object-cover w-full h-full" />
                  )}
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-white bg-opacity-80 text-red-600 rounded-bl px-1 py-0.5 text-xs"
                    onClick={() => handleRemoveExisting(idx)}
                    disabled={isSubmitting || isApproved}
                  >Remove</button>
                </div>
              ))}
              {/* New media previews */}
              {mediaPreviews.map((media, idx) => (
                <div key={media.url} className="relative w-24 h-24 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                  {media.type === 'image' ? (
                    <img src={media.url} alt="preview" className="object-cover w-full h-full" />
                  ) : (
                    <video src={media.url} controls className="object-cover w-full h-full" />
                  )}
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-white bg-opacity-80 text-red-600 rounded-bl px-1 py-0.5 text-xs"
                    onClick={() => handleRemoveSelected(idx)}
                    disabled={isSubmitting || isApproved}
                  >Remove</button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || isApproved}
            >
              {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Review' : 'Submit Review')}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground text-center">
            * You can only review products you have purchased. 
            {isEditing ? ' You can edit your review at any time.' : ' You can edit your review later.'}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
