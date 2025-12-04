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
  gender: 'male' | 'female' | 'unisex';
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
  const { t, language } = useLanguage();

  const gridClasses = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  };

  if (loading) {
    return (
      <div className={cn('grid gap-3 sm:gap-4 md:gap-6', gridClasses[columns], className)}>
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
    <div className={cn('grid gap-3 sm:gap-4 md:gap-6 max-w-7xl mx-auto px-2 sm:px-4', gridClasses[columns], className)}>
      {products.map((product) => {
        const discountedPrice = product.discount 
          ? product.price * (1 - product.discount / 100)
          : product.price;

        const mainImage = product.images?.[0]?.url || 
          `https://placehold.co/400x400/EFEFEF/AAAAAA?text=${encodeURIComponent(product.name)}`;

        return (
          <Card key={product.id} className="bg-white dark:bg-card border border-gray-200 dark:border-border group overflow-hidden hover:shadow-lg transition-all duration-300">
            <Link to={`/products/${product.id}`}>
              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-white">
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
                  
                  {/* Gender Badge */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs capitalize",
                        product.gender === 'male' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                        product.gender === 'female' && "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
                        product.gender === 'unisex' && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      )}
                    >
                      {language === 'en' ? product.gender.charAt(0).toUpperCase() + product.gender.slice(1) : t(`gender.${product.gender}`)}
                    </Badge>
                  </div>
                </div>

                {/* Price */}
                <PriceDisplay
                  price={discountedPrice}
                  originalPrice={product.discount ? product.price : undefined}
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
