import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 
  // Major Currencies
  'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'AUD' | 'CAD' | 'CHF' |
  // European
  'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'HRK' | 'ISK' |
  // Asia Pacific
  'HKD' | 'SGD' | 'NZD' | 'KRW' | 'TWD' | 'THB' | 'MYR' | 'PHP' | 'IDR' | 'VND' | 'INR' | 'PKR' | 'BDT' | 'LKR' |
  // Americas
  'MXN' | 'BRL' | 'ARS' | 'CLP' | 'COP' | 'PEN' | 'UYU' | 'DOP' | 'GTQ' | 'CRC' | 'PAB' | 'JMD' | 'TTD' |
  // Middle East & Africa
  'AED' | 'SAR' | 'QAR' | 'KWD' | 'BHD' | 'OMR' | 'JOD' | 'LBP' | 'ILS' | 'EGP' | 'ZAR' | 'NGN' | 'KES' | 'GHS' | 'TZS' | 'UGX' | 'MAD' | 'TND' |
  // Other Currencies
  'TRY' | 'RUB' | 'UAH' | 'GEL' | 'AMD' | 'AZN' | 'KZT' | 'UZS' | 'MNT' | 'NPR' | 'MMK' | 'KHR' | 'LAK' | 'BWP' | 'MUR' | 'SCR' | 'XOF' | 'XAF';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency, isManual?: boolean) => void;
  exchangeRates: Record<string, number>;
  convertPrice: (price: number) => number;
  getCurrencySymbol: () => string;
  detectedCountry: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates relative to EUR (base currency) - Stripe supported currencies
const defaultExchangeRates: Record<string, number> = {
  // Major Currencies
  EUR: 1.0,
  USD: 1.08,
  GBP: 0.85,
  JPY: 162.0,
  CNY: 7.85,
  AUD: 1.65,
  CAD: 1.47,
  CHF: 0.94,
  
  // European
  SEK: 11.2,
  NOK: 11.8,
  DKK: 7.46,
  PLN: 4.35,
  CZK: 24.5,
  HUF: 390.0,
  RON: 4.97,
  BGN: 1.96,
  HRK: 7.53,
  ISK: 149.5,
  
  // Asia Pacific
  HKD: 8.45,
  SGD: 1.45,
  NZD: 1.78,
  KRW: 1450.0,
  TWD: 34.8,
  THB: 38.5,
  MYR: 4.85,
  PHP: 61.5,
  IDR: 16850.0,
  VND: 26500.0,
  INR: 90.5,
  PKR: 300.0,
  BDT: 118.0,
  LKR: 325.0,
  
  // Americas
  MXN: 21.8,
  BRL: 6.15,
  ARS: 1025.0,
  CLP: 985.0,
  COP: 4285.0,
  PEN: 3.85,
  UYU: 42.5,
  DOP: 61.5,
  GTQ: 8.35,
  CRC: 545.0,
  PAB: 1.08,
  JMD: 158.0,
  TTD: 7.35,
  
  // Middle East & Africa
  AED: 3.97,
  SAR: 4.05,
  QAR: 3.93,
  KWD: 0.31,
  BHD: 0.41,
  OMR: 0.42,
  JOD: 0.77,
  LBP: 15000.0,
  ILS: 4.05,
  EGP: 48.5,
  ZAR: 19.5,
  NGN: 1650.0,
  KES: 155.0,
  GHS: 15.8,
  TZS: 2650.0,
  UGX: 3850.0,
  MAD: 10.8,
  TND: 3.15,
  
  // Other Currencies
  TRY: 32.5,
  RUB: 95.0,
  UAH: 40.5,
  GEL: 2.85,
  AMD: 425.0,
  AZN: 1.84,
  KZT: 485.0,
  UZS: 12500.0,
  MNT: 2950.0,
  NPR: 144.0,
  MMK: 2265.0,
  KHR: 4350.0,
  LAK: 23500.0,
  BWP: 14.2,
  MUR: 48.5,
  SCR: 14.8,
  XOF: 655.0,
  XAF: 655.0
};

