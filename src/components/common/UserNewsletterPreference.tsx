import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { newsletterApi } from '@/api/newsletter';
import { useToast } from '@/hooks/use-toast';

export const UserNewsletterPreference: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Load initial subscription status
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      if (!isAuthenticated || !user?.email) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const status = await newsletterApi.checkStatus(user.email);
        setIsSubscribed(status.subscribed);
      } catch (error) {
        // Silently handle error - user might not be subscribed
        setIsSubscribed(false);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadSubscriptionStatus();
  }, [isAuthenticated, user?.email]);

  const handlePreferenceChange = async (checked: boolean) => {
    if (!isAuthenticated || !user?.email) return;

    setIsLoading(true);
    try {
      await newsletterApi.updateUserPreference(checked);
      setIsSubscribed(checked);
      
      toast({
        title: 'Newsletter Preference Updated',
        description: checked 
          ? 'You have been subscribed to our newsletter!' 
          : 'You have been unsubscribed from our newsletter.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update newsletter preference',
        variant: 'destructive',
      });
      // Revert the switch state on error
      setIsSubscribed(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Newsletter Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="newsletter-preference" className="text-base font-medium">
              Email Newsletter
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive updates about new products, exclusive offers, and Nordic fashion trends.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(isInitialLoading || isLoading) && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id="newsletter-preference"
              checked={isSubscribed}
              onCheckedChange={handlePreferenceChange}
              disabled={isInitialLoading || isLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};