import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '../api/products';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, ShoppingCart, Edit, Star, ArrowLeft, ArrowRight, Check, X, Ruler, Play } from 'lucide-react';
import { Product, Variant } from '@/types/Product';
import { useToast } from '@/hooks/use-toast';
import ProductImage from '@/components/ui/ProductImage';
import MediaPreviewModal from '@/components/MediaPreviewModal';
import MediaThumbnail from '@/components/MediaThumbnail';
import { LoadingState, ErrorState } from '@/components/common';
import { ProductReviews } from '@/components/reviews';
import { StarRating } from '@/components/ui/StarRating';
import { SizeGuideModal } from '@/components/ui/SizeGuideModal';
import { SimilarProducts } from '@/components/products/SimilarProducts';

const ProductDetail = () => {
  // All state declarations must come first
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewSummary, setReviewSummary] = useState<{ average_rating: number; review_count: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Then all context hooks
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { convertPrice, getCurrencySymbol } = useCurrency();

  const isAdmin = user?.role === 'admin';

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // All useEffect hooks must come before any conditional returns
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: product, isLoading, isError, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('No product ID provided');
      const data = await fetchProductById(id);
      
      // Deep clone the data to ensure we're not dealing with any proxy issues
      const clonedData = JSON.parse(JSON.stringify(data));
      
      // Ensure variants is always an array
      if (!clonedData.variants) {
        clonedData.variants = [];
      } else if (!Array.isArray(clonedData.variants)) {
        clonedData.variants = Array.isArray(clonedData.variants) ? clonedData.variants : [];
      }
      
      return clonedData;
    },
    enabled: !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Initialize with first variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      if (firstVariant) {
        setSelectedSize(firstVariant.size || '');
        setSelectedColor(firstVariant.color || '');
      }
    }
  }, [product]); // Only depend on product changes

  // Get selected variant
  const getSelectedVariant = () => {
    // Check if product exists and has variants array
    if (!product || !product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
      return undefined;
    }
    
    // If both size and color are selected, find exact match
    if (selectedSize && selectedColor) {
      const variant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
      return variant;
    }
    
    // If only color is selected, find by color
    if (selectedColor) {
      const variant = product.variants.find((v) => v.color === selectedColor);
      return variant;
    }
    
    // If only size is selected, find by size
    if (selectedSize) {
      const variant = product.variants.find((v) => v.size === selectedSize);
      return variant;
    }
    
    // Always return the first variant as default if no selection is made and variants exist
    if (product.variants.length > 0) {
      const firstVariant = product.variants[0];
      return firstVariant;
    }
    
    // No variants available
    return undefined;
  };

  const selectedVariant = getSelectedVariant();
  
  // Check if product has variants
  const hasVariants = product?.variants && Array.isArray(product.variants) && product.variants.length > 0;
  
  // Robust, scalable image selection logic with better fallbacks
  // Main images: Try selected variant -> any variant with images -> product images -> empty
  const displayImages = (() => {
    // If we have a selected variant with images, use those
    if (hasVariants && selectedVariant && selectedVariant.main_images && selectedVariant.main_images.length > 0) {
      return selectedVariant.main_images;
    }
    
    // If selected variant has no images, try to find any variant with images
    if (hasVariants && product?.variants && Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        if (variant.main_images && variant.main_images.length > 0) {
          return variant.main_images;
        }
      }
    }
    
    // Fallback to product-level images
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    
    // No images available
    return [];
  })();

  // Detailed images: Try selected variant -> any variant with images -> product detailed images -> empty
  const detailedImages = (() => {
    // If we have a selected variant with detailed images, use those
    if (hasVariants && selectedVariant && selectedVariant.detailed_images && selectedVariant.detailed_images.length > 0) {
      return selectedVariant.detailed_images;
    }
    
    // If selected variant has no detailed images, try to find any variant with detailed images
    if (hasVariants && product?.variants && Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        if (variant.detailed_images && variant.detailed_images.length > 0) {
          return variant.detailed_images;
        }
      }
    }
    
    // Fallback to product-level detailed images
    if (product?.detailed_images && product.detailed_images.length > 0) {
      return product.detailed_images;
    }
    
    // No detailed images available
    return [];
  })();

  // Mobile detailed images: Try selected variant -> any variant with images -> product mobile detailed images -> empty
  const mobileDetailedImages = (() => {
    // If we have a selected variant with mobile detailed images, use those
    if (hasVariants && selectedVariant && selectedVariant.mobile_detailed_images && selectedVariant.mobile_detailed_images.length > 0) {
      return selectedVariant.mobile_detailed_images;
    }
    
    // If selected variant has no mobile detailed images, try to find any variant with mobile detailed images
    if (hasVariants && product?.variants && Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        if (variant.mobile_detailed_images && variant.mobile_detailed_images.length > 0) {
          return variant.mobile_detailed_images;
        }
      }
    }
    
    // Fallback to product-level mobile detailed images
    if (product?.mobile_detailed_images && product.mobile_detailed_images.length > 0) {
      return product.mobile_detailed_images;
    }
    
    // No mobile detailed images available
    return [];
  })();

  // Styling images: Try selected variant -> any variant with images -> empty
  const stylingImages = (() => {
    // If we have a selected variant with styling images, use those
    if (hasVariants && selectedVariant && selectedVariant.styling_images && selectedVariant.styling_images.length > 0) {
      return selectedVariant.styling_images;
    }
    
    // If selected variant has no styling images, try to find any variant with styling images
    if (hasVariants && product?.variants && Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        if (variant.styling_images && variant.styling_images.length > 0) {
          return variant.styling_images;
        }
      }
    }
    
    // No styling images available
    return [];
  })();

  // Check if we're showing images from a different variant than selected
  const isShowingFallbackImages = (() => {
    if (!hasVariants || !selectedVariant) return false;
    
    // Check if selected variant has its own images
    const selectedHasImages = selectedVariant.main_images && selectedVariant.main_images.length > 0;
    
    // If selected variant has images and we're showing them, not a fallback
    if (selectedHasImages && displayImages === selectedVariant.main_images) {
      return false;
    }
    
    // If selected variant has no images but we're showing images, it's a fallback
    if (!selectedHasImages && displayImages.length > 0) {
      return true;
    }
    
    return false;
  })();

  // Support both video_path and video_url for compatibility
  // @ts-expect-error: video_url may exist in backend data
  const videoUrl = hasVariants && selectedVariant ? (selectedVariant?.video_url || selectedVariant?.video_path) : undefined;

  // Carousel navigation state for styling section
  const stylingMedia = videoUrl
    ? [ { type: 'video', url: videoUrl, alt_text: '' }, ...stylingImages.map(img => ({ type: 'image', ...img })) ]
    : stylingImages.map(img => ({ type: 'image', ...img }));
  const [stylingIndex, setStylingIndex] = useState(0);
  const handlePrevStyling = () => setStylingIndex(i => (i === 0 ? stylingMedia.length - 1 : i - 1));
  const handleNextStyling = () => setStylingIndex(i => (i === stylingMedia.length - 1 ? 0 : i + 1));

  // Ensure currentImageIndex is within bounds if display images change
  useEffect(() => {
    if (displayImages && currentImageIndex >= displayImages.length) {
      setCurrentImageIndex(0);
    }
  }, [displayImages, currentImageIndex]);

  // Preload main variant image for better LCP
  useEffect(() => {
    if (displayImages && displayImages.length > 0) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = displayImages[0].url;
      document.head.appendChild(link);
    }
  }, [displayImages]);
  
  // Fetch review summary on mount
  useEffect(() => {
    if (!product?.id) {
      setReviewSummary(null);
      return;
    }
    
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

  // Reset image index when color changes to ensure smooth transitions
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  // Reset image index when display images change (variant switch) and current index is out of bounds
  useEffect(() => {
    if (displayImages.length > 0 && currentImageIndex >= displayImages.length) {
      setCurrentImageIndex(0);
    }
  }, [displayImages.length, currentImageIndex]);

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



  const allSizes = hasVariants && Array.isArray(product.variants) 
    ? Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[]
    : [];
  const allColors = hasVariants && Array.isArray(product.variants)
    ? Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[]
    : [];
  
  const variant = selectedVariant;
  const isVariantSelected = !!variant;
  
  // Determine if main media is video or image
  const mainMedia = displayImages && displayImages.length > 0 ? displayImages[currentImageIndex] : null;

  // Use the selected variant's price, fallback to first variant's price, then to 0
  // For products without variants, we would need to get price from the product itself (not implemented in current backend)
  const finalPrice = hasVariants 
    ? (variant ? variant.price : (product?.variants?.length > 0 ? product.variants[0].price : 0))
    : 0; // For products without variants, price should come from product, but it's not in the current schema
  const discountedPrice = product?.discount && finalPrice
    ? (finalPrice * (1 - (product.discount / 100)))
    : finalPrice;
  
  // Convert prices using currency context
  const convertedFinalPrice = convertPrice(finalPrice);
  const convertedDiscountedPrice = convertPrice(discountedPrice);
  const currencySymbol = getCurrencySymbol();

  const handleAddToCart = async () => { // Made async to await addToCart
    // For products without variants, we can't add to cart (this would need backend changes)
    if (!hasVariants) {
      toast({ 
        title: t('product.cannotAddToCart'), 
        description: t('product.noVariantsAvailable'), 
        variant: 'destructive' 
      });
      return;
    }
    
    if (!variant) {
      toast({ 
        title: t('product.chooseVariant'), 
        description: t('product.selectSizeAndColor'), 
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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
        {/* Image Gallery - Responsive layout for mobile and desktop */}
        <div className="space-y-4 sm:space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/products')} 
            className="mb-2 sm:mb-4 hover:bg-accent text-sm sm:text-base transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          <div className="flex flex-col items-center space-y-4">
            {displayImages && displayImages.length > 0 ? (
              <>
                {/* Fallback image indicator */}
                {isShowingFallbackImages && (
                  <div className="w-full max-w-md mx-auto mb-2">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 text-center">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        📷 Showing available product images
                      </p>
                    </div>
                  </div>
                )}
                <div className="h-[60vh] sm:h-[70vh] md:h-[80vh] rounded-xl overflow-hidden relative bg-white flex items-center justify-center border border-gray-200 dark:border-slate-600 cursor-pointer max-w-full"
                  onClick={() => setShowMediaModal(true)}
                  role="button"
                  tabIndex={0}
                  aria-label="Open image in full view"
                >
                  <ProductImage
                    src={displayImages[currentImageIndex]?.url}
                    alt={displayImages[currentImageIndex]?.alt_text || `${product?.name || 'Product'} image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  
                  {/* Left/Right Navigation Buttons */}
                  {displayImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1);
                        }}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 shadow-lg hover:shadow-xl transition-all duration-200 z-10 group"
                        aria-label="Previous image"
                      >
                        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-white group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(prev => prev === displayImages.length - 1 ? 0 : prev + 1);
                        }}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 shadow-lg hover:shadow-xl transition-all duration-200 z-10 group"
                        aria-label="Next image"
                      >
                        <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-white group-hover:scale-110 transition-transform" />
                      </button>
                    </>
                  )}
                </div>
                {/* Modal for main image full view */}
                {showMediaModal && displayImages[currentImageIndex] && (
                  <MediaPreviewModal
                    open={showMediaModal}
                    onClose={() => setShowMediaModal(false)}
                    media={{
                      url: displayImages[currentImageIndex].url,
                      type: 'image',
                    }}
                  />
                )}
                {/* Thumbnails - Responsive grid for different screen sizes */}
                {displayImages.length > 1 && (
                  <div className="mt-2 sm:mt-4 w-full flex justify-center">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 max-w-2xl">
                      {displayImages.map((img, i) => (
                        <button
                          key={img.id || i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                            i === currentImageIndex
                              ? 'border-primary shadow-lg ring-2 ring-primary/20'
                              : 'border-gray-200 dark:border-slate-600 hover:border-primary/50 shadow-md hover:shadow-lg'
                          }`}
                          aria-label={`View image ${i + 1}`}
                        >
                          <ProductImage
                            src={img.url}
                            alt={img.alt_text || `${product?.name || 'Product'} thumbnail ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-[60vh] sm:h-[70vh] md:h-[80vh] rounded-xl overflow-hidden relative bg-white flex items-center justify-center border border-gray-200 dark:border-slate-600">
                <span className="text-gray-400">{t('product.noImage')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info - Responsive layout */}
        <div className="space-y-5 sm:space-y-6 md:space-y-8">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold break-words text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            <p className="text-gray-600 dark:text-slate-300 capitalize text-sm sm:text-base md:text-lg font-medium">
              {product.category?.name || ''}
            </p>
            {/* Product Rating Display - Responsive - Clickable */}
            <div 
              className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                const reviewsSection = document.getElementById('reviews-section');
                if (reviewsSection) {
                  reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Scroll to reviews"
            >
              {reviewSummary && reviewSummary.review_count > 0 ? (
                <>
                  <StarRating rating={reviewSummary.average_rating} size="sm" />
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 underline">
                    {reviewSummary.average_rating.toFixed(1)} ({reviewSummary.review_count})
                  </span>
                </>
              ) : (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                  {t('product.noReviews')}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {currencySymbol}{convertedDiscountedPrice.toFixed(2)}
            </span>
          </div>

          <Separator />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {t('product.description')}
            </h2>
            <p className="text-gray-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {product?.description || ''}
            </p>
          </div>

          {/* Size Selector - Responsive */}
          {hasVariants && allSizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {t('product.size')}
                </h3>
                {/* Check if product has a size guide image */}
                {product?.size_guide_image && (
                  <SizeGuideModal 
                    sizeGuideImage={product.size_guide_image}
                    productName={product.name}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Select product size">
                {allSizes.map((size) => {
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 min-w-[50px] sm:min-w-[60px] ${
                        selectedSize === size
                          ? 'border-2 border-green-500 bg-green-500 text-white shadow-lg ring-2 ring-green-500/30 font-bold'
                          : 'border-gray-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 text-gray-700 dark:text-white hover:text-primary'
                      }`}
                      aria-pressed={selectedSize === size}
                      aria-label={`Size ${size}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selector - Responsive */}
          {hasVariants && allColors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {t('product.color')}
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Select product color">
                {allColors.map((color) => {
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-semibold transition-all duration-200 ${
                        selectedColor === color
                          ? 'border-2 border-green-500 bg-green-500 text-white shadow-lg ring-2 ring-green-500/30 font-bold'
                          : 'border-gray-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 text-gray-700 dark:text-white hover:text-primary'
                      }`}
                      aria-pressed={selectedColor === color}
                      aria-label={`Color ${color}`}
                    >
                      <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: color.toLowerCase() }} aria-hidden="true"></span>
                      <span className="hidden xs:inline">{color}</span>
                      <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear Selection Button - Responsive */}
          {hasVariants && (selectedSize || selectedColor) && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedSize('');
                  setSelectedColor('');
                }}
                className="border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary text-xs sm:text-sm"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t('common.clear')}
              </Button>
            </div>
          )}

          {/* Stock Info - Responsive */}
          <Card className="rounded-lg shadow-sm">
            <CardContent className="p-2 sm:p-3 md:p-4">
              <div className="flex items-center gap-2">
                {hasVariants ? (
                  isVariantSelected ? (
                    <>
                      <Check className="text-green-500 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-green-600 dark:text-green-400 font-medium text-xs sm:text-sm">
                        {t('product.inStock')}
                      </span>
                    </>
                  ) : selectedColor ? (
                    <>
                      <Check className="text-blue-500 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-blue-600 dark:text-blue-400 font-medium text-xs sm:text-sm">
                        {selectedColor} {t('product.available')} - {t('product.selectSize')}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      {t('product.selectSizeAndColor')}
                    </span>
                  )
                ) : (
                  // For products without variants, show generic in stock message
                  <div className="flex items-center gap-2">
                    <Check className="text-green-500 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-green-600 dark:text-green-400 font-medium text-xs sm:text-sm">
                      {t('product.inStock')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions - Responsive */}
          <div className="space-y-3 sm:space-y-4">
            {isAdmin ? (
              // Admin Actions
              <Button
                onClick={() => navigate(`/admin/products/${product?.id}/edit`)}
                className="w-full py-3 sm:py-4 md:py-5 text-base sm:text-lg font-bold rounded-md bg-blue-500 hover:bg-blue-600 text-white border border-blue-400 hover:border-blue-500"
              >
                <Edit className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {t('product.edit')}
              </Button>
            ) : (
              // Customer Actions
              <>
                <Button
                  onClick={handleAddToCart}
                  disabled={hasVariants && (!selectedSize || !selectedColor || !isVariantSelected)}
                  className="w-full py-3 sm:py-4 md:py-5 text-base sm:text-lg font-bold disabled:opacity-50 rounded-xl bg-white hover:bg-gray-50 dark:hover:bg-slate-100 text-black border-2 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {hasVariants ? (
                    (() => {
                      if (!selectedSize && !selectedColor) {
                        return allSizes.length > 0 && allColors.length > 0 
                          ? 'Select Size and Color' 
                          : allSizes.length > 0 
                            ? 'Select Size' 
                            : allColors.length > 0 
                              ? 'Select Color' 
                              : t('product.chooseVariant');
                      } else if (!selectedSize) {
                        return 'Select Size';
                      } else if (!selectedColor) {
                        return 'Select Color';
                      } else if (!isVariantSelected) {
                        return 'Select Size and Color';
                      } else {
                        return t('product.addToCart');
                      }
                    })()
                  ) : (
                    t('product.addToCart')
                  )}
                </Button>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-2 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 rounded-xl cursor-not-allowed opacity-60 hover:bg-gray-50 dark:hover:bg-slate-800"
                    disabled
                    title={t('product.wishlistComingSoon')}
                  >
                    <Heart className="h-4 w-4" />
                    {t('nav.wishlist')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 border-2 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-primary hover:text-primary transition-all duration-200"
                  >
                    <Share2 className="h-4 w-4" />
                    {t('common.share')}
                  </Button>
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {t('product.features')}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t('product.handcrafted')}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t('product.premiumLeather')}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t('product.returns')}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t('product.freeShipping')}
                </span>
              </div>
            </div>
          </div>

          <Separator />
        </div>
      </div>

      {/* Detailed Pictures Section (Variant-based) - Responsive */}
      {(detailedImages && detailedImages.length > 0) ? (
        <div className="w-full py-8 sm:py-12 lg:py-16 mt-8 sm:mt-12 md:mt-16">
          <div className="w-full px-0">
            <div className="space-y-8 sm:space-y-12">
              {/* Section Header - Responsive */}
              <div className="text-center space-y-3 sm:space-y-4 px-2 sm:px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                  {t('product.details')}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-slate-300 max-w-2xl sm:max-w-3xl mx-auto">
                  {t('product.detailsDescription').replace('{name}', product?.name || '')}
                </p>
              </div>
              {/* Detailed Images Gallery - Responsive layout */}
              {isMobile
                ? (mobileDetailedImages && mobileDetailedImages.length > 0 ? (
                    <div className="space-y-6 sm:space-y-8">
                      {mobileDetailedImages.map((image, index) => (
                        <div
                          key={`mobile-detail-${image.id || index}`}
                          className="w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-white dark:bg-slate-800 group relative shadow-lg rounded-xl"
                        >
                          <ProductImage
                            src={image.url}
                            alt={image.alt_text || `${product?.name || 'Product'} - Mobile Detail ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null)
                : (detailedImages && detailedImages.length > 0 ? (
                    <div className="space-y-6 sm:space-y-8">
                      {detailedImages.map((image, index) => (
                        <div
                          key={`desktop-detail-${image.id || index}`}
                          className="w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-white dark:bg-slate-800 group relative shadow-lg rounded-xl"
                        >
                          <ProductImage
                            src={image.url}
                            alt={image.alt_text || `${product?.name || 'Product'} - Detail ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null)
              }
            </div>
          </div>
        </div>
      ) : null}

      {/* How Others Are Styling This Section - Responsive */}
      {(stylingMedia && stylingMedia.length > 0) ? (
        <div className="w-full py-8 sm:py-12 lg:py-16 bg-gray-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="space-y-6 sm:space-y-8 md:space-y-12">
              {/* Section Header - Responsive */}
              <div className="text-center space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                  {t('product.stylingTitle')}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-slate-300 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
                  {t('product.stylingDescription').replace('{name}', product?.name || '')}
                </p>
              </div>
              {/* Mobile: Single item with arrows. Desktop: Horizontal scroll carousel. */}
              {isMobile ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-[88vw] max-w-[340px] sm:w-[32vw] sm:max-w-[340px] aspect-[4/5] flex items-center justify-center mx-auto rounded-2xl bg-white shadow-xl overflow-hidden">
                    {stylingMedia[stylingIndex].type === 'video' ? (
                      <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover rounded-xl"
                        preload="auto"
                      >
                        <source
                          src={
                            stylingMedia[stylingIndex].url.startsWith('http://') || stylingMedia[stylingIndex].url.startsWith('https://')
                              ? stylingMedia[stylingIndex].url
                              : `${import.meta.env.VITE_BACKEND_URL}${stylingMedia[stylingIndex].url.startsWith('/') ? stylingMedia[stylingIndex].url : `/${stylingMedia[stylingIndex].url}`}`
                          }
                          type="video/mp4"
                        />
                        {t('product.videoNotSupported')}
                      </video>
                    ) : (
                      <ProductImage
                        src={stylingMedia[stylingIndex].url}
                        alt={stylingMedia[stylingIndex].alt_text || `${product?.name || 'Product'} - Styling inspiration`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Overlay for info - Hidden on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-100 hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                        <p className="text-xs sm:text-sm font-medium mb-1">
                          {stylingMedia[stylingIndex].type === 'video' ? 'Product Video' : (stylingMedia[stylingIndex].alt_text || t('product.stylingInspiration'))}
                        </p>
                        {stylingMedia[stylingIndex].type !== 'video' && (
                          <p className="text-xs opacity-90">
                            {t('product.look')} {videoUrl ? stylingIndex : stylingIndex + 1}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Arrow Controls */}
                  <div className="flex flex-row items-center justify-center gap-6 mt-4">
                    <button
                      aria-label="Previous"
                      onClick={handlePrevStyling}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-slate-300">
                      {stylingIndex + 1} / {stylingMedia.length}
                    </span>
                    <button
                      aria-label="Next"
                      onClick={handleNextStyling}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`flex flex-row gap-6 sm:gap-8 md:gap-10 px-6 mx-auto ${stylingMedia.length <= 4 ? 'justify-center' : 'overflow-x-auto scrollbar-hide snap-x snap-mandatory'} ${stylingMedia.length <= 4 ? 'max-w-4xl' : ''}`}
                  style={stylingMedia.length <= 4 ? {} : { WebkitOverflowScrolling: 'touch', maxWidth: '99vw' }}
                >
                  {/* Video as first item if present */}
                  {videoUrl && (
                    <div className="min-w-[88vw] max-w-[340px] sm:min-w-[260px] sm:max-w-[340px] sm:w-[32vw] w-full flex-shrink-0 group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 snap-center">
                      <div className="aspect-[4/5] overflow-hidden flex items-center justify-center bg-black">
                        <video
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover rounded-xl"
                          preload="auto"
                        >
                          {/* Resolve video URL properly like images */}
                          <source
                            src={
                              videoUrl.startsWith('http://') || videoUrl.startsWith('https://')
                                ? videoUrl
                                : `${import.meta.env.VITE_BACKEND_URL}${videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`}`
                            }
                            type="video/mp4"
                          />
                          {t('product.videoNotSupported')}
                        </video>
                      </div>
                      {/* Overlay for video info - Hidden on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                          <p className="text-xs sm:text-sm font-medium mb-1">
                            Product Video
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Up to 3 styling images */}
                  {stylingImages.slice(0, 3).map((image, index) => (
                    <div
                      key={`styling-${image.id}`}
                      className="min-w-[88vw] max-w-[340px] sm:min-w-[260px] sm:max-w-[340px] sm:w-[32vw] w-full flex-shrink-0 group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 snap-center"
                    >
                      <div className="aspect-[4/5] overflow-hidden">
                        <ProductImage
                          src={image.url}
                          alt={image.alt_text || `${product?.name || 'Product'} - Styling inspiration ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      {/* Overlay with styling info - Hidden on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                          <p className="text-xs sm:text-sm font-medium mb-1">
                            {image.alt_text || t('product.stylingInspiration')}
                          </p>
                          <p className="text-xs opacity-90">
                            {t('product.look')} {index + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Similar Products Section */}
      {product?.similar_products && product.similar_products.length > 0 && (
        <div className="w-full mt-4 sm:mt-8 md:mt-12">
          <SimilarProducts products={product.similar_products} />
        </div>
      )}

      {/* Customer Reviews Section - Full Width */}
      <div id="reviews-section" className="w-full py-5 sm:py-12 lg:py-16 mt-4 sm:mt-8 md:mt-12">
        <div className="w-full px-0">
          <div className="space-y-5 sm:space-y-12">
            <ProductReviews
              productId={product?.id || 0}
              productName={product?.name || ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;