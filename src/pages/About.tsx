import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

const About = () => {
  const { t } = useLanguage();

  const timelineEvents = [
    {
      year: "1892",
      title: t('about.timeline.1892.title'),
      description: t('about.timeline.1892.desc'),
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
      icon: "🏔️",
      color: "from-blue-500 to-cyan-500"
    },
    {
      year: "1950",
      title: t('about.timeline.1950.title'),
      description: t('about.timeline.1950.desc'),
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop",
      icon: "🧵",
      color: "from-green-500 to-emerald-500"
    },
    {
      year: "1985",
      title: t('about.timeline.1985.title'),
      description: t('about.timeline.1985.desc'),
      image: "https://images.unsplash.com/photo-1506629905814-b9daf261d74f?w=400&h=300&fit=crop",
      icon: "🌍",
      color: "from-purple-500 to-violet-500"
    },
    {
      year: "2020",
      title: t('about.timeline.2020.title'),
      description: t('about.timeline.2020.desc'),
      image: "/lovable-uploads/731fa0a1-188d-4f8d-9829-7fde55e5e458.png",
      icon: "💻",
      color: "from-orange-500 to-red-500"
    }
  ];

  const values = [
    {
      title: t('about.values.heritage.title'),
      description: t('about.values.heritage.desc'),
      icon: "🏔️",
      gradient: "from-slate-600 to-slate-800",
      bgGradient: "from-slate-50 to-slate-100"
    },
    {
      title: t('about.values.sustainability.title'),
      description: t('about.values.sustainability.desc'),
      icon: "♻️",
      gradient: "from-green-600 to-emerald-800",
      bgGradient: "from-green-50 to-emerald-100"
    },
    {
      title: t('about.values.quality.title'),
      description: t('about.values.quality.desc'),
      icon: "✨",
      gradient: "from-amber-600 to-yellow-800",
      bgGradient: "from-amber-50 to-yellow-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-2 sm:px-4 py-0 sm:py-0 space-y-16 sm:space-y-24">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 animate-pulse" />
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-20 animate-pulse delay-2000" />
          
          <div className="relative z-10 text-center space-y-6 sm:space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full border border-slate-200 dark:border-slate-600 shadow-lg">
              <span className="text-2xl mr-2">🏔️</span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Est. 1892</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent leading-tight">
              {t('about.hero.title')}
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t('about.hero.subtitle')}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Badge variant="outline" className="px-4 py-2 text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                Premium Quality
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                Nordic Heritage
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                Sustainable Fashion
              </Badge>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="space-y-12 sm:space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              {t('about.timeline.title')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              A journey through time, crafting excellence in Nordic fashion
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline Line - Enhanced */}
            <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 via-green-500 to-orange-500 rounded-full shadow-lg"></div>
            
            {/* Timeline Events */}
            <div className="space-y-16 sm:space-y-24">
              {timelineEvents.map((event, index) => (
                <div
                  key={event.year}
                  className={`relative flex flex-col sm:flex-row items-center ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'} group`}
                >
                  {/* Timeline Dot - Enhanced */}
                  <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 z-20">
                    <div className={`w-16 h-16 bg-gradient-to-br ${event.color} rounded-full border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                      {event.icon}
                    </div>
                  </div>
                  
                  {/* Content Card - Enhanced */}
                  <div className={`w-full sm:w-5/12 ${index % 2 === 0 ? 'sm:pr-16' : 'sm:pl-16'} mb-6 sm:mb-0`}>
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group-hover:scale-105">
                      <div className="aspect-video relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-20`} />
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-slate-100', 'to-slate-200', 'dark:from-slate-700', 'dark:to-slate-800', 'flex', 'items-center', 'justify-center');
                            if (!e.currentTarget.parentElement?.querySelector('.placeholder-content')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'placeholder-content text-6xl';
                              placeholder.textContent = event.icon;
                              e.currentTarget.parentElement?.appendChild(placeholder);
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <CardContent className="p-6 sm:p-8 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${event.color} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                            {event.icon}
                          </div>
                          <div className="flex-1">
                            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                              {event.year}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {event.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {event.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Year Badge - Enhanced */}
                  <div className={`w-full sm:w-5/12 ${index % 2 === 0 ? 'sm:pl-16' : 'sm:pr-16'} flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-4 sm:mb-0`}>
                    <div className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${event.color} rounded-2xl shadow-lg text-white font-semibold group-hover:shadow-xl transition-all duration-300`}>
                      <span className="text-sm">{t('about.timeline.established')} {event.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section - Enhanced */}
        <section className="space-y-12 sm:space-y-16 pt-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              {t('about.values.title')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              The principles that guide our craft and commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {values.map((value, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className={`absolute inset-0 bg-gradient-to-br ${value.bgGradient} dark:from-slate-800 dark:to-slate-900`} />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/20 dark:to-black/20" />
                
                <CardContent className="relative p-8 sm:p-10 text-center space-y-6 h-full flex flex-col justify-center">
                  <div className="relative">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${value.gradient} rounded-3xl mx-auto flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-500`}>
                      <span className="text-3xl sm:text-4xl">{value.icon}</span>
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {value.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
                    {value.description}
                  </p>
                  
                  <div className={`h-1 w-16 bg-gradient-to-r ${value.gradient} rounded-full mx-auto group-hover:w-24 transition-all duration-500`} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="text-center py-16 sm:py-20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl opacity-50" />
            <div className="relative p-8 sm:p-12 space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Ready to Experience Nordic Excellence?
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Discover our collection of premium Nordic fashion, crafted with over a century of expertise and passion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="/products" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 text-white dark:text-slate-900 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Explore Collection
                  <span className="ml-2">→</span>
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;