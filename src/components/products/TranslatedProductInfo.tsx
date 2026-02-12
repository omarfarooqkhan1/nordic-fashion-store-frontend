import React from 'react';
import { useProductTranslation } from '@/hooks/useProductTranslation';

interface TranslatedProductInfoProps {
  product: {
    name: string;
    description: string;
  };
  children: (translatedProduct: {
    name: string;
    description: string;
    isTranslating: boolean;
  }) => React.ReactNode;
}

/**
 * Render prop component for translating product information
 * Usage:
 * <TranslatedProductInfo product={product}>
 *   {({ name, description, isTranslating }) => (
 *     <div>
 *       <h1>{name}</h1>
 *       <p>{description}</p>
 *     </div>
 *   )}
 * </TranslatedProductInfo>
 */
export const TranslatedProductInfo: React.FC<TranslatedProductInfoProps> = ({ 
  product, 
  children 
}) => {
  const translatedProduct = useProductTranslation(product);
  return <>{children(translatedProduct)}</>;
};
