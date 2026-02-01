import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'introduction',
      title: t('privacy.section1.title'),
      content: t('privacy.section1.content')
    },
    {
      id: 'information-collection',
      title: t('privacy.section2.title'),
      content: t('privacy.section2.content')
    },
    {
      id: 'use-of-information',
      title: t('privacy.section3.title'),
      content: t('privacy.section3.content')
    },
    {
      id: 'information-sharing',
      title: t('privacy.section4.title'),
      content: t('privacy.section4.content')
    },
    {
      id: 'data-security',
      title: t('privacy.section5.title'),
      content: t('privacy.section5.content')
    },
    {
      id: 'cookies',
      title: t('privacy.section6.title'),
      content: t('privacy.section6.content')
    },
    {
      id: 'third-party-websites',
      title: t('privacy.section7.title'),
      content: t('privacy.section7.content')
    },
    {
      id: 'data-retention',
      title: t('privacy.section8.title'),
      content: t('privacy.section8.content')
    },
    {
      id: 'your-rights',
      title: t('privacy.section9.title'),
      content: t('privacy.section9.content')
    },
    {
      id: 'children-privacy',
      title: t('privacy.section10.title'),
      content: t('privacy.section10.content')
    },
    {
      id: 'international-transfers',
      title: t('privacy.section11.title'),
      content: t('privacy.section11.content')
    },
    {
      id: 'changes-to-policy',
      title: t('privacy.section12.title'),
      content: t('privacy.section12.content')
    },
    {
      id: 'contact',
      title: t('privacy.section13.title'),
      content: t('privacy.section13.content')
    }
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-10 sm:py-16 space-y-8">
      {/* Hero Section */}
      <section className="relative py-10 sm:py-16 overflow-hidden bg-gradient-to-br from-leather-100 to-leather-200 dark:from-leather-900 dark:to-leather-800 rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-50/30 to-leather-100/20 dark:from-gold-900/20 dark:to-leather-800/30"></div>
        <div className="relative z-10 text-center space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-leather-900 dark:text-leather-100">
            {t('privacy.title')}
          </h1>
          <p className="text-base sm:text-xl text-leather-700 dark:text-leather-200 max-w-xl sm:max-w-2xl mx-auto">
            {t('privacy.subtitle')}
          </p>
          <p className="text-sm text-leather-600 dark:text-leather-300">
            {t('privacy.lastUpdated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Privacy Policy Content */}
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
              <span className="mr-2">🔒</span>
              {t('privacy.privacyMatters')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.privacyMattersText')}
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
          <CardContent className="p-6 sm:p-8 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">
              {t('privacy.questionsTitle')}
            </h2>
            <p className="text-foreground mb-6">
              {t('privacy.questionsText')}
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

export default PrivacyPolicy;