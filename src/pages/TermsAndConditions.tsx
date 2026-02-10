import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import useSWR from 'swr';
import axios from 'axios';
import { LoadingState, ErrorState } from '@/components/common';

const TermsAndConditions = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, error, isLoading } = useSWR(
    `${import.meta.env.VITE_BACKEND_URL}/api/static-pages/terms-and-conditions`,
    (url) => axios.get(url).then((res) => res.data.data)
  );

  if (isLoading) {
    return <LoadingState message="Loading terms and conditions..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load terms and conditions" />;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-10 sm:py-16 space-y-8">
      {/* Hero Section */}
      <section className="relative py-10 sm:py-16 overflow-hidden bg-gradient-to-br from-leather-100 to-leather-200 dark:from-leather-900 dark:to-leather-800 rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-50/30 to-leather-100/20 dark:from-gold-900/20 dark:to-leather-800/30"></div>
        <div className="relative z-10 text-center space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-leather-900 dark:text-leather-100">
            {data?.title || 'Terms and Conditions'}
          </h1>
          <p className="text-base sm:text-xl text-leather-700 dark:text-leather-200 max-w-xl sm:max-w-2xl mx-auto">
            Please read these terms carefully before using our services
          </p>
          <p className="text-sm text-leather-600 dark:text-leather-300">
            Last Updated: {new Date(data?.updated_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
          <CardContent className="p-6 sm:p-8 prose prose-slate dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: data?.content || '' }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;
