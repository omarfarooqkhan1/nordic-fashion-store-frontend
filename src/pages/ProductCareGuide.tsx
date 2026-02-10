import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Droplet, Sun, Wind, AlertTriangle } from 'lucide-react';

const ProductCareGuide: React.FC = () => {
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
              <Sparkles className="h-12 w-12 text-gold-600 dark:text-gold-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Product Care Guide
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn the essential techniques for maintaining your leather products' beauty and longevity
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Proper care of your leather products is an investment in their longevity. With the right techniques and products, your Nordflex leather items can last for decades while maintaining their beauty and functionality.
            </p>
          </CardContent>
        </Card>

        {/* Understanding Leather Types */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Understanding Leather Types
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Different types of leather require different care approaches. Understanding your product's leather type is the first step in proper maintenance.
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-gold-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Full-Grain Leather
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Highest quality leather with natural grain intact. Requires minimal conditioning and develops a beautiful patina over time.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Top-Grain Leather
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Good quality leather with a smooth finish. Needs regular conditioning to maintain suppleness.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Genuine Leather
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Requires more frequent care and conditioning to prevent drying and cracking.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Suede
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Needs special suede-specific products and brushes. More delicate than smooth leather.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Care Routine */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-gold-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Care Routine</h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Proper daily care can significantly extend your leather product's life and maintain its appearance.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Storage Tips
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>Always hang leather jackets on wide, padded hangers to maintain their shape</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>Store in a cool, dry place away from direct sunlight and heat sources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>Avoid plastic bags or covers that can trap moisture - use breathable garment bags</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>Keep leather items away from damp areas to prevent mold and mildew</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Cleaning Basics
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>Use a soft, dry cloth to remove surface dirt and dust regularly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>For stubborn stains, use a slightly damp cloth with mild soap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>Always test cleaning products on a small, inconspicuous area first</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>Never soak leather in water or use harsh chemicals</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditioning and Protection */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Droplet className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Conditioning and Protection</h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Regular conditioning keeps leather supple and prevents cracking, especially important in dry climates or during winter months.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  How Often to Condition
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Condition your leather products every 3-6 months, or more frequently if you notice the leather becoming dry or stiff.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> Increase conditioning frequency in dry climates or during winter when indoor heating can dry out leather.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Choosing the Right Conditioner
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>Use a high-quality leather conditioner specifically designed for your leather type</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>Test on a small, inconspicuous area first to ensure compatibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>Apply conditioner with a soft cloth in circular motions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600 mt-1">•</span>
                    <span>Allow the conditioner to absorb for 15-20 minutes, then buff with a clean cloth</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Protection */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sun className="h-6 w-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weather Protection</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <Wind className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Rain and Moisture
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    If your leather gets wet, blot excess water with a soft cloth and let it air dry naturally. Never use direct heat sources like hair dryers or radiators, as they can cause cracking.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Sun className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Sun Exposure
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Prolonged sun exposure can fade and dry out leather. Store your items away from direct sunlight and consider using a leather protectant spray with UV protection.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Mistakes */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Common Mistakes to Avoid</h2>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  <strong>Over-conditioning:</strong> Too much conditioner can make leather greasy and attract dirt
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  <strong>Using harsh chemicals:</strong> Avoid household cleaners, alcohol, or acetone-based products
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  <strong>Machine washing:</strong> Never put leather items in the washing machine or dryer
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  <strong>Ignoring stains:</strong> Address spills and stains immediately for best results
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Professional Care */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Professional Care
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              For deep cleaning, restoration, or repair of valuable leather items, we recommend consulting a professional leather care specialist. They have the expertise and specialized products to handle:
            </p>

            <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-1">•</span>
                <span>Stubborn stains and discoloration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-1">•</span>
                <span>Tears, rips, or structural damage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-1">•</span>
                <span>Color restoration and refinishing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-1">•</span>
                <span>Mold or mildew removal</span>
              </li>
            </ul>

            <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg p-4">
              <p className="text-sm text-gold-800 dark:text-gold-200">
                <strong>Pro Tip:</strong> When in doubt, consult a professional leather care specialist. They can provide expert advice and services to restore your items to their original condition.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Care Image */}
        <Card>
          <CardContent className="p-0">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/storage/images/blogs/2.jpeg`}
              alt="Leather Care Guide"
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductCareGuide;
