"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AuthForm } from "@/components/common/AuthForm";

import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"


const CustomerLogin: React.FC = () => {

  const [error, setError] = useState("");
  const { t } = useLanguage();
  const { loginCustomer, loading } = useAuth();
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (data: { email: string; password: string }) => {
    setError("");
    try {
      await loginCustomer(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(t('toast.loginError'));
    }
  };

  const handleGoogleLogin = () => {
    const callbackUrl = `${window.location.origin}/auth/callback`;
    console.log('Auth0 callback URL:', callbackUrl);
    console.log('Window location origin:', window.location.origin);
    console.log('Full window location:', window.location.href);
    
    // Also log the Auth0 configuration
    console.log('Auth0 Domain:', import.meta.env.VITE_AUTH0_DOMAIN);
    console.log('Auth0 Client ID:', import.meta.env.VITE_AUTH0_CLIENT_ID);
    
    loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
        redirect_uri: callbackUrl, // Explicitly set the redirect URI
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Google Login Button */}
        <Button onClick={handleGoogleLogin} variant="outline" className="w-full mb-4" type="button">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t('auth.loginGoogle')}
        </Button>
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t('auth.email')}</span>
          </div>
        </div>
        <AuthForm
          title={t('auth.loginCustomer')}
          description={t('auth.login')}
          submitText={t('auth.login')}
          isLoading={loading}
          error={error}
          onSubmit={onSubmit}
        >
          <div className="text-center text-sm mt-4">
            <span className="text-muted-foreground">{t('auth.noAccount')} </span>
            <Link to="/signup" className="text-primary hover:underline font-medium">
              {t('auth.signup')}
            </Link>
            <div className="mt-2">
              <span className="text-muted-foreground">Forgot your password? </span>
              <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                Reset Here
              </Link>
            </div>
          </div>
        </AuthForm>
      </div>
    </div>
  )
}

export default CustomerLogin