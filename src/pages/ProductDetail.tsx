import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '../api/products';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, ShoppingCart, Edit, Star, ArrowLeft, Check, X } from 'lucide-react';
import { Product, Variant } from '@/types/Product';
import { useToast } from '@/hooks/use-toast';
import ProductImage from '@/components/ui/ProductImage';
import MediaPreviewModal from '@/components/MediaPreviewModal';
import MediaThumbnail from '@/components/MediaThumbnail';
import { LoadingState, ErrorState } from '@/components/common';
import { ProductReviews } from '@/components/reviews';
import { ReviewList } from '@/components/reviews/ReviewList';
import { StarRating } from '@/components/ui/StarRating';

const ProductDetail = () => {
  // Modal state for previewing main image/video
  const [showMediaModal, setShowMediaModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { user } = useAuth(); // Add auth context
  const { toast } = useToast(); // Initialize useToast at the top level
  const { convertPrice, getCurrencySymbol } = useCurrency(); // Add currency context

  const isAdmin = user?.role === 'admin'; // Check if user is admin

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading, isError, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Ensure currentImageIndex is within bounds if product images change
  React.useEffect(() => {
    if (product && currentImageIndex >= product.images.length) {
      setCurrentImageIndex(0);
    }
  }, [product, currentImageIndex]);

  const [reviewSummary, setReviewSummary] = useState<{ average_rating: number; review_count: number } | null>(null);
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Preload main product image for better LCP
  useEffect(() => {
    if (product && product.images.length > 0) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = product.images[0].url;
      document.head.appendChild(link);
    }
  }, [product]);

  // Fetch review summary on mount
  useEffect(() => {
    if (!product?.id) return; // Don't fetch if no product ID
    
    let isMounted = true;
    import('@/api/reviews').then(({ getProductReviews }) => {
      getProductReviews(product.id, 1).then((res) => {
        if (isMounted && res.product) {
          // Defensive: ensure average_rating is a number
          let avg = Number(res.product.average_rating);
          if (isNaN(avg)) avg = 0;
          setReviewSummary({
            average_rating: avg,
            review_count: Number(res.product.review_count) || 0,
          });
        }
      }).catch((error) => {
        // Set default values on error
        if (isMounted) {
          setReviewSummary({
            average_rating: 0,
            review_count: 0,
          });
        }
      });
    });
    return () => { isMounted = false; };
  }, [product?.id]);

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />;
  }

  if (isError || !product) {
    return (
      <ErrorState 
        title={t('error.notFound')}
        backButton={{
          text: `${t('common.back')} ${t('nav.products')}`,
          path: "/products"
        }}
      />
    );
  }

  const allSizes = Array.from(new Set(product.variants.map((v) => v.size))) as string[];
  const allColors = Array.from(new Set(product.variants.map((v) => v.color))) as string[];

  const getSelectedVariant = (): Variant | undefined => {
    return product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
  };

  const variant = getSelectedVariant();
  const isVariantSelected = !!variant;
  const isInStock = variant ? variant.stock > 0 : false;
  // Always use product images for thumbnails - don't filter based on variant
  const variantImages = product.images;
  // Determine if main media is video or image
  const mainMedia = variantImages[currentImageIndex];

  const basePrice = parseFloat(product.price);
  const finalPrice = variant ? variant.actual_price : basePrice;
  const discountedPrice = product.discount
    ? (finalPrice * (1 - product.discount / 100))
    : finalPrice;
  
  // Convert prices using currency context
  const convertedFinalPrice = convertPrice(finalPrice);
  const convertedDiscountedPrice = convertPrice(discountedPrice);
  const currencySymbol = getCurrencySymbol();

  const handleAddToCart = async () => { // Made async to await addToCart
    if (!variant) {
      toast({ 
        title: t('product.chooseVariant'), 
        description: t('product.selectSizeAndColor'), 
        variant: 'destructive' 
      });
      return;
    }

    if (variant.stock === 0) {
      toast({ 
        title: t('product.outOfStock'), 
        description: t('product.outOfStock'), 
        variant: 'destructive' 
      });
      return;
    }

    try {
      // Pass variant.id and quantity (1) directly to addToCart
      await addToCart(variant.id, 1);
      toast({ title: t('toast.addedToCart'), description: `${product.name} (${variant.size}, ${variant.color})`, className: "bg-green-500 text-white" });
    } catch (error) {
      toast({ title: t('toast.error'), description: t('toast.cartError'), variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-10 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4 sm:space-y-6 lg:px-8 xl:px-12">
          <Button variant="ghost" onClick={() => navigate('/products')} className="mb-4 sm:mb-6 hover:bg-accent text-base sm:text-lg transition-colors duration-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div className="aspect-[3/4] rounded-xl overflow-hidden relative bg-white flex items-center justify-center min-h-[320px] sm:min-h-[420px] md:min-h-[500px] max-h-[600px] mx-auto max-w-md lg:max-w-lg border border-gray-200 dark:border-slate-600">
            {product.discount && (
              <Badge className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-red-500 text-white text-xs sm:text-sm md:text-base">
                -{product.discount}%
              </Badge>
            )}
            <MediaThumbnail
              media={mainMedia ? {
                url: mainMedia.url,
                type: mainMedia.url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image'
              } : null}
              onClick={() => mainMedia && setShowMediaModal(true)}
              className="w-full h-full"
            />
            {/* Modal for preview (reusable) */}
            <MediaPreviewModal
              open={!!mainMedia && showMediaModal}
              onClose={() => setShowMediaModal(false)}
              media={mainMedia ? {
                url: mainMedia.url,
                type: mainMedia.url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image'
              } : null}
            />
          </div>

          {variantImages.length > 1 && (
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {variantImages.map((img, i) => (
                <button
                  key={img.id || i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-16 h-20 sm:w-18 sm:h-24 md:w-20 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                    i === currentImageIndex 
                      ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                      : 'border-gray-200 dark:border-slate-600 hover:border-primary/50 shadow-md hover:shadow-lg'
                  }`}
                >
                  <ProductImage
                    src={img.url}
                    alt={img.alt_text}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold break-words text-gray-900 dark:text-white leading-tight">{product.name}</h1>
            <p className="text-gray-600 dark:text-slate-300 capitalize text-base sm:text-lg font-medium">{product.category.name}</p>
            {/* Product Rating Display */}
            <div className="flex items-center gap-3 mt-3">
              {reviewSummary && reviewSummary.review_count > 0 ? (
                <>
                  <StarRating rating={reviewSummary.average_rating} size="sm" />
                  <span className="text-sm text-gray-600 dark:text-slate-300">
                    {reviewSummary.average_rating.toFixed(1)} out of 5 ({reviewSummary.review_count} review{reviewSummary.review_count !== 1 ? 's' : ''})
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500 dark:text-slate-400">No reviews yet</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{currencySymbol}{convertedDiscountedPrice.toFixed(2)}</span>
            {product.discount && (
              <>
                <span className="text-lg sm:text-xl line-through text-gray-500 dark:text-slate-400">{currencySymbol}{convertedFinalPrice.toFixed(2)}</span>
                <Badge className="bg-red-500 text-white text-sm font-semibold px-3 py-1">
                  {t('common.save')} {currencySymbol}{convertPrice(finalPrice * (product.discount / 100)).toFixed(2)}
                </Badge>
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('product.description')}</h2>
            <p className="text-gray-600 dark:text-slate-300 text-base leading-relaxed">{product.description}</p>
          </div>

          {/* Size Selector */}
          {allSizes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('product.size')}</h3>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Select product size">
                {allSizes.map((size) => {
                  // Check if a variant exists with the current size and selected color, and is in stock
                  const hasStock = product.variants.some((v) => 
                    v.size === size && (selectedColor === '' || v.color === selectedColor) && v.stock > 0
                  );
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-3 border-2 rounded-xl text-base font-semibold transition-all duration-200 min-w-[60px] ${
                        selectedSize === size
                          ? 'border-2 border-green-500 bg-green-500 text-white shadow-lg ring-2 ring-green-500/30 font-bold'
                          : hasStock
                          ? 'border-gray-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 text-gray-700 dark:text-white hover:text-primary'
                          : 'border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 opacity-50 cursor-not-allowed'
                      }`}
                      disabled={!hasStock && selectedSize !== size}
                      aria-pressed={selectedSize === size}
                      aria-label={`Size ${size}${!hasStock ? ' (out of stock)' : ''}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {allColors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('product.color')}</h3>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Select product color">
                {allColors.map((color) => {
                  // Check if a variant exists with the current color and selected size, and is in stock
                  const hasStock = product.variants.some((v) => 
                    v.color === color && (selectedSize === '' || v.size === selectedSize) && v.stock > 0
                  );
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-3 border-2 rounded-xl flex items-center gap-3 text-base font-semibold transition-all duration-200 ${
                        selectedColor === color
                          ? 'border-2 border-green-500 bg-green-500 text-white shadow-lg ring-2 ring-green-500/30 font-bold'
                          : hasStock
                          ? 'border-gray-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 text-gray-700 dark:text-white hover:text-primary'
                          : 'border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 opacity-50 cursor-not-allowed'
                      }`}
                      disabled={!hasStock && selectedColor !== color}
                      aria-pressed={selectedColor === color}
                      aria-label={`Color ${color}${!hasStock ? ' (out of stock)' : ''}`}
                    >
                      <span className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-sm" style={{ backgroundColor: color.toLowerCase() }} aria-hidden="true"></span>
                      {color} {hasStock ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear Selection Button */}
          {(selectedSize || selectedColor) && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedSize('');
                  setSelectedColor('');
                }}
                className="border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary text-sm sm:text-base"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          )}

          {/* Stock Info */}
          <Card className="rounded-lg shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                {isVariantSelected ? (
                  isInStock ? (
                    <>
                      <Check className="text-green-500 h-5 w-5" />
                      <span className="text-green-600 dark:text-green-400 font-medium text-sm sm:text-base">{t('product.inStock')}</span>
                    </>
                  ) : (
                    <>
                      <X className="text-red-500 h-5 w-5" />
                      <span className="text-red-600 dark:text-red-400 font-medium text-sm sm:text-base">{t('product.outOfStock')}</span>
                    </>
                  )
                ) : (
                  <span className="text-muted-foreground text-sm sm:text-base">{t('product.selectSizeAndColor')}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3 sm:space-y-4">
            {isAdmin ? (
              // Admin Actions
              <Button
                onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                className="w-full py-4 sm:py-6 text-base sm:text-lg font-bold rounded-md bg-blue-500 hover:bg-blue-600 text-white border border-blue-400 hover:border-blue-500"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Product
              </Button>
            ) : (
              // Customer Actions
              <>
                <Button
                  onClick={handleAddToCart}
                  disabled={!isVariantSelected || !isInStock}
                  className="w-full py-4 sm:py-6 text-lg font-bold disabled:opacity-50 rounded-xl bg-white hover:bg-gray-50 dark:hover:bg-slate-100 text-black border-2 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {!isVariantSelected ? t('product.chooseVariant') : !isInStock ? t('product.outOfStock') : t('product.addToCart')}
                </Button>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-2 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 rounded-xl cursor-not-allowed opacity-60 hover:bg-gray-50 dark:hover:bg-slate-800"
                    disabled
                    title="Stay tuned, wishlist coming soon!"
                  >
                    <Heart className="h-4 w-4" />
                    {t('nav.wishlist')}
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 border-2 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-primary hover:text-primary transition-all duration-200">
                    <Share2 className="h-4 w-4" />
                    {t('common.share')}
                  </Button>
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Features</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Handcrafted</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Premium Leather</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">30-Day Returns</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Free Shipping</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Reviews Section */}
          <div className="space-y-4 sm:space-y-6">
            <ProductReviews 
              productId={product.id}
              productName={product.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;