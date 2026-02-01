import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { newsletterApi } from '@/api/newsletter';
import { useToast } from '@/hooks/use-toast';

interface CheckoutNewsletterSubscriptionProps {
  email: string;
  name?: string;
  onSubscriptionChange?: (subscribed: boolean) => void;
}

export const CheckoutNewsletterSubscription: React.FC<CheckoutNewsletterSubscriptionProps> = ({
  email,
  name,
  onSubscriptionChange
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [wasAlreadySubscribed, setWasAlreadySubscribed] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Check subscription status when email changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!email) {
        setIsCheckingStatus(false);
        return;
      }

      setIsCheckingStatus(true);
      setJustSubscribed(false); // Reset just subscribed state when email changes
      
      try {
        const status = await newsletterApi.checkStatus(email);
        if (status.subscribed) {
          setWasAlreadySubscribed(true);
          setIsSubscribed(true);
          onSubscriptionChange?.(true);
        } else {
          setWasAlreadySubscribed(false);
          setIsSubscribed(false);
        }
      } catch (error) {
        // If there's an error checking status, assume not subscribed
        setWasAlreadySubscribed(false);
        setIsSubscribed(false);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkSubscriptionStatus();
  }, [email, onSubscriptionChange]);

  const handleSubscriptionChange = async (checked: boolean) => {
    if (!email || wasAlreadySubscribed) return;

    setIsLoading(true);
    try {
      if (checked) {
        await newsletterApi.subscribe({
          email,
          name: name || (isAuthenticated ? user?.name : undefined),
          source: 'checkout'
        });
        
        setJustSubscribed(true);
        toast({
          title: 'Newsletter Subscription',
          description: 'You have been subscribed to our newsletter!',
        });
      } else {
        await newsletterApi.unsubscribe(email);
        
        setJustSubscribed(false);
        toast({
          title: 'Newsletter Subscription',
          description: 'You have been unsubscribed from our newsletter.',
        });
      }
      
      setIsSubscribed(checked);
      onSubscriptionChange?.(checked);
    } catch (error: any) {
      toast({
        title: 'Subscription Error',
        description: error.response?.data?.message || 'Failed to update newsletter subscription',
        variant: 'destructive',
      });
      // Revert the checkbox state on error
      setIsSubscribed(!checked);
      setJustSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything while checking status
  if (isCheckingStatus) {
    return (
      <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg border">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="flex items-center space-x-2 flex-1">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-muted-foreground">
            Checking newsletter subscription status...
          </Label>
        </div>
      </div>
    );
  }

  // If already subscribed (before user interaction), show a confirmation message
  if (wasAlreadySubscribed && !justSubscribed) {
    return (
      <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        <div className="flex items-center space-x-2 flex-1">
          <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
          <Label className="text-sm font-medium text-green-700 dark:text-green-300">
            You're already subscribed to our newsletter! 📧
          </Label>
        </div>
      </div>
    );
  }

  // Show subscription checkbox for non-subscribers or users who just subscribed
  return (
    <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg border">
      <Checkbox
        id="newsletter-subscription"
        checked={isSubscribed}
        onCheckedChange={handleSubscriptionChange}
        disabled={isLoading || !email}
      />
      <div className="flex items-center space-x-2 flex-1">
        <Mail className="w-4 h-4 text-muted-foreground" />
        <Label 
          htmlFor="newsletter-subscription" 
          className="text-sm font-medium cursor-pointer flex-1"
        >
          {justSubscribed 
            ? "✅ Subscribed to newsletter for exclusive offers and updates" 
            : "Subscribe to our newsletter for exclusive offers and updates"
          }
        </Label>
      </div>
      {isLoading && (
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
};