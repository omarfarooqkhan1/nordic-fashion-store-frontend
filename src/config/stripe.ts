// Stripe configuration
export const STRIPE_CONFIG = {
  // Replace with your actual Stripe publishable key
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key_here',
  
  // Stripe appearance configuration
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#111111',
      colorBackground: '#ffffff',
      colorText: '#111111',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
  
  // Supported payment methods
  paymentMethods: ['card'],
  
  // Currency
  currency: 'eur',
  
  // Locale
  locale: 'en',
};

// Stripe Elements options
export const STRIPE_ELEMENTS_OPTIONS = {
  mode: 'payment',
  amount: 0, // Will be set dynamically
  currency: 'eur',
  appearance: STRIPE_CONFIG.appearance,
  paymentMethodCreation: 'manual',
};
