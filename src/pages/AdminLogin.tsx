import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginAdmin, loading } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await loginAdmin(credentials.username, credentials.password);
      navigate('/admin');
    } catch (err: any) {
      // Error toast is now handled in AuthContext, but keep local error for form display
      setError(t('toast.loginError'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leather-100 to-leather-200 dark:from-leather-900 dark:to-leather-800 px-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-leather-900" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">{t('auth.loginAdmin')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.email')}</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder={t('auth.email')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder={t('auth.password')}
                required
              />
            </div>
            
            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-leather-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? t('common.loading') : t('auth.login')}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-leather-100/50 dark:bg-leather-800/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              {t('auth.loginAdmin')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;