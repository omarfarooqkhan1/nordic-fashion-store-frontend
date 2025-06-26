import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext'; // Adjusted path to be relative
import { useCart } from '@/contexts/CartContext';     // Adjusted path to be relative
import { Minus, Plus, Trash2 } from 'lucide-react';

const Cart = () => {
  const { t } = useLanguage();
  // Destructure the `clearCartItems` function from the context, 
  // as defined in CartContext.tsx
  const { items, updateQuantity, removeFromCart, clearCartItems, getCartTotal } = useCart();

  // Handle checkout action - replaced alert() with console.log()
  const handleCheckout = () => {
    console.log('Checkout functionality would be implemented here!');
    // In a real application, this would typically navigate to a checkout page
    // or trigger a checkout process.
  };

  // Display message if cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-leather-900 dark:text-leather-100">
            {t('Your Cart')} {/* Using translation function */}
          </h1>
          <div className="max-w-md mx-auto space-y-4">
            <div className="aspect-square bg-leather-200 dark:bg-leather-700 rounded-lg flex items-center justify-center">
              <span className="text-6xl">🛒</span>
            </div>
            <p className="text-xl text-muted-foreground">{t('Your cart is empty')}</p> {/* Using translation function */}
            <Button 
              onClick={() => window.location.href = '/products'}
              className="bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold"
            >
              {t('Continue Shopping')} {/* Using translation function */}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-leather-900 dark:text-leather-100 mb-8">
        {t('Your Cart')} {/* Using translation function */}
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            // Use item.id as the key, as it's the unique ID for each cart item
            <Card key={item.id} className="bg-card border-border rounded-lg shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  {/* Placeholder for product image. 
                      You would replace this with actual image display if your backend 
                      provided image URLs through product_variant.product.images.
                  */}
                  <div className="w-24 h-24 bg-leather-200 dark:bg-leather-700 rounded-lg flex-shrink-0 overflow-hidden">
                    <img 
                      src={`https://placehold.co/96x96/EFEFEF/AAAAAA?text=Product`} 
                      alt={item.variant.product.name} 
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96/EFEFEF/AAAAAA?text=No+Image'; }}
                    />
                  </div>
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex justify-between items-start w-full">
                      <div className="flex-grow">
                        {/* Access product name and category from item.variant.product */}
                        <h3 className="font-semibold text-lg text-foreground">{item.variant.product.name}</h3>
                        {/* Display size and color from item.variant */}
                        {item.variant.size && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {t('Size')}: {item.variant.size}
                          </Badge>
                        )}
                        {item.variant.color && (
                          <Badge variant="outline" className="mt-2 ml-2 text-xs">
                            {t('Color')}: {item.variant.color}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        // Pass item.id to removeFromCart, as that's what the API expects
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 p-2 rounded-full"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          // Pass item.id to updateQuantity
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0 rounded-md"
                          disabled={item.quantity <= 1} // Disable if quantity is 1 to prevent going below 1
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-base font-medium w-8 text-center text-foreground">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          // Pass item.id to updateQuantity
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0 rounded-md"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        {/* Access price from item.variant.actual_price */}
                        <p className="font-semibold text-lg text-gold-500">
                          €{(item.variant.actual_price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          €{item.variant.actual_price.toFixed(2)} {t('each')} {/* Using translation function */}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
            <Button 
              variant="outline" 
              // Use clearCartItems from context
              onClick={clearCartItems}
              className="w-full sm:w-auto text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-md"
            >
              {t('Clear Cart')} {/* Using translation function */}
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/products'}
              className="w-full sm:w-auto rounded-md"
            >
              {t('Continue Shopping')} {/* Using translation function */}
            </Button>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border rounded-lg shadow-md sticky top-4">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">{t('Order Summary')}</CardTitle> {/* Using translation function */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('Subtotal')}</span> {/* Using translation function */}
                  <span className="text-foreground">€{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('Shipping')}</span> {/* Using translation function */}
                  <span className="text-foreground">€9.99</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('Tax')}</span> {/* Using translation function */}
                  <span className="text-foreground">€{(getCartTotal() * 0.25).toFixed(2)}</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-foreground">{t('Total')}</span> {/* Using translation function */}
                  <span className="text-gold-500">
                    €{(getCartTotal() + 9.99 + (getCartTotal() * 0.25)).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold rounded-md py-3"
                onClick={handleCheckout}
              >
                {t('Proceed to Checkout')} {/* Using translation function */}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• {t('Free shipping on orders over €100')}</p> {/* Using translation function */}
                <p>• {t('30-day return policy')}</p> {/* Using translation function */}
                <p>• {t('Secure payment processing')}</p> {/* Using translation function */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;