const currencySymbols: Record<Currency, string> = {
  // Major Currencies
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  
  // European
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  BGN: 'лв',
  HRK: 'kn',
  ISK: 'kr',
  
  // Asia Pacific
  HKD: 'HK$',
  SGD: 'S$',
  NZD: 'NZ$',
  KRW: '₩',
  TWD: 'NT$',
  THB: '฿',
  MYR: 'RM',
  PHP: '₱',
  IDR: 'Rp',
  VND: '₫',
  INR: '₹',
  PKR: '₨',
  BDT: '৳',
  LKR: '₨',
  
  // Americas
  MXN: '$',
  BRL: 'R$',
  ARS: '$',
  CLP: '$',
  COP: '$',
  PEN: 'S/',
  UYU: '$U',
  DOP: 'RD$',
  GTQ: 'Q',
  CRC: '₡',
  PAB: 'B/.',
  JMD: 'J$',
  TTD: 'TT$',
  
  // Middle East & Africa
  AED: 'د.إ',
  SAR: '﷼',
  QAR: '﷼',
  KWD: 'د.ك',
  BHD: '.د.ب',
  OMR: '﷼',
  JOD: 'د.ا',
  LBP: '£',
  ILS: '₪',
  EGP: 'E£',
  ZAR: 'R',
  NGN: '₦',
  KES: 'KSh',
  GHS: '₵',
  TZS: 'TSh',
  UGX: 'USh',
  MAD: 'د.م.',
  TND: 'د.ت',
  
  // Other Currencies
  TRY: '₺',
  RUB: '₽',
  UAH: '₴',
  GEL: '₾',
  AMD: '֏',
  AZN: '₼',
  KZT: '₸',
  UZS: 'лв',
  MNT: '₮',
  NPR: '₨',
  MMK: 'K',
  KHR: '៛',
  LAK: '₭',
  BWP: 'P',
  MUR: '₨',
  SCR: '₨',
  XOF: 'CFA',
  XAF: 'FCFA'
};

