import React from 'react';
import { ProductReviews } from './index';

interface ReviewSystemDemoProps {
  productId: number;
  productName: string;
}

export const ReviewSystemDemo: React.FC<ReviewSystemDemoProps> = ({
  productId,
  productName
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Product Reviews Demo</h1>
        
        {/* Product Info */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">{productName}</h2>
          <p className="text-muted-foreground">
            This is a demo showing how the review system integrates with product pages.
          </p>
        </div>

        {/* Review System */}
        <ProductReviews 
          productId={productId}
          productName={productName}
        />
      </div>
    </div>
  );
};

export default ReviewSystemDemo;
