import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider } from '@auth0/auth0-react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from '@/components/ErrorBoundary';
import PerformanceMonitor from '@/components/common/PerformanceMonitor';

// Context Providers
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

// Auth0 configuration
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || 'your-domain.auth0.com';
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'your_client_id';
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'https://your-domain.auth0.com/api/v2/';

// Create QueryClient outside component to ensure it's available
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Auth0Provider
                domain={auth0Domain}
                clientId={auth0ClientId}
                authorizationParams={{
                  redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL || `${window.location.origin}/auth/callback`,
                  audience: auth0Audience,
                }}
                cacheLocation="localstorage"
                useRefreshTokens={true}
                onRedirectCallback={(appState) => {
                  // Handle the callback and redirect to intended page
                  const returnTo = appState?.returnTo || window.location.pathname;
                  window.location.replace(returnTo);
                }}
              >
                <AuthProvider>
                  <CurrencyProvider>
                    <CartProvider>
                      <PerformanceMonitor enabled={import.meta.env.PROD} />
                      {children}
                    </CartProvider>
                  </CurrencyProvider>
                </AuthProvider>
              </Auth0Provider>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;