// Comprehensive country to currency mapping - Stripe supported currencies
const countryCurrencyMap: Record<string, Currency> = {
  // Nordic Countries (primary focus)
  'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK', 'IS': 'ISK', 'FI': 'EUR',
  
  // Major markets
  'US': 'USD', 'GB': 'GBP', 'CA': 'CAD', 'AU': 'AUD', 'JP': 'JPY',
  'CH': 'CHF', 'CN': 'CNY', 'IN': 'INR', 'BR': 'BRL', 'MX': 'MXN',
  'ZA': 'ZAR', 'KR': 'KRW', 'SG': 'SGD', 'HK': 'HKD', 'NZ': 'NZD',
  
  // South Asian countries
  'PK': 'PKR', // Pakistan
  'BD': 'BDT', // Bangladesh
  'LK': 'LKR', // Sri Lanka
  'NP': 'NPR', // Nepal
  'AF': 'USD', // Afghanistan - use USD as fallback
  'MV': 'USD', // Maldives - use USD as fallback
  'BT': 'USD', // Bhutan - use USD as fallback
  
  // European Union
  'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 
  'BE': 'EUR', 'AT': 'EUR', 'IE': 'EUR', 'PT': 'EUR', 'GR': 'EUR',
  'LU': 'EUR', 'MT': 'EUR', 'CY': 'EUR', 'SK': 'EUR', 'SI': 'EUR',
  'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR',
  
  // Other European
  'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF', 'RO': 'RON', 'BG': 'BGN',
  'HR': 'HRK', 'RU': 'RUB', 'TR': 'TRY', 'UA': 'UAH',
  
  // Middle East
  'AE': 'AED', 'SA': 'SAR', 'QA': 'QAR', 'KW': 'KWD', 'BH': 'BHD',
  'OM': 'OMR', 'JO': 'JOD', 'LB': 'LBP', 'EG': 'EGP', 'IL': 'ILS',
  'IR': 'USD', 'IQ': 'USD', 'SY': 'USD', 'YE': 'USD',
  
  // Asia
  'TH': 'THB', 'VN': 'VND', 'ID': 'IDR', 'MY': 'MYR', 'PH': 'PHP',
  'TW': 'TWD', 'KH': 'KHR', 'LA': 'LAK', 'MM': 'MMK', 'BN': 'USD',
  'MN': 'MNT', 'UZ': 'UZS', 'KZ': 'KZT', 'KG': 'USD', 'TJ': 'USD',
  'TM': 'USD', 'GE': 'GEL', 'AM': 'AMD', 'AZ': 'AZN',
  
  // Africa
  'MA': 'MAD', 'TN': 'TND', 'NG': 'NGN', 'GH': 'GHS', 'KE': 'KES',
  'ET': 'USD', 'UG': 'UGX', 'TZ': 'TZS', 'RW': 'USD', 'BW': 'BWP',
  'ZW': 'USD', 'ZM': 'USD', 'MW': 'USD', 'MZ': 'USD', 'AO': 'USD',
  'NA': 'USD', 'LS': 'USD', 'SZ': 'USD', 'MG': 'USD', 'MU': 'MUR',
  'SC': 'SCR', 'DJ': 'USD', 'SO': 'USD', 'ER': 'USD', 'SS': 'USD',
  'SD': 'USD', 'TD': 'USD', 'CF': 'XAF', 'CM': 'XAF', 'GQ': 'XAF',
  'GA': 'XAF', 'CG': 'XAF', 'CD': 'USD', 'ST': 'USD', 'CV': 'USD',
  'GW': 'XOF', 'GN': 'USD', 'SL': 'USD', 'LR': 'USD', 'CI': 'XOF',
  'BF': 'XOF', 'ML': 'XOF', 'NE': 'XOF', 'SN': 'XOF', 'GM': 'USD',
  'MR': 'USD', 'DZ': 'USD', 'LY': 'USD',
  
  // Americas
  'CL': 'CLP', 'AR': 'ARS', 'CO': 'COP', 'PE': 'PEN', 'UY': 'UYU',
  'PY': 'USD', 'BO': 'USD', 'EC': 'USD', 'VE': 'USD', 'GY': 'USD',
  'SR': 'USD', 'FK': 'USD', 'GF': 'EUR', 'TT': 'TTD', 'JM': 'JMD',
  'HT': 'USD', 'DO': 'DOP', 'CU': 'USD', 'BS': 'USD', 'BB': 'USD',
  'LC': 'USD', 'VC': 'USD', 'GD': 'USD', 'DM': 'USD', 'AG': 'USD',
  'KN': 'USD', 'AI': 'USD', 'MS': 'USD', 'VG': 'USD', 'VI': 'USD',
  'PR': 'USD', 'TC': 'USD', 'KY': 'USD', 'BM': 'USD', 'GL': 'USD',
  'PM': 'EUR', 'MQ': 'EUR', 'GP': 'EUR', 'BL': 'EUR', 'MF': 'EUR',
  'SX': 'USD', 'CW': 'USD', 'AW': 'USD', 'BQ': 'USD', 'GT': 'GTQ',
  'BZ': 'USD', 'SV': 'USD', 'HN': 'USD', 'NI': 'USD', 'CR': 'CRC',
  'PA': 'PAB',
  
  // Oceania
  'FJ': 'USD', 'PG': 'USD', 'SB': 'USD', 'VU': 'USD', 'NC': 'USD',
  'PF': 'USD', 'WF': 'USD', 'CK': 'USD', 'NU': 'USD', 'TK': 'USD',
  'TO': 'USD', 'WS': 'USD', 'TV': 'USD', 'KI': 'USD', 'NR': 'USD',
  'FM': 'USD', 'MH': 'USD', 'PW': 'USD', 'MP': 'USD', 'GU': 'USD',
  'AS': 'USD', 'UM': 'USD'
};

