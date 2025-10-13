import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Product } from '@/types/Product';
import { fetchProducts } from '@/api/products';
import { LoadingState } from '@/components/common/LoadingState';

const Products = () => {
  const { t, language } = useLanguage();
  const { convertPrice, getCurrencySymbol } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['all', 'bags', 'wallets', 'belts', 'jackets', 'accessories'];
  const genders = ['all', 'male', 'female', 'unisex'];

  // Scroll to top when component mounts or search parameters change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchQuery, selectedCategory, selectedGender]);

  // Sync URL params with state
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const genderParam = searchParams.get('gender');
    const searchParam = searchParams.get('search');

    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('all');
    }

    if (genderParam && genders.includes(genderParam)) {
      setSelectedGender(genderParam);
    } else {
      setSelectedGender('all');
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  // React Query hook to fetch products
  const { data: products = [], isLoading, isError, error } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await fetchProducts();
      console.log('[Products.tsx] Fetched products:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 1,
  });

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    return ['all', ...new Set(products.map(p => p.category.name.toLowerCase()))];
  }, [products]);

  // Filtering products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category.name.toLowerCase() === selectedCategory.toLowerCase();

    const matchesGender =
      selectedGender === 'all' || 
      product.gender === selectedGender || 
      product.gender === 'unisex';

    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesGender && matchesSearch;
  });


  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="container mx-auto px-2 sm:px-4 py-0 sm:py-0 space-y-8">
      {/* Header */}
      <section className="text-center space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-leather-900 dark:text-leather-100">
          {searchQuery ? `Search Results for "${searchQuery}"` : t('products.title') || 'Our Products'}
        </h1>
        <p className="text-base sm:text-xl text-leather-700 dark:text-leather-200 max-w-xl sm:max-w-2xl mx-auto">
          {searchQuery
            ? `Found ${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''}`
            : t('common.discover')}
        </p>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              const newParams = new URLSearchParams(searchParams);
              if (value === 'all') {
                newParams.delete('category');
              } else {
                newParams.set('category', value);
              }
              setSearchParams(newParams);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableCategories
                .filter((cat) => cat !== 'all')
                .map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedGender}
            onValueChange={(value) => {
              setSelectedGender(value);
              const newParams = new URLSearchParams(searchParams);
              if (value === 'all') {
                newParams.delete('gender');
              } else {
                newParams.set('gender', value);
              }
              setSearchParams(newParams);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'en' ? 'All Genders' : t('gender.all')}</SelectItem>
              <SelectItem value="male">{language === 'en' ? 'Male' : t('gender.male')}</SelectItem>
              <SelectItem value="female">{language === 'en' ? 'Female' : t('gender.female')}</SelectItem>
              <SelectItem value="unisex">{language === 'en' ? 'Unisex' : t('gender.unisex')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {searchQuery && (
            <div className="flex items-center gap-2 px-3 py-1 bg-cognac-100 dark:bg-cognac-900/20 rounded-full text-xs sm:text-sm">
              <span>Search: "{searchQuery}"</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => {
                  setSearchQuery('');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  setSearchParams(newParams);
                }}
              >
                ✕
              </Button>
            </div>
          )}
          <p className="text-xs sm:text-sm text-muted-foreground">
            {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Loading/Error */}
      {isLoading && <LoadingState message="Loading products..." className="py-12" />}
      {isError && <p className="text-center text-red-600">Error: {error?.message}</p>}

      {/* Product Grid */}
      {!isLoading && !isError && (
        <>
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto px-2 sm:px-4">
              {sortedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group rounded-xl md:rounded-2xl"
                >
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-leather-200 to-leather-300 dark:from-leather-800 dark:to-leather-900 relative overflow-hidden">
                      {product.discount > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white z-10">
                          -{product.discount}%
                        </Badge>
                      )}
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt_text || product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      ) : product.variants && product.variants.length > 0 && product.variants[0].images && product.variants[0].images.length > 0 ? (
                        <img
                          src={product.variants[0].images[0].url}
                          alt={product.variants[0].images[0].alt_text || product.name}
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
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">{product.category.name}</p>
                      </div>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                            if (!firstVariant) return <span className="text-lg font-bold text-cognac-500">N/A</span>;
                            const basePrice = firstVariant.price;
                            const discount = product.discount || 0;
                            const discountedPrice = basePrice * (1 - discount / 100);
                            if (discount > 0) {
                              return <>
                                <span className="text-lg font-bold text-cognac-500">
                                  {getCurrencySymbol()}{Math.round(Number(convertPrice(discountedPrice)))}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">{getCurrencySymbol()}{convertPrice(basePrice).toFixed(2)}</span>
                              </>;
                            } else {
                              return <span className="text-lg font-bold text-cognac-500">{getCurrencySymbol()}{convertPrice(basePrice).toFixed(2)}</span>;
                            }
                          })()}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('products.noProductsFound')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;