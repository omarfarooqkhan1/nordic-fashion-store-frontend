import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import PriceDisplay from './PriceDisplay';

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  onCheckout?: () => void;
  checkoutText?: string;
  checkoutDisabled?: boolean;
  showCheckoutButton?: boolean;
  features?: string[];
  className?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  shipping,
  tax,
  total,
  onCheckout,
  checkoutText,
  checkoutDisabled = false,
  showCheckoutButton = true,
  features = [
    'Free shipping on orders over €100',
    '30-day return policy',
    'Secure payment processing'
  ],
  className
}) => {
  const { t } = useLanguage();

  return (
    <Card className={`bg-card border-border rounded-lg shadow-md sticky top-4 ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl text-foreground">
          {t('cart.total') || 'Order Summary'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('cart.subtotal') || 'Subtotal'}
            </span>
            <span className="text-foreground">€{subtotal.toFixed(2)}</span>
          </div>
          
          {/* Shipping */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('cart.shipping') || 'Shipping'}
            </span>
            <span className="text-foreground">
              {shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}
            </span>
          </div>
          
          {/* Tax */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('cart.tax') || 'Tax (VAT 25%)'}
            </span>
            <span className="text-foreground">€{tax.toFixed(2)}</span>
          </div>
          
          <Separator className="my-4" />
          
          {/* Total */}
          <div className="flex justify-between font-semibold text-lg">
            <span className="text-foreground">
              {t('cart.total') || 'Total'}
            </span>
            <span className="text-gold-500">€{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        {showCheckoutButton && onCheckout && (
          <Button 
            className="w-full bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold rounded-md py-3 border border-gold-400 hover:border-gold-500"
            onClick={onCheckout}
            disabled={checkoutDisabled}
          >
            {checkoutText || t('cart.checkout') || 'Proceed to Checkout'}
          </Button>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="text-xs text-muted-foreground space-y-1">
            {features.map((feature, index) => (
              <p key={index}>• {feature}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
