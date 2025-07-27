import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types/Product';
import { fetchProducts } from '@/api/products';
import { useToast } from '@/hooks/use-toast';

const Products = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['all', 'bags', 'wallets', 'belts', 'jackets', 'accessories'];

  // Sync URL params with state
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('all');
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
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 1,
  });

  // Filtering
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category.name.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price') return Number(a.price) - Number(b.price);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const handleAddToCart = (product: Product) => {
    // Get the first available variant ID or use direct product ID if no variants
    if (product.variants && product.variants.length > 0) {
      // Use the first available variant that has stock > 0
      const availableVariant = product.variants.find(variant => variant.stock > 0);
      
      if (availableVariant) {
        addToCart(availableVariant.id, 1);
      } else {
        // If no variant has stock, use the first variant anyway but add error handling in the cart context
        addToCart(product.variants[0].id, 1);
      }
    } else {
      // Fallback to product ID (should be handled by backend)
      console.error('No variants found for product:', product.id);
      // We should not reach here in a well-structured product, but handle it gracefully
      toast({
        title: t('toast.error'),
        description: t('product.selectVariant') || 'Please select a product variant',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-leather-900 dark:text-leather-100">
          {searchQuery ? `Search Results for "${searchQuery}"` : t('products.title') || 'Our Products'}
        </h1>
        <p className="text-xl text-leather-700 dark:text-leather-200 max-w-2xl mx-auto">
          {searchQuery
            ? `Found ${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''}`
            : t('common.discover')}
        </p>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4">
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories
                .filter((cat) => cat !== 'all')
                .map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          {searchQuery && (
            <div className="flex items-center gap-2 px-3 py-1 bg-cognac-100 dark:bg-cognac-900/20 rounded-full text-sm">
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
          <p className="text-muted-foreground">
            {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Loading/Error */}
      {isLoading && <p className="text-center">Loading products...</p>}
      {isError && <p className="text-center text-red-600">Error: {error?.message}</p>}

      {/* Product Grid */}
      {!isLoading && !isError && (
        <>
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
                >
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-leather-200 to-leather-300 dark:from-leather-800 dark:to-leather-900 relative overflow-hidden">
                      {product.discount && (
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
                  <CardContent className="p-4 space-y-3">
                    <Link to={`/product/${product.id}`}>
                      <div>
                        <h3 className="font-semibold text-foreground hover:text-cognac-500 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">{product.category.name}</p>
                      </div>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {product.discount ? (
                          <>
                            <span className="text-lg font-bold text-cognac-500">
                              €{Math.round(Number(product.price) * (1 - Number(product.discount) / 100))}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">€{product.price}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-cognac-500">€{product.price}</span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-300 border border-primary/20 hover:border-primary/40"
                      >
                        {t('product.addToCart')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;