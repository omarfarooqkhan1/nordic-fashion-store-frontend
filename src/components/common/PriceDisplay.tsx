import React from 'react';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscount?: boolean;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  currency = '€',
  size = 'md',
  showDiscount = true,
  className
}) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const sizeClasses = {
    sm: {
      price: 'text-sm',
      original: 'text-xs',
      discount: 'text-xs'
    },
    md: {
      price: 'text-base',
      original: 'text-sm',
      discount: 'text-sm'
    },
    lg: {
      price: 'text-lg',
      original: 'text-base',
      discount: 'text-sm'
    },
    xl: {
      price: 'text-xl',
      original: 'text-lg',
      discount: 'text-base'
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn(
        'font-semibold text-gold-500',
        sizeClasses[size].price
      )}>
        {currency}{price.toFixed(2)}
      </span>
      
      {hasDiscount && (
        <>
          <span className={cn(
            'text-muted-foreground line-through',
            sizeClasses[size].original
          )}>
            {currency}{originalPrice.toFixed(2)}
          </span>
          
          {showDiscount && (
            <span className={cn(
              'bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium',
              sizeClasses[size].discount
            )}>
              -{discountPercentage}%
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default PriceDisplay;
