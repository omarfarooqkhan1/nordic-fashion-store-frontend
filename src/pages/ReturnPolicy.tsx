import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';

const ReturnPolicy: React.FC = () => {
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
              <RotateCcw className="h-12 w-12 text-gold-600 dark:text-gold-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Return Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your satisfaction is our priority. Easy returns within 30 days.
          </p>
        </div>

        {/* Return Window */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-gold-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">30-Day Return Window</h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We offer a 30-day return policy from the date of delivery. If you're not completely satisfied with your purchase, you can return it for a full refund or exchange.
            </p>

            <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg p-4">
              <p className="text-sm text-gold-800 dark:text-gold-200">
                <strong>Important:</strong> Items must be returned in their original condition with all tags attached and in the original packaging.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Eligible Items */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Eligible for Return</h2>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  Items in original, unworn condition with all tags attached
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  Products in original packaging with all accessories included
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  Items without any signs of wear, damage, or alterations
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  Products with proof of purchase (order confirmation or receipt)
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Non-Returnable Items */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Non-Returnable Items</h2>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  Custom-made or personalized items (including custom jackets)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  Items marked as final sale or clearance
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  Products that have been worn, used, or damaged
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  Items without original tags or packaging
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Return Process */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-6 w-6 text-gold-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How to Return</h2>
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
                    Contact Us
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Email us at{' '}
                    <a href="mailto:support@nordflex.store" className="text-gold-600 hover:text-gold-700 font-medium">
                      support@nordflex.store
                    </a>{' '}
                    with your order number and reason for return.
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
                    Receive Authorization
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We'll send you a Return Authorization (RA) number and return shipping instructions within 24 hours.
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
                    Pack Your Item
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Securely pack the item in its original packaging with all tags and accessories. Include the RA number.
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
                    Ship It Back
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Send the package using a trackable shipping method. Keep your tracking number for reference.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gold-100 dark:bg-gold-900/20 flex items-center justify-center">
                    <span className="text-gold-600 dark:text-gold-400 font-bold">5</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Receive Your Refund
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Once we receive and inspect your return, we'll process your refund within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Information */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Refund Information
            </h2>

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Refunds will be issued to the original payment method used for the purchase. Please allow 5-10 business days for the refund to appear in your account after we process it.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Shipping Costs:</strong> Original shipping costs are non-refundable unless the return is due to our error or a defective product.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchanges */}
        <Card>
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Exchanges
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you'd like to exchange an item for a different size or color, please follow the return process above and place a new order for the desired item. This ensures you receive your new item as quickly as possible.
            </p>

            <p className="text-gray-600 dark:text-gray-300">
              For any questions about our return policy, please contact us at{' '}
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

export default ReturnPolicy;