// Simple currency list for dropdown - Stripe supported currencies
const currencies = [
  // Major Global Currencies
  { code: 'USD' as Currency, name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR' as Currency, name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP' as Currency, name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY' as Currency, name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY' as Currency, name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'AUD' as Currency, name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD' as Currency, name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF' as Currency, name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  
  // Nordic Currencies
  { code: 'SEK' as Currency, name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK' as Currency, name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK' as Currency, name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'ISK' as Currency, name: 'Icelandic Krona', symbol: 'kr', flag: '🇮🇸' },
  
  // European Currencies
  { code: 'PLN' as Currency, name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CZK' as Currency, name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'HUF' as Currency, name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'RON' as Currency, name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
  { code: 'BGN' as Currency, name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬' },
  { code: 'HRK' as Currency, name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷' },
  { code: 'RUB' as Currency, name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'TRY' as Currency, name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'UAH' as Currency, name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦' },
  
  // Asia Pacific
  { code: 'HKD' as Currency, name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'SGD' as Currency, name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'NZD' as Currency, name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'KRW' as Currency, name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'TWD' as Currency, name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'THB' as Currency, name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'MYR' as Currency, name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'PHP' as Currency, name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'IDR' as Currency, name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'VND' as Currency, name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'INR' as Currency, name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'PKR' as Currency, name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'BDT' as Currency, name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'LKR' as Currency, name: 'Sri Lankan Rupee', symbol: '₨', flag: '🇱🇰' },
  { code: 'NPR' as Currency, name: 'Nepalese Rupee', symbol: '₨', flag: '🇳🇵' },
  
  // Americas
  { code: 'MXN' as Currency, name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'BRL' as Currency, name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'ARS' as Currency, name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  { code: 'CLP' as Currency, name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
  { code: 'COP' as Currency, name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  { code: 'PEN' as Currency, name: 'Peruvian Sol', symbol: 'S/', flag: '🇵🇪' },
  { code: 'UYU' as Currency, name: 'Uruguayan Peso', symbol: '$U', flag: '🇺🇾' },
  
  // Middle East & Africa
  { code: 'AED' as Currency, name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR' as Currency, name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'QAR' as Currency, name: 'Qatari Riyal', symbol: '﷼', flag: '🇶🇦' },
  { code: 'KWD' as Currency, name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'BHD' as Currency, name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭' },
  { code: 'OMR' as Currency, name: 'Omani Rial', symbol: '﷼', flag: '🇴🇲' },
  { code: 'JOD' as Currency, name: 'Jordanian Dinar', symbol: 'د.ا', flag: '🇯🇴' },
  { code: 'ILS' as Currency, name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
  { code: 'EGP' as Currency, name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬' },
  { code: 'ZAR' as Currency, name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'NGN' as Currency, name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'KES' as Currency, name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'GHS' as Currency, name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭' },
  { code: 'MAD' as Currency, name: 'Moroccan Dirham', symbol: 'د.م.', flag: '🇲🇦' },
  { code: 'TND' as Currency, name: 'Tunisian Dinar', symbol: 'د.ت', flag: '🇹🇳' },
];

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setInternalCurrency] = useState<Currency>('EUR');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(defaultExchangeRates);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  // Auto-detection of currency based on user location
  useEffect(() => {
    const detectAndSetCurrency = async () => {
      try {
        // Check if user already has a saved preference
        const savedCurrency = localStorage.getItem('preferred-currency') as Currency;
        const hasManualSelection = localStorage.getItem('manual-currency-selection');
        
        if (savedCurrency && currencySymbols[savedCurrency] && hasManualSelection) {
          setInternalCurrency(savedCurrency);
          return;
        }

        // Try multiple services to get currency directly from API
        const services = [
          {
            name: 'ipapi.co',
            url: 'https://ipapi.co/json/',
            getCurrency: (data: any) => data.currency,
            getCountry: (data: any) => data.country_code
          },
          {
            name: 'ipinfo.io',
            url: 'https://ipinfo.io/json',
            getCurrency: (data: any) => {
              // ipinfo doesn't provide currency, fallback to country mapping
              return countryCurrencyMap[data.country] || null;
            },
            getCountry: (data: any) => data.country
          },
          {
            name: 'cloudflare',
            url: 'https://cloudflare.com/cdn-cgi/trace',
            getCurrency: (data: any) => {
              // Parse cloudflare trace format
              const lines = data.split('\n');
              const locLine = lines.find((line: string) => line.startsWith('loc='));
              if (locLine) {
                const countryCode = locLine.split('=')[1];
                return countryCurrencyMap[countryCode] || null;
              }
              return null;
            },
            getCountry: (data: any) => {
              const lines = data.split('\n');
              const locLine = lines.find((line: string) => line.startsWith('loc='));
              return locLine ? locLine.split('=')[1] : null;
            }
          }
        ];

        for (const service of services) {
          try {
            const response = await fetch(service.url, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });
            
            if (!response.ok) {
              continue;
            }
            
            let data;
            if (service.name === 'cloudflare') {
              data = await response.text();
            } else {
              data = await response.json();
            }
            
            const countryCode = service.getCountry(data);
            if (countryCode) {
              setDetectedCountry(countryCode);
              
              // Try to get currency from API first
              let detectedCurrency = service.getCurrency(data);
              
              // If API doesn't provide currency or it's not in our supported list, use mapping
              if (!detectedCurrency || !currencySymbols[detectedCurrency as Currency]) {
                detectedCurrency = countryCurrencyMap[countryCode];
              }
              
              // Final check - make sure it's a supported currency
              if (detectedCurrency && currencySymbols[detectedCurrency as Currency]) {
                setInternalCurrency(detectedCurrency as Currency);
                localStorage.setItem('preferred-currency', detectedCurrency);
                return;
              }
            }
          } catch (error) {
            continue;
          }
        }

        setInternalCurrency('EUR');
        localStorage.setItem('preferred-currency', 'EUR');
      } catch (error) {
        setInternalCurrency('EUR');
        localStorage.setItem('preferred-currency', 'EUR');
      }
    };

    detectAndSetCurrency();
  }, []);

  // Save currency when user changes it
  useEffect(() => {
    if (currency) {
      localStorage.setItem('preferred-currency', currency);
    }
  }, [currency]);

  // Fetch exchange rates once
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        const data = await response.json();
        
        if (data.rates) {
          const updatedRates: Record<string, number> = { EUR: 1.0 };
          Object.keys(defaultExchangeRates).forEach(curr => {
            if (curr !== 'EUR') {
              updatedRates[curr] = data.rates[curr] || defaultExchangeRates[curr];
            }
          });
          setExchangeRates(updatedRates);
        }
      } catch (error) {
        // Use default exchange rates on error
      }
    };

    fetchRates();
  }, []);

  const convertPrice = (price: number): number => {
    const rate = exchangeRates[currency] || defaultExchangeRates[currency] || 1;
    return Math.round(price * rate * 100) / 100;
  };

  const getCurrencySymbol = (): string => {
    return currencySymbols[currency] || '€';
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency: (newCurrency: Currency, isManual: boolean = false) => {
      setInternalCurrency(newCurrency); // This calls the React state setter
      localStorage.setItem('preferred-currency', newCurrency);
      // Only set manual selection flag when user explicitly selects currency
      if (isManual) {
        localStorage.setItem('manual-currency-selection', 'true');
      }
    },
    exchangeRates,
    convertPrice,
    getCurrencySymbol,
    detectedCountry,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};