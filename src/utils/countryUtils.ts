/**
 * Get country flag emoji from ISO 3166-1 alpha-2 country code
 */
export const getCountryFlag = (countryCode: string | undefined): string => {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍'; // Default globe emoji
  }
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

/**
 * Check if a country code represents an English-speaking country
 */
export const isEnglishSpeakingCountry = (countryCode: string | undefined): boolean => {
  if (!countryCode) return true; // Default to English if no country
  
  const englishCountries = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'];
  return englishCountries.includes(countryCode.toUpperCase());
};

/**
 * Get country name from ISO 3166-1 alpha-2 country code
 */
export const getCountryName = (countryCode: string | undefined): string => {
  if (!countryCode) return 'Unknown';
  
  const countryNames: Record<string, string> = {
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'IS': 'Iceland',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'US': 'United States',
    'CA': 'Canada',
    'NL': 'Netherlands',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'PT': 'Portugal',
    'BE': 'Belgium',
    'AT': 'Austria',
    'CH': 'Switzerland',
    'PL': 'Poland',
    'IE': 'Ireland',
    'AU': 'Australia',
    'NZ': 'New Zealand',
  };
  
  return countryNames[countryCode.toUpperCase()] || countryCode.toUpperCase();
};
