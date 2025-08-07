import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { 
  Container, 
  LoadingState, 
  EmptyState, 
  CartItem, 
  OrderSummary 
} from '@/components/common';

const Cart = () => {
  const { t } = useLanguage();
  const { items, isLoading, updateQuantity, removeFromCart, clearCartItems, getCartTotal, getItemPrice } = useCart();
  
  // Debug logs
  console.log('Cart component - items:', items);
  console.log('Cart component - getCartTotal():', getCartTotal());
  
  // Handle checkout action
  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  // Display loading state
  if (isLoading) {
    return (
      <Container>
        <LoadingState />
      </Container>
    );
  }
  
  // Display message if cart is empty
  if (!items || items.length === 0) {
    return (
      <Container>
        <EmptyState
          icon="🛒"
          title={t('cart.title') || 'Your Cart'}
          description={t('cart.empty') || 'Your cart is empty'}
          actionButton={{
            text: t('cart.continue') || 'Continue Shopping',
            onClick: () => window.location.href = '/products'
          }}
        />
      </Container>
    );
  }

  const subtotal = getCartTotal() ?? 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.25;
  const total = subtotal + shipping + tax;

  return (
    <Container>
      <h1 className="text-4xl font-bold text-leather-900 dark:text-leather-100 mb-8">
        {t('cart.title') || 'Shopping Cart'}
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={removeFromCart}
              getItemPrice={getItemPrice}
            />
          ))}

          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
            <Button 
              variant="outline" 
              onClick={clearCartItems}
              className="w-full sm:w-auto text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-md"
            >
              {t('cart.remove') || 'Remove All'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/products'}
              className="w-full sm:w-auto rounded-md"
            >
              {t('cart.continue') || 'Continue Shopping'}
            </Button>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-1">
          <OrderSummary
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
            onCheckout={handleCheckout}
            checkoutText={t('cart.checkout') || 'Proceed to Checkout'}
            features={[
              t('cart.freeShipping') || 'Free shipping on orders over €100',
              t('cart.returnPolicy') || '30-day return policy',
              t('cart.securePayment') || 'Secure payment processing'
            ]}
          />
        </div>
      </div>
    </Container>
  );
};

export default Cart;