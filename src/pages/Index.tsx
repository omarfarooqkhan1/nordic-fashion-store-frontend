"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"
import { useCurrency } from "@/contexts/CurrencyContext"
import { fetchProducts } from "@/api/products"
import { LoadingState } from "@/components/common/LoadingState"
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization"
import api from "@/api/axios"

const Index = () => {
  const { t } = useLanguage()
  const { convertPrice, getCurrencySymbol } = useCurrency()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { getQueryOptions, optimizeImageLoading } = usePerformanceOptimization()

  // Fetch hero images from API
  const { data: heroImages = [] } = useQuery({
    queryKey: ["hero-images"],
    queryFn: async () => {
      try {
        const response = await api.get("/hero-images")
        return response.data || []
      } catch (error) {
        // Return empty array on error, will fallback to static images
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fallback to static images if no dynamic images are available
  const fallbackHeroImages = [
    "/lovable-uploads/731fa0a1-188d-4f8d-9829-7fde55e5e458.png",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1506629905814-b9daf261d74f?w=1200&h=800&fit=crop",
  ]

  const displayHeroImages = (Array.isArray(heroImages) && heroImages.length > 0) ? heroImages : fallbackHeroImages

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % displayHeroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [displayHeroImages.length])

  const {
    data: productsResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts({ per_page: 12 }),
    ...getQueryOptions(5 * 60 * 1000, 10 * 60 * 1000), // 5 min stale, 10 min cache
  })

  const products = productsResponse?.data || []
  const featuredProducts = products.slice(0, 6)

  // Preload hero images for better LCP
  useEffect(() => {
    displayHeroImages.forEach((image, index) => {
      if (index === 0) {
        // Preload the first hero image for LCP
        const link = document.createElement("link")
        link.rel = "preload"
        link.as = "image"
        link.href = typeof image === 'string' ? image : image.image_url
        document.head.appendChild(link)
      }
    })
  }, [displayHeroImages])

  return (
    <div className="space-y-0 sm:space-y-0">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        {/* Mobile: aspect-ratio approach */}
        <div className="block sm:hidden w-full aspect-[16/9] relative">
          {displayHeroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={typeof image === 'string' ? image : `${import.meta.env.VITE_BACKEND_URL}${image.image_url}` || "/placeholder.svg"}
                alt={typeof image === 'string' ? `Nord Flex craftsmanship ${index + 1}` : image.alt_text || `Nord Flex craftsmanship ${index + 1}`}
                className="w-full h-full object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>
        </div>

        {/* Tablet and Desktop: viewport height approach */}
        <div className="hidden sm:block relative h-[60vh] min-h-[400px] md:h-[65vh] md:min-h-[450px] lg:h-[70vh] lg:min-h-[500px]">
          {displayHeroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={typeof image === 'string' ? image : `${import.meta.env.VITE_BACKEND_URL}${image.image_url}` || "/placeholder.svg"}
                alt={typeof image === 'string' ? `Nord Flex craftsmanship ${index + 1}` : image.alt_text || `Nord Flex craftsmanship ${index + 1}`}
                className="w-full h-full object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/60"></div>
        </div>

        <div className="absolute inset-0 z-10 flex items-start justify-center sm:items-center sm:pt-0">
          <div className="container mx-auto px-4 sm:px-6 -mt-2 sm:mt-0">
            <div className="max-w-2xl md:max-w-4xl mx-auto text-center text-white">
              <div className="mb-8 mt-5 sm:mt-12 md:mt-12 lg:mt-12">
                <span className="inline-block px-2 sm:px-3 sm:py-1 md:px-4 md:py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium tracking-wide uppercase mb-1 sm:mb-2 md:mb-3 lg:mb-4 border border-white/20">
                  {t("hero.authentic")}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-1 sm:mb-5 md:mb-4 lg:mb-6 leading-tight -mt-2 sm:mt-0">
                <span className="block text-balance">{t("hero.title")}</span>
                <span className="block text-sm sm:text-lg md:text-3xl lg:text-4xl xl:text-5xl mt-0.5 sm:mt-1 md:mt-2 opacity-90 font-medium">
                  {t("hero.from")}
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-2 sm:mb-4 md:mb-6 lg:mb-8 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto opacity-85 leading-relaxed text-pretty px-2 sm:px-0 -mt-1 sm:mt-0">
                {t("hero.description")}
              </p>
              <div className="hidden sm:flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-8 sm:mb-6">
                <Link to="/products" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 font-semibold px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-gray-300 rounded-xl"
                  >
                    {t("hero.explore")}
                  </Button>
                </Link>
                <Link to="/about" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-2 border-white/80 text-white bg-black/30 hover:bg-white hover:text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg backdrop-blur-md transition-all duration-300 rounded-xl hover:border-white"
                  >
                    {t("hero.story")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
            {displayHeroImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? "bg-white scale-110" : "bg-white/60 hover:bg-white/80"
                }`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8 text-foreground text-balance">
            {t("common.featured")}
          </h2>

          <div className="flex flex-col sm:hidden gap-2 mb-8 px-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/products?gender=male"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-2.5 px-2.5 rounded-xl transition-all duration-300 text-center text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] border border-amber-400/20"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-bold">{t("nav.shopMen")}</span>
                  <span className="text-xs opacity-90">Explore Collection</span>
                </div>
              </Link>
              <Link
                to="/products?gender=female"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-2.5 px-2.5 rounded-xl transition-all duration-300 text-center text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] border border-amber-400/20"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-bold">{t("nav.shopWomen")}</span>
                  <span className="text-xs opacity-90">Explore Collection</span>
                </div>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <LoadingState message={t("common.loading")} className="py-12" />
          ) : isError ? (
            <p className="text-center text-red-600 text-base sm:text-lg">
              {t("toast.error")}: {(error as Error).message}
            </p>
          ) : featuredProducts.length === 0 ? (
            <p className="text-center text-base sm:text-lg">
              {t("products.all")} - {t("cart.empty")}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto px-2 sm:px-4">
              {featuredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group rounded-xl md:rounded-2xl"
                >
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-leather-200 to-leather-300 dark:from-leather-800 dark:to-leather-900 relative overflow-hidden">
                      {product.images && product.images.length > 0 ? (
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
                  <CardContent className="p-4 md:p-6 space-y-3">
                    <Link to={`/product/${product.id}`}>
                      <div>
                        <h3 className="font-semibold text-foreground hover:text-cognac-500 transition-colors">
                          {product?.name || "Unnamed Product"}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {product?.category?.name || "Uncategorized"}
                        </p>
                      </div>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-cognac-500">
                            {getCurrencySymbol()}{convertPrice(product.variants && product.variants.length > 0 ? product.variants[0].price : 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:border-primary/40"
                      >
                        <Link to={`/product/${product.id}`}>
                          {t('common.buyNow')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Index
