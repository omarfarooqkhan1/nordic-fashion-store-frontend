import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react';
import { getFullImageUrl, handleImageError } from '@/utils/imageUtils';

const CheckoutSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { convertPrice, getCurrencySymbol } = useCurrency();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  
  // Helper function to get currency symbol for any currency
  const getCurrencySymbolForCurrency = (currencyCode: string): string => {
    const symbols: Record<string, string> = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥', 'AUD': 'A$', 'CAD': 'C$', 'CHF': 'CHF',
      'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr', 'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft', 'ISK': 'kr',
      'HKD': 'HK$', 'SGD': 'S$', 'NZD': 'NZ$', 'KRW': '₩', 'TWD': 'NT$', 'THB': '฿', 'MYR': 'RM',
      'PHP': '₱', 'IDR': 'Rp', 'VND': '₫', 'INR': '₹', 'PKR': '₨', 'BDT': '৳', 'LKR': '₨',
      'MXN': '$', 'BRL': 'R$', 'ARS': '$', 'CLP': '$', 'COP': '$', 'PEN': 'S/', 'UYU': '$U',
      'AED': 'د.إ', 'SAR': '﷼', 'QAR': '﷼', 'KWD': 'د.ك', 'BHD': '.د.ب', 'OMR': '﷼', 'JOD': 'د.ا',
      'ILS': '₪', 'EGP': 'E£', 'ZAR': 'R', 'NGN': '₦', 'KES': 'KSh', 'GHS': '₵', 'TRY': '₺', 'RUB': '₽'
    };
    return symbols[currencyCode] || '€';
  };

  useEffect(() => {
    // Extract order ID from URL params or location state
    const urlParams = new URLSearchParams(location.search);
    const paymentIntentId = urlParams.get('payment_intent');
    
    // Get order data from location state if available
    if (location.state?.orderData) {
      setOrderData(location.state.orderData);
      setOrderId(location.state.orderData.id || location.state.orderData.order_number);
    }
    
    if (paymentIntentId) {
      // You can use this to fetch order details or redirect to orders page
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">
              Thank you for your order! Your payment has been processed successfully.
            </p>
            
            {orderData && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-blue-800">
                      Order #{orderData.order_number}
                    </p>
                    <p className="text-lg font-bold text-blue-900">
                      Total: {getCurrencySymbolForCurrency(orderData.currency || 'EUR')}{Number(orderData.total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                {orderData.items && orderData.items.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h3>
                    <div className="space-y-3">
                      {orderData.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {item.product_snapshot?.custom_jacket ? (
                              // Custom jacket image
                              <img
                                src={getFullImageUrl(item.product_snapshot.custom_jacket.front_image_url)}
                                alt={item.product_name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                onError={(e) => handleImageError(e, 'Custom Jacket')}
                              />
                            ) : (
                              // Regular product image
                              <img
                                src={
                                  item.variant?.images?.[0]?.url 
                                    ? `${import.meta.env.VITE_BACKEND_URL}${item.variant.images[0].url}`
                                    : item.variant?.product?.images?.[0]?.url
                                    ? `${import.meta.env.VITE_BACKEND_URL}${item.variant.product.images[0].url}`
                                    : undefined
                                }
                                alt={item.product_name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                onError={(e) => handleImageError(e, 'Product')}
                              />
                            )}
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {item.product_name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {item.variant_name} × {item.quantity}
                            </p>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {getCurrencySymbolForCurrency(orderData.currency || 'EUR')}
                              {Number(item.converted_subtotal || item.subtotal || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                You will receive an email confirmation shortly with your order details.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('/orders')}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                View Orders
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Continue Shopping
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccess;

