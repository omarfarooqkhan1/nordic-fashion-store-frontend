import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, Users, Zap, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation } from '@tanstack/react-query';
import { newsletterApi, NewsletterSubscribeRequest } from '@/api/newsletter';
import { useToast } from '@/hooks/use-toast';

const Newsletter: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: (data: NewsletterSubscribeRequest) => newsletterApi.subscribe(data),
    onSuccess: (data) => {
      setIsSubscribed(true);
      
      let title = "Successfully Subscribed!";
      let description = "Welcome to the Nord Flex community. Check your email for confirmation.";
      
      if (data.status === 'already_subscribed') {
        title = "Already Subscribed";
        description = "This email is already subscribed to our newsletter. Thank you for being part of our community!";
      } else if (data.status === 'resubscribed') {
        title = "Welcome Back!";
        description = "You have been resubscribed to our newsletter. We're glad to have you back!";
      }
      
      toast({
        title,
        description,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    subscribeMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-leather-50 to-gold-50 dark:from-leather-900 dark:to-leather-800 py-12">
        <div className="container max-w-2xl">
          <Card className="text-center bg-gradient-to-br from-card to-leather-50/50 dark:from-card dark:to-leather-800/30 border-border shadow-xl">
            <CardHeader className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Welcome to Nord Flex!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground">
                Thank you for subscribing to our newsletter. You're now part of our exclusive community!
              </p>
              <div className="bg-leather-100/50 dark:bg-leather-800/50 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-3">What's Next?</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Check your email for a confirmation message</li>
                  <li>• Get exclusive access to new collections</li>
                  <li>• Receive special offers and discounts</li>
                  <li>• Stay updated with Nordic fashion trends</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = '/products'}
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-leather-900 font-semibold"
                >
                  Shop Now
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-leather-50 to-gold-50 dark:from-leather-900 dark:to-leather-800 py-12">
      <div className="container max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-10 w-10 text-leather-900" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Stay Connected with Nordic Fashion
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Be the first to know about new collections, exclusive offers, and Nordic fashion trends. 
            Join our community of style enthusiasts.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Subscription Form */}
          <Card className="bg-gradient-to-br from-card to-leather-50/50 dark:from-card dark:to-leather-800/30 border-border shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">
                Subscribe to Our Newsletter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={subscribeMutation.isPending}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={subscribeMutation.isPending}
                  />
                </div>

                <div className="bg-leather-100/50 dark:bg-leather-800/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Stay updated with our latest products, exclusive offers, and Nordic fashion trends.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={subscribeMutation.isPending}
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-leather-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe to Newsletter'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-leather-50/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Exclusive Early Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Be the first to shop new collections and limited edition items before they're available to the public.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-leather-50/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Special Offers & Discounts</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive exclusive discount codes, seasonal sales notifications, and subscriber-only promotions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-leather-50/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Style Community</h3>
                    <p className="text-sm text-muted-foreground">
                      Join our community of Nordic fashion enthusiasts and get styling tips, trend insights, and fashion inspiration.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-gold-200 bg-gold-50 dark:border-gold-800 dark:bg-gold-950">
              <AlertCircle className="h-4 w-4 text-gold-600" />
              <AlertDescription className="text-gold-700 dark:text-gold-400">
                <strong>Privacy Promise:</strong> We respect your privacy and will never share your email with third parties. 
                You can unsubscribe at any time.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;