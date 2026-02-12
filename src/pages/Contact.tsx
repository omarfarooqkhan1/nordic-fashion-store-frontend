import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/axios';

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: t('contact.form.fillAll'),
        description: t('contact.form.allRequired'),
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await api.post('/contact', formData);
      
      if (response.data.success) {
        toast({
          title: t('contact.form.success'),
          description: response.data.message || t('contact.form.successDesc'),
          className: 'bg-green-500 text-white'
        });
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || t('contact.form.errorDesc');
      
      toast({
        title: t('contact.form.error'),
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-0 sm:py-0 space-y-12">
      {/* Hero Section */}
      <section className="relative py-10 sm:py-16 overflow-hidden bg-gradient-to-br from-leather-100 to-leather-200 dark:from-leather-900 dark:to-leather-800 rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-50/30 to-leather-100/20 dark:from-gold-900/20 dark:to-leather-800/30"></div>
        <div className="relative z-10 text-center space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-leather-900 dark:text-leather-100">
            {t('contact.title')}
          </h1>
          <p className="text-base sm:text-xl text-leather-700 dark:text-leather-200 max-w-xl sm:max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        {/* Contact Form */}
        <Card className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-2xl text-foreground">{t('contact.form.sendMessage')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('contact.form.firstName')}</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('contact.form.lastName')}</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('contact.form.email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                <Input 
                  id="subject" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t('contact.form.message')}</Label>
                <Textarea 
                  id="message" 
                  rows={6} 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-leather-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gold-400 hover:border-gold-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('contact.form.sending')}
                  </>
                ) : (
                  t('contact.form.send')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl text-foreground">{t('contact.visitStore')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2">{t('contact.address')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Nord Flex Co.<br />
                  Yliopistonkatu 25<br />
                  20100 , Finland
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2">{t('contact.hours')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('contact.hours.weekdays')}<br />
                  {t('contact.hours.saturday')}<br />
                  {t('contact.hours.sunday')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl text-foreground">{t('contact.getInTouch')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2">{t('contact.phone')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">+358 2 123 456 789</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2">{t('contact.email')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">support@nordflex.store</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2">{t('contact.customerService')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">support@nordflex.store</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;