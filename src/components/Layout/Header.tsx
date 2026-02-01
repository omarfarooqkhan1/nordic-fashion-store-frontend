import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  ShoppingCart,
  Menu,
  User,
  Search,
  Phone,
  Mail,
  LogIn,
  UserPlus,
  Shield,
  LayoutDashboard,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/contexts/ThemeContext"
import { useLanguage, type Language } from "@/contexts/LanguageContext"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { useCurrency, type Currency } from "@/contexts/CurrencyContext"
import { useAuth0 } from "@auth0/auth0-react"

const languages: { code: Language; name: string; flag: string; defaultCurrency: Currency }[] = [
  { code: "en", name: "English", flag: "🇬🇧", defaultCurrency: "EUR" },
  { code: "fi", name: "Suomi", flag: "🇫🇮", defaultCurrency: "EUR" },
  { code: "sv", name: "Svenska", flag: "🇸🇪", defaultCurrency: "SEK" },
  { code: "no", name: "Norsk", flag: "🇳🇴", defaultCurrency: "NOK" },
  { code: "da", name: "Dansk", flag: "🇩🇰", defaultCurrency: "DKK" },
  { code: "is", name: "Íslenska", flag: "🇮🇸", defaultCurrency: "ISK" },
]

// Currency list for dropdown
const currencies = [
  { code: 'USD' as Currency, name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR' as Currency, name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP' as Currency, name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY' as Currency, name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'SEK' as Currency, name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK' as Currency, name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK' as Currency, name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'ISK' as Currency, name: 'Icelandic Krona', symbol: 'kr', flag: '🇮🇸' },
  { code: 'CAD' as Currency, name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD' as Currency, name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF' as Currency, name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY' as Currency, name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR' as Currency, name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'PKR' as Currency, name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'BDT' as Currency, name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'LKR' as Currency, name: 'Sri Lankan Rupee', symbol: '₨', flag: '🇱🇰' },
  { code: 'AED' as Currency, name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR' as Currency, name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'THB' as Currency, name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'MYR' as Currency, name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'SGD' as Currency, name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD' as Currency, name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'KRW' as Currency, name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'TWD' as Currency, name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'BRL' as Currency, name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN' as Currency, name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'ZAR' as Currency, name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'RUB' as Currency, name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'TRY' as Currency, name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
]

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { currency, setCurrency, detectedCountry } = useCurrency()
  const { items, customItems, getCartItemsCount } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Use our custom auth context
  const { user, isAuthenticated, isAdmin, isCustomer, logout, loading } = useAuth()

  // Keep Auth0 for Google login functionality
  const { loginWithRedirect } = useAuth0()

  const currentLanguage = languages.find((lang) => lang.code === language)
  const currentCurrency = currencies.find((curr) => curr.code === currency)

  // Compute cart count that will automatically update when cart data changes
  const cartCount = useMemo(() => {
    let totalCount = 0;
    // Count regular cart items
    if (Array.isArray(items) && items.length > 0) {
      totalCount += items.reduce((total, item) => total + (item?.quantity ?? 0), 0);
    }
    // Count custom jacket items
    const safeCustomItems = Array.isArray(customItems) ? customItems : [];
    if (safeCustomItems.length > 0) {
      totalCount += safeCustomItems.reduce((total, item) => total + (item?.quantity ?? 0), 0);
    }
    return totalCount;
  }, [items, customItems]);

  const categories = [
    { name: t("categories.bags"), path: "/products?category=bags" },
    { name: t("categories.wallets"), path: "/products?category=wallets" },
    { name: t("categories.belts"), path: "/products?category=belts" },
    { name: t("categories.jackets"), path: "/products?category=jackets" },
    { name: t("categories.accessories"), path: "/products?category=accessories" },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      // Close mobile menu if it's open
      if (mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
      // Close search modal
      setSearchModalOpen(false)
      // Clear search query after navigation
      setSearchQuery("")
    }
  }

  const handleCartClick = () => {
    // Scroll to top when navigating to cart
    window.scrollTo(0, 0)
  }

  const handleAuthClick = () => {
    // Scroll to top when navigating to auth pages
    window.scrollTo(0, 0)
  }

  const handleContactClick = () => {
    // Scroll to top when navigating to contact page
    window.scrollTo(0, 0)
  }

  const handleGoogleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
      },
    })
  }

  const handleLogout = () => {
    logout()
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      {/* Top Promotional Banner */}
      <div className="bg-primary text-primary-foreground py-1.5 sm:py-2 text-center text-xs sm:text-sm font-medium">
        <div className="container mx-auto px-2 sm:px-4 max-w-6xl">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{t("promo.freeShipping")}</span>
            <Separator orientation="vertical" className="h-3 sm:h-4 bg-primary-foreground/20 hidden xs:block" />
            <Mail className="h-3 w-3 flex-shrink-0 hidden xs:block" />
            <span className="hidden xs:inline truncate">{t("promo.support")}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        {/* Top Header Row */}
        <div className="container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 max-w-[1400px] xl:max-w-[1600px]">
          <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16">
            {/* Left Section - Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 group">
                <img
                  src="/logo.png"
                  alt="Nord Flex Logo"
                  className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain group-hover:scale-105 transition-transform duration-300 dark:brightness-0 dark:invert"
                />
                <div className="flex items-center space-x-0 xs:space-x-0.5 sm:space-x-1">
                  <div className="text-xs xs:text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                    NORD
                  </div>
                  <div className="text-xs xs:text-sm sm:text-lg md:text-xl lg:text-2xl font-light text-primary group-hover:text-primary/80 transition-colors duration-300">
                    FLEX
                  </div>
                </div>
              </Link>
            </div>

            {/* Center Section - Navigation & Custom Button */}
            <div className="flex items-center justify-center flex-1">
              {/* Desktop Layout */}
              <div className="hidden lg:flex items-center gap-4 xl:gap-6">
                <div className="flex items-center ml-8 xl:ml-12">
                  <Link
                    to="/products?gender=male"
                    className="text-sm xl:text-base font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap px-3 py-2 rounded-md hover:bg-accent/50"
                  >
                    {t('nav.shopMen')}
                  </Link>
                  <Link
                    to="/products?gender=female"
                    className="text-sm xl:text-base font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap px-3 py-2 rounded-md hover:bg-accent/50"
                  >
                    {t('nav.shopWomen')}
                  </Link>
                  <Link
                    to="/about"
                    className="text-sm xl:text-base font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap px-3 py-2 rounded-md hover:bg-accent/50"
                  >
                    {t('nav.ourStory')}
                  </Link>
                </div>
                <Link to="/custom-jacket" className="flex-shrink-0">
                  <Button
                    variant="default"
                    size="lg"
                    className="font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black dark:text-white shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-300 hover:border-yellow-500 whitespace-nowrap px-5 xl:px-6 py-2.5 xl:py-3 text-sm xl:text-base hover:scale-105 rounded-full"
                  >
                    Customize your Jacket
                  </Button>
                </Link>
              </div>

              {/* Tablet Layout */}
              <div className="hidden sm:flex lg:hidden items-center justify-center">
                <Link to="/custom-jacket" className="flex-shrink-0">
                  <Button
                    variant="default"
                    size="lg"
                    className="font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black dark:text-white shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-300 hover:border-yellow-500 whitespace-nowrap px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm hover:scale-105 rounded-full"
                  >
                    Customize your Jacket
                  </Button>
                </Link>
              </div>

              {/* Mobile Layout */}
              <div className="sm:hidden flex items-center justify-center">
                <Link to="/custom-jacket" className="flex-shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    className="font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black dark:text-white shadow-md hover:shadow-lg transition-all duration-300 border-2 border-yellow-300 hover:border-yellow-500 rounded-full text-xs px-2 xs:px-3 py-1 xs:py-1.5"
                  >
                    Customize your Jacket
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0 mr-2 lg:mr-4 xl:mr-6">
              {/* Desktop Search - Hidden on mobile, shown on desktop */}
              <div className="hidden lg:flex w-[200px] xl:w-[300px] 2xl:w-[400px] mx-1 xl:mx-2">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-background/50 backdrop-blur-sm border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-full h-8 xl:h-10 pl-3 xl:pl-4 shadow-sm hover:shadow-md text-xs xl:text-sm w-full"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 xl:h-8 xl:w-8 p-0 hover:bg-primary/10 rounded-full transition-colors"
                >
                  <Search className="h-3 w-3 xl:h-4 xl:w-4 text-muted-foreground hover:text-primary" />
                </Button>
              </form>
              </div>
              {/* Desktop Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 xl:h-10 xl:w-10 p-0 hidden md:flex rounded-full hover:bg-muted/50 transition-colors"
                    style={{
                      boxShadow: "none",
                      outline: "none",
                      border: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = "none"
                      e.target.style.outline = "none"
                      e.target.style.border = "none"
                    }}
                  >
                    <span className="text-xs sm:text-sm xl:text-lg">{currentLanguage?.flag}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border border-border w-48">
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Language</div>
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code)
                          setCurrency(lang.defaultCurrency)
                        }}
                        className="hover:bg-accent cursor-pointer"
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Desktop Currency Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 sm:h-8 xl:h-10 px-1 sm:px-2 xl:px-3 hidden md:flex rounded-full hover:bg-muted/50 transition-colors"
                    style={{
                      boxShadow: "none",
                      outline: "none",
                      border: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = "none"
                      e.target.style.outline = "none"
                      e.target.style.border = "none"
                    }}
                  >
                    <span className="text-xs xl:text-sm font-medium flex items-center gap-1">
                      {currentCurrency?.code}
                      {detectedCountry && (
                        <span className="text-green-500 text-xs">({detectedCountry})</span>
                      )}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border border-border w-64">
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      Currency
                      {detectedCountry && (
                        <span className="text-green-600 text-xs">
                          Auto-detected: {detectedCountry}
                        </span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {currencies.map((curr) => (
                        <DropdownMenuItem
                          key={curr.code}
                          onClick={() => {
                            setCurrency(curr.code, true) // Mark as manual selection
                            // Manual selection flag is now set in setCurrency
                          }}
                          className="hover:bg-accent cursor-pointer"
                        >
                          <span className="mr-2">{curr.flag}</span>
                          <span className="flex-1">{curr.name}</span>
                          <span className="text-xs text-muted-foreground">{curr.symbol}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Desktop Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-7 w-7 sm:h-8 sm:w-8 xl:h-10 xl:w-10 p-0 hidden md:flex rounded-full hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs sm:text-sm xl:text-base">{theme === "light" ? "🌙" : "☀️"}</span>
              </Button>

              {/* Search Icon for Mobile */}
              <Sheet open={searchModalOpen} onOpenChange={setSearchModalOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 xs:h-8 xs:w-8 p-0 md:hidden rounded-full hover:bg-muted/50 transition-colors"
                  >
                    <Search className="h-3 w-3 xs:h-4 xs:w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-auto">
                  <SheetHeader>
                    <SheetTitle>{t("search.title")}</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleSearch} className="mt-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={t("search.placeholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                        autoFocus
                      />
                      <Button type="submit" size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-3">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </SheetContent>
              </Sheet>


              {/* Cart - Only show for customers */}
              {!isAdmin && (
                <Link to="/cart" onClick={handleCartClick}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-7 w-7 xs:h-8 xs:w-8 p-0 rounded-full hover:bg-muted/50 transition-colors"
                  >
                    <ShoppingCart className="h-3 w-3 xs:h-4 xs:w-4" />
                    {cartCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1.5 -right-1.5 xs:-top-2 xs:-right-2 h-3.5 w-3.5 xs:h-4 xs:w-4 rounded-full p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground font-semibold"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}

              {/* Admin Dashboard - Only show if user is admin */}
              {isAdmin && (
                <Link to="/admin/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 p-0 rounded-full hover:bg-muted/50 transition-colors"
                    title={t("admin.dashboard")}
                  >
                    <LayoutDashboard className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </Button>
                </Link>
              )}

              {/* User Menu */}
              {loading ? (
                <div className="text-sm text-muted-foreground hidden sm:flex">{t("auth.loading")}</div>
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 sm:h-10 px-2 sm:px-3 hidden sm:flex rounded-full hover:bg-muted/50 transition-colors gap-1 sm:gap-2"
                    >
                      <span className="text-xs sm:text-sm font-medium">
                        {isAdmin ? "Admin" : "Profile"}
                      </span>
                      <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border border-border w-56">
                    <div className="px-4 py-2 text-sm">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            <Shield className="h-3 w-3" />
                            {t("admin.dashboard")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <DropdownMenuSeparator />

                    {isCustomer && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            {t("auth.profile")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/orders" className="flex items-center">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {t("nav.orders")}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-accent cursor-pointer text-red-600">
                      <LogIn className="mr-2 h-4 w-4" />
                      {t("auth.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login" onClick={handleAuthClick}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 sm:h-10 px-2 sm:px-3 hidden sm:flex rounded-full hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-medium">Login</span>
                  </Button>
                </Link>
              )}

              {/* Mobile Hamburger Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 xs:h-8 xs:w-8 p-0 md:hidden rounded-full hover:bg-muted/50 transition-colors border border-border flex-shrink-0"
                    aria-label={t("nav.menu")}
                  >
                    <Menu className="h-3 w-3 xs:h-4 xs:w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 [&>button]:hidden" aria-label={t("nav.menu")}>
                  <SheetHeader className="p-4">
                    <SheetTitle className="text-base font-bold">{t("nav.menu")}</SheetTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeMobileMenu}
                      className="h-8 w-8 p-0 absolute right-2 top-2"
                      aria-label={t("nav.close")}
                    >
                      ✕
                    </Button>
                  </SheetHeader>

                  <div className="px-3 pb-3">
                    {/* Custom Jacket Button */}
                    <div className="mb-3">
                      <Link to="/custom-jacket" onClick={closeMobileMenu} className="block">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg py-1.5 text-xs"
                        >
                          Customize your Leather Jacket
                        </Button>
                      </Link>
                    </div>

                    {/* Mobile Language & Currency Section */}
                    <div className="mb-3 p-2 bg-muted rounded-lg">
                      <div className="text-xs font-medium mb-2 text-muted-foreground flex items-center gap-2">
                        {t('nav.settings')}
                        {detectedCountry && (
                          <span className="text-green-600 text-xs">
                            {detectedCountry}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {/* Mobile Language Selector */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 h-7" aria-label={t('nav.settings')}>
                              <span className="mr-1 text-sm">{currentLanguage?.flag}</span>
                              <span className="text-xs">{currentLanguage?.name}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-popover border border-border min-w-[140px]">
                            {languages.map((lang) => (
                              <DropdownMenuItem
                                key={lang.code}
                                onClick={() => {
                                  setLanguage(lang.code)
                                  // Only change currency if user hasn't manually selected one
                                  const hasManualSelection = localStorage.getItem('manual-currency-selection');
                                  if (!hasManualSelection) {
                                    setCurrency(lang.defaultCurrency) // Don't mark as manual since it's automatic based on language
                                  }
                                }}
                                className="hover:bg-accent cursor-pointer"
                              >
                                <span className="mr-2 text-base">{lang.flag}</span>
                                <span className="text-sm">{lang.name}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile Theme Toggle */}
                        <Button variant="outline" size="sm" onClick={() => {
                          toggleTheme()
                          closeMobileMenu()
                        }} className="px-2 h-7" aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
                          <span className="text-sm">{theme === "light" ? "🌙" : "☀️"}</span>
                        </Button>
                      </div>
                      
                      {/* Mobile Currency Selector */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full h-7" aria-label="Select Currency">
                            <span className="mr-1 text-sm">{currentCurrency?.flag}</span>
                            <span className="text-xs flex-1 text-left">{currentCurrency?.name}</span>
                            <span className="text-xs text-muted-foreground">{currentCurrency?.symbol}</span>
                            {detectedCountry && (
                              <span className="text-green-500 text-xs ml-1">({detectedCountry})</span>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-popover border border-border w-64">
                          <div className="p-2">
                            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                              Currency
                              {detectedCountry && (
                                <span className="text-green-600 text-xs">
                                  Auto: {detectedCountry}
                                </span>
                              )}
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {currencies.map((curr) => (
                                <DropdownMenuItem
                                  key={curr.code}
                                  onClick={() => {
                                    setCurrency(curr.code, true) // Mark as manual selection
                                    // Manual selection flag is now set in setCurrency
                                    closeMobileMenu()
                                  }}
                                  className={`hover:bg-accent cursor-pointer ${
                                    curr.code === currency ? 'bg-accent' : ''
                                  }`}
                                >
                                  <span className="mr-2">{curr.flag}</span>
                                  <span className="flex-1 text-sm">{curr.name}</span>
                                  <span className="text-xs text-muted-foreground">{curr.symbol}</span>
                                </DropdownMenuItem>
                              ))}
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Separator className="my-2" />

                    {/* Mobile Auth Section */}
                    {loading ? (
                      <div className="p-1 text-xs text-muted-foreground">{t("auth.loading")}</div>
                    ) : isAuthenticated ? (
                      <div className="mb-3 p-2 bg-muted rounded-lg">
                        <div className="font-medium text-xs">{user?.name}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 text-blue-600">
                              <Shield className="mr-1 h-3 w-3" />
                              {t('admin.dashboard')}
                            </span>
                          ) : (
                            <span className="text-green-600">{t('auth.customerLogin')}</span>
                          )}
                        </div>
                        {isAdmin && (
                          <Link to="/admin/dashboard" onClick={closeMobileMenu}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-1 w-full text-blue-600 border-blue-200 hover:bg-blue-50 text-xs py-1"
                            >
                              <LayoutDashboard className="mr-1 h-3 w-3" />
                              {t('admin.dashboard')}
                            </Button>
                          </Link>
                        )}
                        <Button
                          onClick={() => {
                            handleLogout()
                            closeMobileMenu()
                          }}
                          variant="outline"
                          size="sm"
                          className="mt-1 w-full text-red-600 border-red-200 hover:bg-red-50 text-xs py-1"
                        >
                          {t('auth.logout')}
                        </Button>
                      </div>
                    ) : (
                      <div className="mb-3 space-y-1">
                        <Link to="/login" onClick={() => { closeMobileMenu(); handleAuthClick(); }}>
                          <Button variant="outline" size="sm" className="w-full text-xs py-1">
                            <LogIn className="mr-1 h-3 w-3" />
                            {t('auth.customerLogin')}
                          </Button>
                        </Link>
                        <Link to="/signup" onClick={() => { closeMobileMenu(); handleAuthClick(); }}>
                          <Button variant="outline" size="sm" className="w-full text-xs py-1">
                            <UserPlus className="mr-1 h-3 w-3" />
                            {t('auth.signup')}
                          </Button>
                        </Link>
                      </div>
                    )}

                    <Separator className="my-2" />

                    {/* Navigation Categories */}
                    <nav className="flex flex-col gap-0">
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          to={category.path}
                          onClick={closeMobileMenu}
                          className="block rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors duration-200"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </nav>

                    {/* Mobile Contact Link */}
                    <Link to="/contact" onClick={() => { closeMobileMenu(); handleContactClick(); }} className="flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors duration-200">
                      {t('nav.contact')}
                    </Link>

                    {/* Mobile Cart Link */}
                    {!isAdmin && (
                      <>
                        <Separator className="my-2" />
                        <Link to="/cart" onClick={() => { closeMobileMenu(); handleCartClick(); }} className="flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors duration-200">
                          <ShoppingCart className="h-3 w-3" />
                          {t('nav.cart')} {cartCount > 0 && `(${cartCount})`}
                        </Link>
                      </>
                    )}

                    {/* Mobile Profile Link for Customers */}
                    {!isAdmin && isAuthenticated && (
                      <Link to="/profile" onClick={closeMobileMenu} className="flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors duration-200">
                        <User className="h-3 w-3" />
                        {t('auth.profile')}
                      </Link>
                    )}

                    {/* Mobile Orders Link for Customers */}
                    {!isAdmin && isAuthenticated && (
                      <Link to="/orders" onClick={closeMobileMenu} className="flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors duration-200">
                        <ShoppingCart className="h-3 w-3" />
                        {t('nav.orders')}
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}