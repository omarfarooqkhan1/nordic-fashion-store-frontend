import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const TermsAndConditions = () => {
  const { t } = useLanguage();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'introduction',
      title: t('terms.section1.title'),
      content: t('terms.section1.content')
    },
    {
      id: 'definitions',
      title: t('terms.section2.title'),
      content: t('terms.section2.content')
    },
    {
      id: 'intellectual-property',
      title: t('terms.section3.title'),
      content: t('terms.section3.content')
    },
    {
      id: 'use-of-website',
      title: t('terms.section4.title'),
      content: t('terms.section4.content')
    },
    {
      id: 'user-accounts',
      title: t('terms.section5.title'),
      content: t('terms.section5.content')
    },
    {
      id: 'product-information',
      title: t('terms.section6.title'),
      content: t('terms.section6.content')
    },
    {
      id: 'orders-payment',
      title: t('terms.section7.title'),
      content: t('terms.section7.content')
    },
    {
      id: 'shipping-delivery',
      title: t('terms.section8.title'),
      content: t('terms.section8.content')
    },
    {
      id: 'returns-exchanges',
      title: t('terms.section9.title'),
      content: t('terms.section9.content')
    },
    {
      id: 'warranties',
      title: t('terms.section10.title'),
      content: t('terms.section10.content')
    },
    {
      id: 'limitation-liability',
      title: t('terms.section11.title'),
      content: t('terms.section11.content')
    },
    {
      id: 'privacy',
      title: t('terms.section12.title'),
      content: t('terms.section12.content')
    },
    {
      id: 'modifications',
      title: t('terms.section13.title'),
      content: t('terms.section13.content')
    },
    {
      id: 'governing-law',
      title: t('terms.section14.title'),
      content: t('terms.section14.content')
    },
    {
      id: 'contact',
      title: t('terms.section15.title'),
      content: t('terms.section15.content')
    }
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-10 sm:py-16 space-y-8">
      {/* Hero Section */}
      <section className="relative py-10 sm:py-16 overflow-hidden bg-gradient-to-br from-leather-100 to-leather-200 dark:from-leather-900 dark:to-leather-800 rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-50/30 to-leather-100/20 dark:from-gold-900/20 dark:to-leather-800/30"></div>
        <div className="relative z-10 text-center space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-leather-900 dark:text-leather-100">
            {t('terms.title')}
          </h1>
          <p className="text-base sm:text-xl text-leather-700 dark:text-leather-200 max-w-xl sm:max-w-2xl mx-auto">
            {t('terms.subtitle')}
          </p>
          <p className="text-sm text-leather-600 dark:text-leather-300">
            {t('terms.lastUpdated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {sections.map((section, index) => (
          <Card key={section.id} className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 border-b border-border pb-2">
                {section.title}
              </h2>
              <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground leading-relaxed">
                <p className="whitespace-pre-line">{section.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Additional Information */}
        <Card className="bg-gradient-to-br from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-800/20 border-gold-200 dark:border-gold-700 shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center">
              <span className="mr-2">ℹ️</span>
              {t('terms.importantNotice')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.importantNoticeText')}
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
          <CardContent className="p-6 sm:p-8 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">
              {t('terms.questionsTitle')}
            </h2>
            <p className="text-foreground mb-6">
              {t('terms.questionsText')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@nordflex.store"
                className="inline-flex items-center px-6 py-3 bg-gold-500 hover:bg-gold-600 text-gold-950 dark:text-gold-50 font-semibold rounded-lg transition-colors duration-300"
              >
                📧 {t('contact.emailUs')}
              </a>
              <a 
                href="tel:+358449782549"
                className="inline-flex items-center px-6 py-3 bg-leather-600 hover:bg-leather-700 text-leather-50 dark:text-leather-100 font-semibold rounded-lg transition-colors duration-300"
              >
                📞 {t('contact.callUs')}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;