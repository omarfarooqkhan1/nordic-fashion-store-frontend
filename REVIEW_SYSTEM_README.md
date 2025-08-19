# Product Review System

A comprehensive review system for the Nordic Fashion Store that allows customers to write, edit, and manage product reviews with star ratings.

## Features

✅ **Purchase Verification** - Only customers who bought the product can review  
✅ **One Review Per Product** - Prevents duplicate reviews per user  
✅ **Star Rating System** - 1-5 star ratings with interactive selection  
✅ **Review Management** - Customers can edit/delete their own reviews  
✅ **Verified Purchase Badges** - Shows which reviews are from verified purchases  
✅ **Pagination** - Handles large numbers of reviews efficiently  
✅ **Real-time Updates** - Reviews update immediately after submission  

## Backend Implementation

### Database Structure

The system uses a `product_reviews` table with the following structure:

```sql
CREATE TABLE product_reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INT NOT NULL COMMENT '1-5 star rating',
    title VARCHAR(255) NULL,
    review_text TEXT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_product_rating (product_id, rating),
    INDEX idx_user (user_id)
);
```

### Models

- **ProductReview** - Main review model with relationships and helper methods
- **Product** - Enhanced with review relationships and rating calculations

### API Endpoints

All endpoints require authentication (`auth:sanctum` middleware):

```
GET    /products/{product}/reviews          - Get reviews for a product
POST   /products/{product}/reviews          - Create a new review
PUT    /products/{product}/reviews/{review} - Update an existing review
DELETE /products/{product}/reviews/{review} - Delete a review
GET    /products/{product}/can-review       - Check if user can review
```

### Security Features

- **Purchase Verification** - Checks order history before allowing reviews
- **Ownership Validation** - Users can only edit/delete their own reviews
- **Duplicate Prevention** - Database constraint prevents multiple reviews per user per product

## Frontend Implementation

### Components

1. **StarRating** (`/components/ui/StarRating.tsx`)
   - Reusable star rating component
   - Supports interactive and display modes
   - Configurable sizes (sm, md, lg)

2. **ReviewForm** (`/components/reviews/ReviewForm.tsx`)
   - Form for creating/editing reviews
   - Star rating selection
   - Title and review text fields
   - Validation and error handling

3. **ReviewList** (`/components/reviews/ReviewList.tsx`)
   - Displays all reviews for a product
   - Pagination support
   - Edit/delete actions for user's own reviews
   - Review summary with average rating

4. **ProductReviews** (`/components/reviews/ProductReviews.tsx`)
   - Main component that orchestrates the review system
   - Manages review form visibility
   - Handles review status checking
   - Integrates all sub-components

### API Integration

The system uses a dedicated API module (`/src/api/reviews.ts`) with:

- TypeScript interfaces for all data structures
- CRUD operations for reviews
- Purchase verification checks
- Error handling and response typing

## Usage

### Basic Integration

To add the review system to a product page:

```tsx
import { ProductReviews } from '@/components/reviews';

function ProductPage({ product }) {
  return (
    <div>
      {/* Product details */}
      <ProductDetails product={product} />
      
      {/* Review system */}
      <ProductReviews 
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}
```

### Standalone Components

You can also use individual components:

```tsx
import { StarRating, ReviewForm, ReviewList } from '@/components/reviews';

// Display rating
<StarRating rating={4.5} size="lg" />

// Show review form
<ReviewForm 
  productId={123}
  onReviewSubmitted={handleReviewSubmitted}
  onCancel={handleCancel}
/>

// Display reviews
<ReviewList 
  productId={123}
  onReviewUpdate={handleReviewUpdate}
  onReviewDelete={handleReviewDelete}
  onWriteReview={handleWriteReview}
/>
```

## User Experience Flow

1. **Viewing Reviews**
   - Customers can see all reviews with ratings, titles, and text
   - Reviews show user names, dates, and verified purchase badges
   - Pagination handles large numbers of reviews

2. **Writing Reviews**
   - Only authenticated users who purchased the product can write reviews
   - Star rating selection (1-5 stars)
   - Optional title and review text
   - Form validation ensures quality content

3. **Managing Reviews**
   - Users can edit their existing reviews
   - Users can delete their reviews
   - Changes are reflected immediately

4. **Review Status**
   - Clear indicators show if user can review
   - Purchase requirements are clearly communicated
   - Existing review status is displayed

## Styling and Theming

The system uses Tailwind CSS and follows the existing design system:

- **Colors**: Primary colors for ratings, muted for secondary text
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Components**: Built using existing UI components (Button, Card, Input, etc.)
- **Responsive**: Mobile-friendly design with proper touch targets

## Future Enhancements

Potential improvements for the review system:

- **Photo Reviews** - Allow customers to upload images with reviews
- **Review Helpfulness** - Let users mark reviews as helpful/unhelpful
- **Review Moderation** - Admin tools for managing inappropriate content
- **Review Analytics** - Dashboard showing review trends and insights
- **Email Notifications** - Notify customers when their reviews receive responses
- **Review Responses** - Allow store owners to respond to customer reviews

## Testing

The system includes comprehensive error handling and validation:

- **Frontend Validation**: Form validation for required fields
- **Backend Validation**: Server-side validation and security checks
- **Error Handling**: User-friendly error messages and fallbacks
- **Loading States**: Proper loading indicators for async operations

## Security Considerations

- **Authentication Required**: All review operations require user authentication
- **Purchase Verification**: Reviews only allowed for verified purchases
- **Ownership Validation**: Users can only modify their own reviews
- **Input Sanitization**: Proper validation and sanitization of user input
- **Rate Limiting**: Consider implementing rate limiting for review submissions

## Performance

- **Efficient Queries**: Database queries are optimized with proper indexing
- **Pagination**: Large review lists are paginated for better performance
- **Lazy Loading**: Reviews are loaded on-demand
- **Caching**: Consider implementing Redis caching for frequently accessed reviews

## Troubleshooting

### Common Issues

1. **"Purchase Required" Error**
   - Ensure the user has completed orders with status 'completed'
   - Check that the order contains the specific product

2. **"Already Reviewed" Error**
   - User has already submitted a review for this product
   - They can edit their existing review instead

3. **Authentication Errors**
   - Ensure user is logged in with valid session
   - Check that the auth token is being sent correctly

### Debug Mode

Enable console logging to debug issues:

```tsx
// Check review status
console.log('Review status:', reviewStatus);

// Check user authentication
console.log('User:', user, 'Authenticated:', isAuthenticated);
```

## Support

For issues or questions about the review system:

1. Check the browser console for error messages
2. Verify backend logs for server-side errors
3. Ensure database migrations have been run
4. Check API endpoint accessibility and authentication

---

**Note**: This review system is designed to be production-ready and includes all necessary security measures, validation, and error handling for a professional e-commerce platform.
