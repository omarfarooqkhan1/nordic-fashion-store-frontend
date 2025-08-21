import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import PriceDisplay from './PriceDisplay';
import { cn } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  price: string;
  discount?: number;
  category: {
    id: number;
    name: string;
  };
  images?: Array<{ url: string; alt_text?: string }>;
  variants?: Array<any>;
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4 | 5;
  showCategory?: boolean;
  showVariants?: boolean;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  columns = 4,
  showCategory = true,
  showVariants = true,
  className
}) => {
  const { t } = useLanguage();

  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  };

  if (loading) {
    return (
      <div className={cn('grid gap-6', gridClasses[columns], className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
            <CardContent className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {t('products.notFound') || 'No products found'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6 max-w-7xl mx-auto', gridClasses[columns], className)}>
      {products.map((product) => {
        const discountedPrice = product.discount 
          ? Number(product.price) * (1 - product.discount / 100)
          : Number(product.price);

        const mainImage = product.images?.[0]?.url || 
          `https://placehold.co/400x400/EFEFEF/AAAAAA?text=${encodeURIComponent(product.name)}`;

        return (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/products/${product.id}`}>
              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/400x400/EFEFEF/AAAAAA?text=No+Image`;
                  }}
                />
                {product.discount && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-500 text-white">
                      -{product.discount}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <CardContent className="p-4 space-y-2">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-gold-600 transition-colors">
                    {product?.name || 'Unnamed Product'}
                  </h3>
                  
                  {showCategory && (
                    <p className="text-sm text-muted-foreground capitalize">
                      {product?.category?.name || 'Uncategorized'}
                    </p>
                  )}
                </div>

                {/* Price */}
                <PriceDisplay
                  price={discountedPrice}
                  originalPrice={product.discount ? Number(product.price) : undefined}
                  size="md"
                />

                {/* Variants Info */}
                {showVariants && product.variants && product.variants.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {product.variants.length} {product.variants.length === 1 ? 'variant' : 'variants'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductGrid;
