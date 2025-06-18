import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { mockProducts } from '@/lib/mockData';
import { ArrowLeft, Heart, Share2, Check, X } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  
  const product = mockProducts.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
        <Button onClick={() => navigate('/products')} variant="outline">
          Back to Products
        </Button>
      </div>
    );
  }

  // Mock variant availability - in real app this would come from backend
  const getVariantAvailability = (size: string, color: string) => {
    // Simulate some variants being out of stock based on deterministic logic
    if (size === 'XS' && color === 'Black') return false;
    if (size === 'XXL' && color === 'Brown') return false;
    if (size === 'S' && color === 'Red') return false;
    // Use a simple hash to make availability deterministic but varied
    const hash = (size + color).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash) % 10 !== 0; // 90% chance of being in stock, but consistent
  };

  const handleAddToCart = () => {
    if (product.sizes.length > 1 && !selectedSize) {
      alert('Please select a size');
      return;
    }
    if (product.colors.length > 1 && !selectedColor) {
      alert('Please select a color');
      return;
    }

    const size = product.sizes.length === 1 ? product.sizes[0] : selectedSize;
    const color = product.colors.length === 1 ? product.colors[0] : selectedColor;

    if (!getVariantAvailability(size, color)) {
      alert('This variant is currently out of stock');
      return;
    }

    addToCart(product, 1, size, color);
  };

  const isVariantSelected = () => {
    if (product.sizes.length > 1 && !selectedSize) return false;
    if (product.colors.length > 1 && !selectedColor) return false;
    return true;
  };

  const isVariantInStock = () => {
    const size = product.sizes.length === 1 ? product.sizes[0] : selectedSize;
    const color = product.colors.length === 1 ? product.colors[0] : selectedColor;
    return getVariantAvailability(size, color);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/products')}
        className="mb-6 hover:bg-accent transition-all duration-300"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden relative shadow-lg">
            {product.isNew && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground z-10">
                New
              </Badge>
            )}
            {product.discount && (
              <Badge className="absolute top-4 right-4 bg-red-500 text-white z-10">
                -{product.discount}%
              </Badge>
            )}
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[currentImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                  if (!e.currentTarget.parentElement?.querySelector('.placeholder-content')) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'placeholder-content text-6xl text-muted-foreground';
                    placeholder.textContent = '📷';
                    e.currentTarget.parentElement?.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl text-muted-foreground">📷</span>
              </div>
            )}
          </div>
          
          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index 
                      ? 'border-primary' 
                      : 'border-transparent hover:border-primary/50'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
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
            <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
            <p className="text-lg text-muted-foreground capitalize">{product.category}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            {product.discount ? (
              <>
                <span className="text-3xl font-bold text-primary">
                  €{Math.round(product.price * (1 - product.discount / 100))}
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  €{product.price}
                </span>
                <Badge className="bg-red-500 text-white">
                  Save €{Math.round(product.price * (product.discount / 100))}
                </Badge>
              </>
            ) : (
              <span className="text-3xl font-bold text-primary">
                €{product.price}
              </span>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Size Selection */}
          {product.sizes.length > 1 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const sizeInStock = selectedColor ? getVariantAvailability(size, selectedColor) : true;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!sizeInStock}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedSize === size
                          ? 'border-primary bg-primary/10 text-primary'
                          : sizeInStock
                          ? 'border-border hover:border-primary/50 text-foreground'
                          : 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span>{size}</span>
                      {!sizeInStock && <X className="inline ml-1 h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors.length > 1 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const colorInStock = selectedSize ? getVariantAvailability(selectedSize, color) : true;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      disabled={!colorInStock}
                      className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
                        selectedColor === color
                          ? 'border-primary bg-primary/10 text-primary'
                          : colorInStock
                          ? 'border-border hover:border-primary/50 text-foreground'
                          : 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span>{color}</span>
                      {colorInStock ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Availability Status */}
          <Card className="bg-card border-border shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {isVariantSelected() && isVariantInStock() ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">In Stock</span>
                  </>
                ) : isVariantSelected() && !isVariantInStock() ? (
                  <>
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-red-600 dark:text-red-400 font-medium">Out of Stock</span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground">Select variant to check availability</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={handleAddToCart}
              disabled={!isVariantSelected() || !isVariantInStock()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-6"
              size="lg"
            >
              {!isVariantSelected() ? 'Select Options' : !isVariantInStock() ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            
            <div className="flex gap-4">
               <Button variant="outline" className="flex-1 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Heart className="h-4 w-4" />
                Add to Wishlist
              </Button>
              <Button variant="outline" className="flex-1 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Product Features */}
          <Separator />
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Features</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Handcrafted</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Premium Leather</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Free Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;