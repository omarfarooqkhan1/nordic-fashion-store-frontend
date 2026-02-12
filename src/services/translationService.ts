/**
 * Translation Service using MyMemory Translation API
 * Free API with no authentication required
 * Supports all Nordic languages
 */

export type SupportedLanguage = 'en' | 'sv' | 'no' | 'da' | 'fi' | 'is';

// Language code mapping for MyMemory API
const LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  sv: 'sv-SE',
  no: 'nb-NO', // Norwegian Bokmål
  da: 'da-DK',
  fi: 'fi-FI',
  is: 'is-IS',
};

// Cache to store translations and avoid repeated API calls
const translationCache = new Map<string, string>();

/**
 * Generate a cache key for storing translations
 */
function getCacheKey(text: string, fromLang: string, toLang: string): string {
  return `${fromLang}:${toLang}:${text}`;
}

/**
 * Translate text using MyMemory Translation API
 * @param text - Text to translate
 * @param targetLang - Target language code (en, sv, no, da, fi, is)
 * @param sourceLang - Source language code (default: 'en')
 * @returns Translated text or original text if translation fails
 */
export async function translateText(
  text: string,
  targetLang: SupportedLanguage,
  sourceLang: SupportedLanguage = 'en'
): Promise<string> {
  // If target language is same as source, return original text
  if (targetLang === sourceLang) {
    return text;
  }

  // If text is empty or too short, return as is
  if (!text || text.trim().length < 2) {
    return text;
  }

  // Check cache first
  const cacheKey = getCacheKey(text, sourceLang, targetLang);
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const fromLang = LANGUAGE_MAP[sourceLang];
    const toLang = LANGUAGE_MAP[targetLang];

    // MyMemory API endpoint
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      
      // Cache the translation
      translationCache.set(cacheKey, translated);
      
      return translated;
    }

    // If translation fails, return original text
    return text;
  } catch (error) {
    console.warn('Translation failed:', error);
    return text;
  }
}

/**
 * Translate multiple texts in batch
 * @param texts - Array of texts to translate
 * @param targetLang - Target language code
 * @param sourceLang - Source language code (default: 'en')
 * @returns Array of translated texts
 */
export async function translateBatch(
  texts: string[],
  targetLang: SupportedLanguage,
  sourceLang: SupportedLanguage = 'en'
): Promise<string[]> {
  // If target language is same as source, return original texts
  if (targetLang === sourceLang) {
    return texts;
  }

  // Translate all texts in parallel
  const promises = texts.map(text => translateText(text, targetLang, sourceLang));
  return Promise.all(promises);
}

/**
 * Translate product data (name and description)
 * @param product - Product object with name and description
 * @param targetLang - Target language code
 * @returns Product with translated name and description
 */
export async function translateProduct(
  product: { name: string; description: string },
  targetLang: SupportedLanguage
): Promise<{ name: string; description: string }> {
  if (targetLang === 'en') {
    return product;
  }

  try {
    const [translatedName, translatedDescription] = await Promise.all([
      translateText(product.name, targetLang),
      translateText(product.description, targetLang),
    ]);

    return {
      name: translatedName,
      description: translatedDescription,
    };
  } catch (error) {
    console.warn('Product translation failed:', error);
    return product;
  }
}

/**
 * Clear translation cache (useful for testing or memory management)
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get cache size (for debugging)
 */
export function getCacheSize(): number {
  return translationCache.size;
}
