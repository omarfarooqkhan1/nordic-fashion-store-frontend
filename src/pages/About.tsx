import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  const timelineEvents = [
    {
      year: "1892",
      title: t('about.timeline.1892.title'),
      description: t('about.timeline.1892.desc'),
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop"
    },
    {
      year: "1950",
      title: t('about.timeline.1950.title'),
      description: t('about.timeline.1950.desc'),
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop"
    },
    {
      year: "1985",
      title: t('about.timeline.1985.title'),
      description: t('about.timeline.1985.desc'),
      image: "https://images.unsplash.com/photo-1506629905814-b9daf261d74f?w=400&h=300&fit=crop"
    },
    {
      year: "2020",
      title: t('about.timeline.2020.title'),
      description: t('about.timeline.2020.desc'),
      image: "/lovable-uploads/731fa0a1-188d-4f8d-9829-7fde55e5e458.png"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-secondary/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=600&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            {t('about.hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-center text-foreground mb-16">{t('about.timeline.title')}</h2>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-secondary to-primary rounded-full"></div>
          
          {/* Timeline Events */}
          <div className="space-y-24">
            {timelineEvents.map((event, index) => (
              <div key={event.year} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg z-10"></div>
                
                {/* Content Card */}
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                  <Card className="bg-card border-border shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-muted', 'to-muted/50', 'flex', 'items-center', 'justify-center');
                          if (!e.currentTarget.parentElement?.querySelector('.placeholder-content')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'placeholder-content text-4xl text-muted-foreground';
                            placeholder.textContent = '📷';
                            e.currentTarget.parentElement?.appendChild(placeholder);
                          }
                        }}
                      />
                    </div>
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-primary">{event.year}</span>
                        <div className="h-px flex-1 bg-border"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">{event.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Year Badge on opposite side */}
                <div className={`w-5/12 ${index % 2 === 0 ? 'pl-12' : 'pr-12'} flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className="inline-flex items-center px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
                    <span className="text-sm font-medium text-primary">{t('about.timeline.established')} {event.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="space-y-12 pt-16">
        <h2 className="text-3xl font-bold text-center text-foreground">{t('about.values.title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-card to-secondary/20 border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">🏔️</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">{t('about.values.heritage.title')}</h3>
              <p className="text-muted-foreground">{t('about.values.heritage.desc')}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-card to-secondary/20 border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">♻️</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">{t('about.values.sustainability.title')}</h3>
              <p className="text-muted-foreground">{t('about.values.sustainability.desc')}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-card to-secondary/20 border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">{t('about.values.quality.title')}</h3>
              <p className="text-muted-foreground">{t('about.values.quality.desc')}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;