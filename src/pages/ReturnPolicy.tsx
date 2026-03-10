import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';
import useSWR from 'swr';
import axios from 'axios';
import { LoadingState, ErrorState } from '@/components/common';

const ReturnPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, error, isLoading } = useSWR(
    `${import.meta.env.VITE_BACKEND_URL}/api/static-pages/return-policy`,
    (url) => axios.get(url).then((res) => res.data.data)
  );

  // Process content to fix image URLs
  const processedContent = React.useMemo(() => {
    if (!data?.content) return '';
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    let content = data.content;
    
    // Replace relative image URLs with absolute URLs
    content = content.replace(
      /src=["'](\/(storage|images)\/[^"']+)["']/g,
      `src="${backendUrl}$1"`
    );
    
    return content;
  }, [data?.content]);

  if (isLoading) {
    return <LoadingState message="Loading return policy..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load return policy" />;
  }

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
            {data?.title || 'Return Policy'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your satisfaction is our priority. Easy returns within 30 days.
          </p>
        </div>

        {/* Content */}
        {/* Display images if available */}
        {data?.images && data.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {data.images.map((image: any) => (
              <div key={image.id} className="relative overflow-hidden rounded-lg shadow-lg">
                <img
                  src={image.url}
                  alt={image.alt_text || image.caption}
                  className="w-full h-64 object-cover"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Card>
          <CardContent className="p-6 sm:p-8 prose prose-slate dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: processedContent }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReturnPolicy;
