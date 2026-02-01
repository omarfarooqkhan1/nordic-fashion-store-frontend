import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import { Trash2 } from 'lucide-react';
import { 
  Container, 
  LoadingState, 
  EmptyState, 
  CartItem, 
  OrderSummary 
} from '@/components/common';
import { getFullImageUrl, handleImageError } from '@/utils/imageUtils';

const Cart = () => {
  const { t } = useLanguage();
  const { currency, convertPrice, getCurrencySymbol } = useCurrency();
  const { items, customItems, isLoading, updateQuantity, updateCustomJacketQuantity, removeFromCart, removeCustomJacketFromCart, clearCartItems, getCartTotal, getItemPrice } = useCart();
  
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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
  
  // Display message if cart is empty (both regular and custom items)
  if ((!items || items.length === 0) && (!customItems || customItems.length === 0)) {
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

  const subtotal = convertPrice(getCartTotal() ?? 0);
  const shipping = subtotal > convertPrice(100) ? 0 : convertPrice(9.99);
  const tax = subtotal * 0.25;
  const total = subtotal + shipping + tax;

  return (
    <Container>
      <h1 className="text-2xl sm:text-4xl font-bold text-leather-900 dark:text-leather-100 mb-4 sm:mb-8">
        {t('cart.title') || 'Shopping Cart'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Regular Product Items */}
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={removeFromCart}
              getItemPrice={getItemPrice}
            />
          ))}
          
          {/* Custom Jacket Items */}
          {customItems && customItems.map((customItem) => (
            <div key={customItem.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Custom Jacket Images */}
                <div className="flex gap-2 sm:gap-4 w-full sm:w-1/3">
                  <div className="flex-1">
                    <img 
                      src={getFullImageUrl(customItem.frontImageUrl)} 
                      alt="Front View" 
                      className="w-full h-20 sm:h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      onError={(e) => handleImageError(e, 'Front View')}
                    />
                    <p className="text-xs text-gray-500 text-center mt-1">Front</p>
                  </div>
                  <div className="flex-1">
                    <img 
                      src={getFullImageUrl(customItem.backImageUrl)} 
                      alt="Back View" 
                      className="w-full h-20 sm:h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      onError={(e) => handleImageError(e, 'Back View')}
                    />
                    <p className="text-xs text-gray-500 text-center mt-1">Back</p>
                  </div>
                </div>
                
                {/* Custom Jacket Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {customItem.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Custom Design - {customItem.color} • Size: {customItem.size}
                    </p>
                    {customItem.customDescription && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {customItem.customDescription}
                      </p>
                    )}
                  </div>
                  
                  {/* Logo Count */}
                  {customItem.logos && customItem.logos.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {customItem.logos.length} logo{customItem.logos.length !== 1 ? 's' : ''} placed
                    </div>
                  )}
                  
                  {/* Quantity Controls and Price */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const currentQuantity = customItem.quantity || 1;
                            if (currentQuantity > 1) {
                              await updateCustomJacketQuantity(customItem.id, currentQuantity - 1);
                            }
                          } catch (error) {
                            throw error;
                          }
                        }}
                        className="w-8 h-8 p-0"
                        disabled={(customItem.quantity || 1) <= 1}
                      >
                        -
                      </Button>
                      <span className="text-sm font-medium min-w-[2rem] text-center">
                        {customItem.quantity || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const currentQuantity = customItem.quantity || 1;
                            await updateCustomJacketQuantity(customItem.id, currentQuantity + 1);
                          } catch (error) {
                            throw error;
                          }
                        }}
                        className="w-8 h-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                    
                    {/* Price */}
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {getCurrencySymbol()}{(convertPrice(Number(customItem.price) || 0) * (customItem.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await removeCustomJacketFromCart(customItem.id);
                        } catch (error) {
                        }
                      }}
                      disabled={false}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 p-2 rounded-full"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={clearCartItems}
              className="w-full sm:w-auto text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-md"
            >
              {t('cart.remove') || 'Remove All Items'}
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
              `Free shipping on orders over ${getCurrencySymbol()}${convertPrice(100).toFixed(0)}`,
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