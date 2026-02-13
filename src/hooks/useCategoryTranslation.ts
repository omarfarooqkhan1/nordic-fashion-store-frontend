import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateCategory, type SupportedLanguage } from '@/services/translationService';

/**
 * Hook to automatically translate category name
 * based on current language selection
 */
export function useCategoryTranslation(categoryName: string | undefined | null): string {
  const { language } = useLanguage();
  const [translatedCategory, setTranslatedCategory] = useState<string>(categoryName || '');

  useEffect(() => {
    if (!categoryName) {
      setTranslatedCategory('');
      return;
    }

    // If language is English, no translation needed
    if (language === 'en') {
      setTranslatedCategory(categoryName);
      return;
    }

    translateCategory(categoryName, language as SupportedLanguage)
      .then(translated => {
        setTranslatedCategory(translated);
      })
      .catch(error => {
        console.error('Category translation error:', error);
        // Fallback to original text
        setTranslatedCategory(categoryName);
      });
  }, [categoryName, language]);

  return translatedCategory;
}
