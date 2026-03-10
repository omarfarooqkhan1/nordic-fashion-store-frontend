import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import useSWR from 'swr';
import axios from 'axios';
import { LoadingState, ErrorState } from '@/components/common';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, error, isLoading } = useSWR(
    `${import.meta.env.VITE_BACKEND_URL}/api/static-pages/about`,
    (url) => axios.get(url).then((res) => res.data.data)
  );

  // Process content to fix image URLs
  const processedContent = React.useMemo(() => {
    if (!data?.content) return '';
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    let content = data.content;
    
    // Replace relative image URLs with absolute URLs
    // Match src="/storage/..." or src="/images/..."
    content = content.replace(
      /src=["'](\/(storage|images)\/[^"']+)["']/g,
      `src="${backendUrl}$1"`
    );
    
    return content;
  }, [data?.content]);

  if (isLoading) {
    return <LoadingState message={t('about.loading') || 'Loading...'} />;
  }

  if (error) {
    return <ErrorState message={t('about.loadError') || 'Failed to load page'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-2 sm:px-4 py-10 sm:py-16 space-y-8">
        {/* Hero Section */}
        <section className="relative py-10 sm:py-16 overflow-hidden bg-gradient-to-br from-leather-100 to-leather-200 dark:from-leather-900 dark:to-leather-800 rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-50/30 to-leather-100/20 dark:from-gold-900/20 dark:to-leather-800/30"></div>
          <div className="relative z-10 text-center space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-leather-900 dark:text-leather-100">
              {data?.title || t('about.hero.title')}
            </h1>
            <p className="text-base sm:text-xl text-leather-700 dark:text-leather-200 max-w-xl sm:max-w-2xl mx-auto">
              {t('about.hero.subtitle')}
            </p>
            <p className="text-sm text-leather-600 dark:text-leather-300">
              {t('about.lastUpdated')} {new Date(data?.updated_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>

        {/* About Content */}
        <div className="max-w-4xl mx-auto">
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

          <Card className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
            <CardContent className="p-6 sm:p-8 prose prose-slate dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: processedContent }} />
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-br from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-800/20 border-gold-200 dark:border-gold-700 shadow-lg mt-6">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="/products" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 text-white dark:text-slate-900 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Explore Collection
                  <span className="ml-2">→</span>
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Get in Touch
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;