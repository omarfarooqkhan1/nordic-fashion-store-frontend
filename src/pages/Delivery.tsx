import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Package, Clock, MapPin, CheckCircle } from 'lucide-react';

const Delivery: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gold-100 dark:bg-gold-900/20 rounded-full">
              <Truck className="h-12 w-12 text-gold-600 dark:text-gold-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Delivery Information
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Fast, reliable, and secure delivery for your premium leather products
          </p>
        </div>

        {/* Delivery Options */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-6 w-6 text-gold-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping Options</h2>
            </div>

            <div className="space-y-6">
              {/* Standard Delivery */}
              <div className="border-l-4 border-gold-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Standard Delivery (Free)
                </h3>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                  <Clock className="h-4 w-4" />
                  <span>5-7 business days</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Free standard shipping on all orders. Your items will be carefully packaged and delivered to your doorstep.
                </p>
              </div>

              {/* Express Delivery */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Express Delivery
                </h3>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                  <Clock className="h-4 w-4" />
                  <span>2-3 business days</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Need your order faster? Choose express delivery at checkout for expedited shipping.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Process */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-6 w-6 text-gold-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Process</h2>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gold-100 dark:bg-gold-900/20 flex items-center justify-center">
                    <span className="text-gold-600 dark:text-gold-400 font-bold">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Order Confirmation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Once your order is placed, you'll receive an email confirmation with your order details and estimated delivery date.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gold-100 dark:bg-gold-900/20 flex items-center justify-center">
                    <span className="text-gold-600 dark:text-gold-400 font-bold">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Processing
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our team carefully inspects and packages your items. This typically takes 1-2 business days.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gold-100 dark:bg-gold-900/20 flex items-center justify-center">
                    <span className="text-gold-600 dark:text-gold-400 font-bold">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Shipping
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your order is dispatched with our trusted courier partners. You'll receive a tracking number to monitor your delivery.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gold-100 dark:bg-gold-900/20 flex items-center justify-center">
                    <span className="text-gold-600 dark:text-gold-400 font-bold">4</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Delivery
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your package arrives at your doorstep. Sign for your delivery and enjoy your new Nordflex products!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* International Shipping */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-6 w-6 text-gold-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">International Shipping</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                We ship to most countries worldwide. International delivery times vary by destination:
              </p>

              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Europe:</strong> 5-10 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>North America:</strong> 7-14 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Asia & Pacific:</strong> 10-15 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Rest of World:</strong> 10-20 business days</span>
                </li>
              </ul>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> International orders may be subject to customs duties and taxes, which are the responsibility of the recipient.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking */}
        <Card>
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Track Your Order
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Once your order has been shipped, you'll receive a tracking number via email. You can use this number to track your package's journey to your doorstep.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              For any delivery-related questions, please contact our customer service team at{' '}
              <a href="mailto:support@nordflex.store" className="text-gold-600 hover:text-gold-700 font-medium">
                support@nordflex.store
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Delivery;
