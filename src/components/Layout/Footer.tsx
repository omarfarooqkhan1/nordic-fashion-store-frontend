import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/api/admin';

// Utility to scroll to top
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
import { useLanguage } from '@/contexts/LanguageContext';
import { SocialMediaIcons } from '@/components/common/SocialMediaIcons';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  // Fetch categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ['footer-categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });

  return (
    <footer className="border-t border-border bg-background mt-12">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-16 gap-y-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Nord Flex Logo" 
                className="w-20 h-20 object-contain dark:brightness-0 dark:invert"
              />
              <div className="flex items-center space-x-1">
                <div className="text-xl font-bold text-leather-800 dark:text-leather-100">NORD</div>
                <div className="text-xl font-light text-gold-500">FLEX</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.brand.desc')}
            </p>
            
            {/* Newsletter Button */}
            <Link 
              to="/newsletter" 
              className="group relative inline-flex items-center gap-2 text-sm font-medium text-gold-600 hover:text-gold-500 transition-all duration-300 px-4 py-2 rounded-full border-2 border-gold-300 hover:border-gold-400 hover:bg-gold-50 dark:border-gold-700 dark:hover:border-gold-600 dark:hover:bg-gold-950/30 hover:shadow-md hover:scale-105" 
              onClick={scrollToTop}
            >
              <span className="text-base">📧</span>
              <span className="relative z-10 font-semibold text-xs">Subscribe to Newsletter</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-100 to-gold-200 dark:from-gold-900/20 dark:to-gold-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>

          {/* Follow Us / Social Media */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">{t('footer.social')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('footer.social.desc')}</p>
            <SocialMediaIcons 
              className="flex flex-wrap gap-3" 
              iconSize={28}
              showLabels={false}
            />
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">{t('footer.categories')}</h3>
            <ul className="space-y-2 text-sm">
              {categories.length > 0 ? (
                categories.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <Link 
                      to={`/products?category=${category.name.toLowerCase()}`} 
                      className="text-muted-foreground hover:text-gold-500 transition-colors" 
                      onClick={scrollToTop}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                // Fallback to static categories if API fails
                <>
                  <li>
                    <Link to="/products?category=bags" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                      {t('products.bags')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/products?category=wallets" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                      {t('products.wallets')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/products?category=belts" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                      {t('products.belts')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/products?category=jackets" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                      {t('products.jackets')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">{t('footer.quicklinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                  Blogs
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                  {t('nav.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Information/Legal */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                  Delivery
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                  Returns
                </Link>
              </li>
              <li>
                <Link to="/care-guide" className="text-muted-foreground hover:text-gold-500 transition-colors" onClick={scrollToTop}>
                  Care Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};