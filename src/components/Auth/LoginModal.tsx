import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AuthForm } from '@/components/common/AuthForm';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  title?: string;
  description?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  title = "Login Required",
  description = "Please log in to continue with this action."
}) => {
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const { loginCustomer, loading } = useAuth();
  const { loginWithRedirect } = useAuth0();
  const { toast } = useToast();

  const onSubmit = async (data: { email: string; password: string }) => {
    setError("");
    try {
      await loginCustomer(data.email, data.password);
      toast({
        title: t('toast.loginSuccess'),
        description: 'Welcome back!',
        className: 'bg-green-500 text-white'
      });
      onLoginSuccess?.();
      onClose();
    } catch (err: any) {
      setError(t('toast.loginError'));
    }
  };

  const handleGoogleLogin = () => {
    const callbackUrl = `${window.location.origin}/auth/callback`;
    
    loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
        redirect_uri: callbackUrl,
      },
    });
  };

  const handleLoginSuccess = () => {
    onLoginSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Google Login Button */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Login Form */}
          <AuthForm
            title=""
            description=""
            submitText="Sign In"
            isLoading={loading}
            error={error}
            onSubmit={onSubmit}
          >
            <div className="text-center text-sm mt-4">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link 
                to="/signup" 
                className="text-primary hover:underline font-medium"
                onClick={onClose}
              >
                Sign up
              </Link>
              <div className="mt-2">
                <span className="text-muted-foreground">Forgot your password? </span>
                <Link 
                  to="/forgot-password" 
                  className="text-primary hover:underline font-medium"
                  onClick={onClose}
                >
                  Reset here
                </Link>
              </div>
            </div>
          </AuthForm>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;

