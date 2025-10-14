import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'EUR' | 'USD' | 'SEK' | 'NOK' | 'DKK' | 'ISK';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: Record<Currency, number>;
  convertPrice: (price: number) => number;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates relative to EUR (base currency)
const defaultExchangeRates: Record<Currency, number> = {
  EUR: 1.0,
  USD: 1.08,
  SEK: 11.2,
  NOK: 11.8,
  DKK: 7.46,
  ISK: 149.5
};

const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  ISK: 'kr'
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(defaultExchangeRates);

  // Fetch real-time exchange rates (optional - can be disabled for performance)
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        // Using a free API for exchange rates
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        const data = await response.json();
        
        if (data.rates) {
          setExchangeRates({
            EUR: 1.0,
            USD: data.rates.USD || defaultExchangeRates.USD,
            SEK: data.rates.SEK || defaultExchangeRates.SEK,
            NOK: data.rates.NOK || defaultExchangeRates.NOK,
            DKK: data.rates.DKK || defaultExchangeRates.DKK,
            ISK: data.rates.ISK || defaultExchangeRates.ISK,
          });
        }
      } catch (error) {
        // Fallback to default rates if API fails
      }
    };

    // Only fetch once on mount to avoid too many API calls
    fetchExchangeRates();
  }, []);

  const convertPrice = (price: number): number => {
    const rate = exchangeRates[currency];
    return Math.round(price * rate * 100) / 100; // Round to 2 decimal places
  };

  const getCurrencySymbol = (): string => {
    return currencySymbols[currency];
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    exchangeRates,
    convertPrice,
    getCurrencySymbol,
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
