import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '../api/products';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, ShoppingCart, Edit, Star, ArrowLeft, Check, X } from 'lucide-react';
import { Product, Variant } from '@/types/Product';
import { useToast } from '@/hooks/use-toast';
import ProductImage from '@/components/ui/ProductImage';
import { LoadingState, ErrorState } from '@/components/common';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { user } = useAuth(); // Add auth context
  const { toast } = useToast(); // Initialize useToast at the top level

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
  });

  // Ensure currentImageIndex is within bounds if variantImages change
  React.useEffect(() => {
    if (product && product.variants.length > 0) {
      const variant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
      const variantImages = variant?.images.length ? variant.images : product.images;
      if (currentImageIndex >= variantImages.length) {
        setCurrentImageIndex(0);
      }
    }
  }, [product, selectedSize, selectedColor, currentImageIndex]);

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
  const variantImages = variant?.images.length ? variant.images : product.images;

  const basePrice = parseFloat(product.price);
  const finalPrice = variant ? variant.actual_price : basePrice;
  const discountedPrice = product.discount
    ? (finalPrice * (1 - product.discount / 100)).toFixed(2) // Format to 2 decimal places
    : finalPrice.toFixed(2); // Format to 2 decimal places

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
      console.error("Failed to add to cart:", error);
      toast({ title: t('toast.error'), description: t('toast.cartError'), variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/products')} className="mb-6 hover:bg-accent">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.back')} {t('nav.products')}
      </Button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden shadow-lg relative bg-muted flex items-center justify-center">
            {product.discount && (
              <Badge className="absolute top-4 right-4 z-10 bg-red-500 text-white">
                -{product.discount}%
              </Badge>
            )}
            {variantImages.length > 0 ? (
              <ProductImage
                src={variantImages[currentImageIndex]?.url}
                alt={variantImages[currentImageIndex]?.alt_text || 'Product Image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <ProductImage
                src=""
                alt="No product image available"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {variantImages.length > 1 && (
            <div className="flex gap-2 justify-center"> {/* Added justify-center for better layout */}
              {variantImages.map((img, i) => (
                <button
                  key={img.id || i} // Use image ID if available, fallback to index
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    i === currentImageIndex ? 'border-primary' : 'border-transparent hover:border-primary/50'
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground capitalize">{product.category.name}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">€{discountedPrice}</span>
            {product.discount && (
              <>
                <span className="text-xl line-through text-muted-foreground">€{finalPrice.toFixed(2)}</span>
                <Badge className="bg-red-500 text-white">
                  {t('common.save')} €{Math.round(finalPrice * (product.discount / 100)).toFixed(2)}
                </Badge>
              </>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">{t('product.description')}</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Size Selector */}
          {allSizes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('product.size')}</h3>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => {
                  // Check if a variant exists with the current size and selected color, and is in stock
                  const hasStock = product.variants.some((v) => 
                    v.size === size && (selectedColor === '' || v.color === selectedColor) && v.stock > 0
                  );
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg ${
                        selectedSize === size
                          ? 'border-primary bg-primary/10 text-primary'
                          : hasStock
                          ? 'border-border hover:border-primary/50'
                          : 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
                      }`}
                      disabled={!hasStock && selectedSize !== size} // Disable if out of stock AND not currently selected
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
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('product.color')}</h3>
              <div className="flex flex-wrap gap-2">
                {allColors.map((color) => {
                  // Check if a variant exists with the current color and selected size, and is in stock
                  const hasStock = product.variants.some((v) => 
                    v.color === color && (selectedSize === '' || v.size === selectedSize) && v.stock > 0
                  );
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                        selectedColor === color
                          ? 'border-primary bg-primary/10 text-primary'
                          : hasStock
                          ? 'border-border hover:border-primary/50'
                          : 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
                      }`}
                      disabled={!hasStock && selectedColor !== color} // Disable if out of stock AND not currently selected
                    >
                      {color} {hasStock ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
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
                className="border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          )}

          {/* Stock Info */}
          <Card className="rounded-lg shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {isVariantSelected ? (
                  isInStock ? (
                    <>
                      <Check className="text-green-500 h-5 w-5" />
                      <span className="text-green-600 font-medium">{t('product.inStock')}</span>
                    </>
                  ) : (
                    <>
                      <X className="text-red-500 h-5 w-5" />
                      <span className="text-red-600 font-medium">{t('product.outOfStock')}</span>
                    </>
                  )
                ) : (
                  <span className="text-muted-foreground">{t('product.selectSizeAndColor')}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            {isAdmin ? (
              // Admin Actions
              <Button
                onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                className="w-full py-6 text-lg font-bold rounded-md bg-blue-500 hover:bg-blue-600 text-white border border-blue-400 hover:border-blue-500"
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
                  className="w-full py-6 text-lg font-bold disabled:opacity-50 rounded-md bg-gold-500 hover:bg-gold-600 text-leather-900 border border-gold-400 hover:border-gold-500"
                >
                  {!isVariantSelected ? t('product.chooseVariant') : !isInStock ? t('product.outOfStock') : t('product.addToCart')}
                </Button>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 gap-2 border-primary text-primary rounded-md">
                    <Heart className="h-4 w-4" />
                    {t('nav.wishlist')}
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 border-primary text-primary rounded-md">
                    <Share2 className="h-4 w-4" />
                    {t('common.share')}
                  </Button>
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Features</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Handcrafted
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Premium Leather
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> 30-Day Returns
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Free Shipping
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;