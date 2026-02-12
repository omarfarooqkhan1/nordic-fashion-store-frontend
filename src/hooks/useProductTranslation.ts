import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateProduct, type SupportedLanguage } from '@/services/translationService';

interface Product {
  name: string;
  description: string;
}

interface TranslatedProduct {
  name: string;
  description: string;
  isTranslating: boolean;
}

/**
 * Hook to automatically translate product name and description
 * based on current language selection
 */
export function useProductTranslation(product: Product | null | undefined): TranslatedProduct {
  const { language } = useLanguage();
  const [translatedProduct, setTranslatedProduct] = useState<TranslatedProduct>({
    name: product?.name || '',
    description: product?.description || '',
    isTranslating: false,
  });

  useEffect(() => {
    if (!product) {
      setTranslatedProduct({
        name: '',
        description: '',
        isTranslating: false,
      });
      return;
    }

    // If language is English, no translation needed
    if (language === 'en') {
      setTranslatedProduct({
        name: product.name,
        description: product.description,
        isTranslating: false,
      });
      return;
    }

    // Start translation
    setTranslatedProduct(prev => ({
      ...prev,
      isTranslating: true,
    }));

    translateProduct(product, language as SupportedLanguage)
      .then(translated => {
        setTranslatedProduct({
          name: translated.name,
          description: translated.description,
          isTranslating: false,
        });
      })
      .catch(error => {
        console.error('Translation error:', error);
        // Fallback to original text
        setTranslatedProduct({
          name: product.name,
          description: product.description,
          isTranslating: false,
        });
      });
  }, [product, language]);

  return translatedProduct;
}

/**
 * Hook to translate multiple products
 */
export function useProductsTranslation(products: Product[]): {
  translatedProducts: TranslatedProduct[];
  isTranslating: boolean;
} {
  const { language } = useLanguage();
  const [translatedProducts, setTranslatedProducts] = useState<TranslatedProduct[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!products || products.length === 0) {
      setTranslatedProducts([]);
      setIsTranslating(false);
      return;
    }

    // If language is English, no translation needed
    if (language === 'en') {
      setTranslatedProducts(
        products.map(p => ({
          name: p.name,
          description: p.description,
          isTranslating: false,
        }))
      );
      setIsTranslating(false);
      return;
    }

    // Start translation
    setIsTranslating(true);

    Promise.all(
      products.map(product => translateProduct(product, language as SupportedLanguage))
    )
      .then(translated => {
        setTranslatedProducts(
          translated.map(t => ({
            name: t.name,
            description: t.description,
            isTranslating: false,
          }))
        );
        setIsTranslating(false);
      })
      .catch(error => {
        console.error('Translation error:', error);
        // Fallback to original text
        setTranslatedProducts(
          products.map(p => ({
            name: p.name,
            description: p.description,
            isTranslating: false,
          }))
        );
        setIsTranslating(false);
      });
  }, [products, language]);

  return { translatedProducts, isTranslating };
}
