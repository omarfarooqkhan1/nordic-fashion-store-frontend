import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

const Cart = () => {
  const { t } = useLanguage();
  const { items, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();

  const handleCheckout = () => {
    alert('Checkout functionality would be implemented here!');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-leather-900 dark:text-leather-100">
            Your Cart
          </h1>
          <div className="max-w-md mx-auto space-y-4">
            <div className="aspect-square bg-leather-200 dark:bg-leather-700 rounded-lg flex items-center justify-center">
              <span className="text-6xl">🛒</span>
            </div>
            <p className="text-xl text-muted-foreground">Your cart is empty</p>
            <Button 
              onClick={() => window.location.href = '/products'}
              className="bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-leather-900 dark:text-leather-100 mb-8">
        Your Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.product.id}-${item.size}-${item.color}`} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-leather-200 dark:bg-leather-700 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{item.product.category}</p>
                        {item.size && (
                          <Badge variant="outline" className="mt-1">
                            Size: {item.size}
                          </Badge>
                        )}
                        {item.color && (
                          <Badge variant="outline" className="mt-1 ml-2">
                            Color: {item.color}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gold-500">
                          €{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          €{item.product.price} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="outline" 
              onClick={clearCart}
              className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Clear Cart
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/products'}
            >
              Continue Shopping
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border sticky top-4">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">€{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">€9.99</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">€{(getCartTotal() * 0.25).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-gold-500">
                    €{(getCartTotal() + 9.99 + (getCartTotal() * 0.25)).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Free shipping on orders over €100</p>
                <p>• 30-day return policy</p>
                <p>• Secure payment processing</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;