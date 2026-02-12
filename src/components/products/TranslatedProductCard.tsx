import React from 'react';
import { useProductTranslation } from '@/hooks/useProductTranslation';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types/Product';

interface TranslatedProductCardProps {
  product: Product;
  [key: string]: any; // Allow passing through other props
}

/**
 * Wrapper component that translates product name and description
 * before rendering the ProductCard
 */
export const TranslatedProductCard: React.FC<TranslatedProductCardProps> = ({ 
  product, 
  ...otherProps 
}) => {
  const { name, description, isTranslating } = useProductTranslation(product);

  // Create translated product object
  const translatedProduct = {
    ...product,
    name,
    description,
  };

  return (
    <div className="relative">
      {isTranslating && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            Translating...
          </div>
        </div>
      )}
      <ProductCard product={translatedProduct} {...otherProps} />
    </div>
  );
};
