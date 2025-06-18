import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <div className="container mx-auto px-4 py-16 space-y-12">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-leather-100 to-leather-200 dark:from-leather-900 dark:to-leather-800 rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-50/30 to-leather-100/20 dark:from-gold-900/20 dark:to-leather-800/30"></div>
        <div className="relative z-10 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-leather-900 dark:text-leather-100">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-leather-700 dark:text-leather-200 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
         <Card className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={6} required />
              </div>
               <Button 
                 type="submit" 
                 className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-leather-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
               >
                {t('contact.form.send')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-8">
           <Card className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Visit Our Store</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Address</h3>
                <p className="text-muted-foreground">
                  Nordic Leather Co.<br />
                  Gamla Stan 15<br />
                  111 29 Stockholm, Sweden
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Hours</h3>
                <p className="text-muted-foreground">
                  Monday - Friday: 10:00 - 19:00<br />
                  Saturday: 10:00 - 17:00<br />
                  Sunday: 12:00 - 16:00
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                <p className="text-muted-foreground">+46 8 123 456 789</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground">info@nordicleather.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Customer Service</h3>
                <p className="text-muted-foreground">support@nordicleather.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;