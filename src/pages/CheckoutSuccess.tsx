import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Extract order ID from URL params or location state
    const urlParams = new URLSearchParams(location.search);
    const paymentIntentId = urlParams.get('payment_intent');
    
    if (paymentIntentId) {
      // You can use this to fetch order details or redirect to orders page
      console.log('Payment Intent ID:', paymentIntentId);
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

