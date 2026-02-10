import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import useSWR from 'swr';
import axios from 'axios';
import { LoadingState, ErrorState } from '@/components/common';

const ProductCareGuide: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, error, isLoading } = useSWR(
    `${import.meta.env.VITE_BACKEND_URL}/api/static-pages/product-care-guide`,
    (url) => axios.get(url).then((res) => res.data.data)
  );

  if (isLoading) {
    return <LoadingState message="Loading product care guide..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load product care guide" />;
  }

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
            {data?.title || 'Product Care Guide'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn the essential techniques for maintaining your leather products' beauty and longevity
          </p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-6 sm:p-8 prose prose-slate dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: data?.content || '' }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductCareGuide;
