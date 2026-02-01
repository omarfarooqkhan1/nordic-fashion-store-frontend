import React from 'react';
import { NewsletterSubscription } from './NewsletterSubscription';

interface NewsletterFooterProps {
  className?: string;
}

export const NewsletterFooter: React.FC<NewsletterFooterProps> = ({ className = "" }) => {
  return (
    <section className={`bg-muted/30 py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Stay Connected with Nordic Fashion
          </h2>
          <p className="text-muted-foreground mb-8">
            Be the first to know about new collections, exclusive offers, and Nordic fashion trends. 
            Join our community of style enthusiasts.
          </p>
          <NewsletterSubscription 
            showTitle={false} 
            className="max-w-md mx-auto"
            source="footer"
          />
        </div>
      </div>
    </section>
  );
};