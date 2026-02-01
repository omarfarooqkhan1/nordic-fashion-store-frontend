import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { newsletterApi } from '@/api/newsletter';

interface NewsletterSubscriptionProps {
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
  source?: string;
}

export const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  className = "",
  showTitle = true,
  compact = false,
  source = 'website'
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Pre-fill form for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      setEmail(user.email || '');
      setName(user.name || '');
    }
  }, [isAuthenticated, user]);

  // Check subscription status when email changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!email || email.length < 5) return;
      
      setIsCheckingStatus(true);
      try {
        const status = await newsletterApi.checkStatus(email);
        setAlreadySubscribed(status.subscribed);
        if (status.subscribed) {
          setIsSubscribed(true);
        }
      } catch (error) {
        // Silently handle error - user might not be subscribed
        setAlreadySubscribed(false);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    const timeoutId = setTimeout(checkSubscriptionStatus, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    if (alreadySubscribed) {
      toast({
        title: 'Already Subscribed',
        description: 'This email is already subscribed to our newsletter.',
        variant: 'default',
      });
      return;
    }

    setIsLoading(true);

    try {
      await newsletterApi.subscribe({
        email,
        name: name || undefined,
        source
      });

      setIsSubscribed(true);
      setAlreadySubscribed(true);
      toast({
        title: 'Successfully Subscribed!',
        description: 'Thank you for subscribing to our newsletter.',
      });
      
      // Don't reset form for authenticated users
      if (!isAuthenticated) {
        setEmail('');
        setName('');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to subscribe to newsletter';
      toast({
        title: 'Subscription Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      await newsletterApi.unsubscribe(email);
      setIsSubscribed(false);
      setAlreadySubscribed(false);
      toast({
        title: 'Successfully Unsubscribed',
        description: 'You have been unsubscribed from our newsletter.',
      });
    } catch (error: any) {
      toast({
        title: 'Unsubscribe Failed',
        description: error.response?.data?.message || 'Failed to unsubscribe from newsletter',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed && alreadySubscribed) {
    return (
      <Card className={`${className} border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800`}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            Successfully Subscribed!
          </h3>
          <p className="text-green-700 dark:text-green-300 mb-4">
            Thank you for subscribing to our newsletter. You'll receive updates about our latest products and exclusive offers.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUnsubscribe}
            disabled={isLoading}
            className="text-green-700 border-green-300 hover:bg-green-100 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Unsubscribing...
              </>
            ) : (
              'Unsubscribe'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubscribe} className={`flex gap-2 ${className}`}>
        <div className="flex-1 relative">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${alreadySubscribed ? 'border-green-300 bg-green-50' : ''}`}
            disabled={isLoading || alreadySubscribed}
          />
          {isCheckingStatus && (
            <Loader2 className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || alreadySubscribed || isCheckingStatus} 
          className="shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : alreadySubscribed ? (
            'Subscribed ✓'
          ) : (
            'Subscribe'
          )}
        </Button>
      </form>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Subscribe to Our Newsletter
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <Label htmlFor="newsletter-name">Name (Optional)</Label>
            <Input
              id="newsletter-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading || (isAuthenticated && user?.name)}
            />
          </div>
          
          <div>
            <Label htmlFor="newsletter-email">Email Address *</Label>
            <div className="relative">
              <Input
                id="newsletter-email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || (isAuthenticated && user?.email)}
                required
                className={`${alreadySubscribed ? 'border-green-300 bg-green-50' : ''}`}
              />
              {isCheckingStatus && (
                <Loader2 className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            {alreadySubscribed && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <Check className="w-4 h-4" />
                This email is already subscribed
              </p>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Stay updated with our latest products, exclusive offers, and Nordic fashion trends.</p>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isLoading || alreadySubscribed || isCheckingStatus} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : alreadySubscribed ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Subscribed
                </>
              ) : (
                'Subscribe to Newsletter'
              )}
            </Button>
            {alreadySubscribed && (
              <Button 
                type="button"
                variant="outline" 
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Unsubscribe'
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};