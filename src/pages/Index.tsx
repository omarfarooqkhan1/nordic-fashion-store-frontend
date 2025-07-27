import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Product } from '@/types/Product';
import { fetchProducts } from '@/api/products';

const Index = () => {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    '/lovable-uploads/731fa0a1-188d-4f8d-9829-7fde55e5e458.png',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1506629905814-b9daf261d74f?w=1200&h=800&fit=crop',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const featuredProducts = products.slice(0, 6);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Nordic leather craftsmanship ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium tracking-wider uppercase mb-4">
                  {t('hero.authentic')}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                {t('hero.title')}
                <span className="block text-3xl md:text-5xl lg:text-6xl mt-2 opacity-90">
                  {t('hero.from')}
                </span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto opacity-90 leading-relaxed">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-300">
                    {t('hero.explore')}
                  </Button>
                </Link>
                <Link to="/about">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white bg-black/20 hover:bg-white hover:text-black font-semibold px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300"
                  >
                    {t('hero.story')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            {t('common.featured')}
          </h2>

          {isLoading ? (
            <p className="text-center text-lg">{t('common.loading')}</p>
          ) : isError ? (
            <p className="text-center text-red-600 text-lg">{t('toast.error')}: {(error as Error).message}</p>
          ) : featuredProducts.length === 0 ? (
            <p className="text-center text-lg">{t('products.all')} - {t('cart.empty')}</p>
          ) : (
            <Carousel className="w-full max-w-5xl mx-auto" opts={{ align: 'start', loop: true }}>
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="bg-card border-border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                      <Link to={`/product/${product.id}`}>
                        <div className="aspect-square bg-muted relative overflow-hidden">
                          {product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.images[0].alt_text || product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <img 
                                src="/placeholder.svg" 
                                alt="No image available" 
                                className="w-full h-full object-cover opacity-50"
                              />
                            </div>
                          )}
                        </div>
                      </Link>
                      <CardContent className="p-6">
                        <Link to={`/product/${product.id}`}>
                          <div>
                            <h3 className="text-xl font-semibold mb-2 text-foreground hover:text-primary transition-colors">{product.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize mb-2">{product.category.name}</p>
                          </div>
                        </Link>
                        <p className="text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">€{product.price}</span>
                          </div>
                          <Button
                            variant="outline"
                            asChild
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                          >
                            <Link to={`/product/${product.id}`}>
                              {t('common.viewDetails')}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
              <CarouselNext className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
            </Carousel>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;