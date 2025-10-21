import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ProductImage from '@/components/ui/ProductImage';
import { Product } from '@/types/Product';

interface SimilarProductsProps {
  products: Product[];
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({ products }) => {
  const { t } = useLanguage();
  const { convertPrice, getCurrencySymbol } = useCurrency();
  const currencySymbol = getCurrencySymbol();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-8 sm:py-12 lg:py-16 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 sm:space-y-12">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t('product.similarProducts')}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('product.similarProductsDescription')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto px-2 sm:px-4">
            {products.map((product) => {
              // Get first variant price or 0 if no variants
              const price = product.variants && product.variants.length > 0
                ? product.variants[0].price
                : 0;

              // Get first image or fallback
              const image = product.images && product.images.length > 0
                ? product.images[0]
                : null;

              return (
                <Card
                  key={product.id}
                  className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group rounded-xl md:rounded-2xl"
                >
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-leather-200 to-leather-300 dark:from-leather-800 dark:to-leather-900 relative overflow-hidden">
                      {image ? (
                        <img
                          src={image.url}
                          alt={image.alt_text || product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src="/placeholder.svg"
                            alt="No image available"
                            className="w-full h-full object-cover opacity-50"
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4 md:p-6 space-y-3">
                    <Link to={`/product/${product.id}`}>
                      <div>
                        <h3 className="font-semibold text-foreground hover:text-cognac-500 transition-colors">
                          {product?.name || "Unnamed Product"}
                        </h3>
                      </div>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-cognac-500">
                            {currencySymbol}{price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:border-primary/40"
                      >
                        <Link to={`/product/${product.id}`}>
                          {t('common.buyNow')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};