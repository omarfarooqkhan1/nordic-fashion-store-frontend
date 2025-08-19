import React from 'react';
import { Link } from 'react-router-dom';

// Utility to scroll to top
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-leather-800 dark:text-leather-100">NORD</div>
              <div className="text-xl font-light text-gold-500">FLEX</div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.brand.desc')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">{t('footer.quicklinks')}</h3>
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
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">{t('footer.categories')}</h3>
            <ul className="space-y-2 text-sm">
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
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">{t('footer.contact')}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t('footer.company')}</p>
              <p>{t('footer.location')}</p>
              <p>+358 44 9782549</p>
              <a href="mailto:support@nordflex.shop">support@nordflex.shop</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-gold-500 transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-gold-500 transition-colors">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};