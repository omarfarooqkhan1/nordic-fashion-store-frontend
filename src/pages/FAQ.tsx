import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = useState<number[]>([]);

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: t('faq.q1.question'),
      answer: t('faq.q1.answer'),
      icon: "⚠️"
    },
    {
      question: t('faq.q2.question'),
      answer: t('faq.q2.answer'),
      icon: "✨"
    },
    {
      question: t('faq.q3.question'),
      answer: t('faq.q3.answer'),
      icon: "🭐"
    },
    {
      question: t('faq.q4.question'),
      answer: t('faq.q4.answer'),
      icon: "🔒"
    },
    {
      question: t('faq.q5.question'),
      answer: t('faq.q5.answer'),
      icon: "🌍"
    },
    {
      question: t('faq.q6.question'),
      answer: t('faq.q6.answer'),
      icon: "🔄"
    },
    {
      question: t('faq.q7.question'),
      answer: t('faq.q7.answer'),
      icon: "🧽"
    },
    {
      question: t('faq.q8.question'),
      answer: t('faq.q8.answer'),
      icon: "🛡️"
    },
    {
      question: t('faq.q9.question'),
      answer: t('faq.q9.answer'),
      icon: "🎨"
    },
    {
      question: t('faq.q10.question'),
      answer: t('faq.q10.answer'),
      icon: "📞"
    }
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-10 sm:py-16 space-y-8">
      {/* Hero Section */}
      <section className="relative py-10 sm:py-16 overflow-hidden bg-gradient-to-br from-leather-100 to-leather-200 dark:from-leather-900 dark:to-leather-800 rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-50/30 to-leather-100/20 dark:from-gold-900/20 dark:to-leather-800/30"></div>
        <div className="relative z-10 text-center space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-leather-900 dark:text-leather-100">
            {t('faq.title')}
          </h1>
          <p className="text-base sm:text-xl text-leather-700 dark:text-leather-200 max-w-xl sm:max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
          <p className="text-sm text-leather-600 dark:text-leather-300">
            {t('faq.lastUpdated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto space-y-4">
        {faqItems.map((item, index) => (
          <Card 
            key={index} 
            className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-0">
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-leather-50/50 dark:hover:bg-leather-800/20 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{item.icon}</span>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                    {item.question}
                  </h2>
                </div>
                {openItems.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-6 border-t border-border">
                  <div className="pt-4">
                    <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground leading-relaxed">
                      <p className="whitespace-pre-line">{item.answer}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Section */}
      <Card className="bg-gradient-to-br from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-800/20 border-gold-200 dark:border-gold-700 shadow-lg">
        <CardContent className="p-6 sm:p-8 text-center">
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center justify-center">
            <span className="mr-2">🛡️</span>
            {t('faq.contactTitle')}
          </h3>
          <p className="text-foreground mb-6">
            {t('faq.contactText')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@nordflex.shop"
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
            <a 
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-leather-500 hover:bg-leather-600 text-leather-50 dark:text-leather-100 font-semibold rounded-lg transition-colors duration-300"
            >
              💬 {t('contact.contactForm')}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;