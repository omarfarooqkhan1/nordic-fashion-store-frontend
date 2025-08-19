"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, Menu, User, Settings, Search, Heart, Phone, Mail, LogIn, UserPlus, Shield, LayoutDashboard } from "lucide-react"
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
import { useAuth0 } from "@auth0/auth0-react"

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
  { code: "no", name: "Norsk", flag: "🇳🇴" },
  { code: "da", name: "Dansk", flag: "🇩🇰" },
  { code: "fi", name: "Suomi", flag: "🇫🇮" },
  { code: "is", name: "Íslenska", flag: "🇮🇸" },
]

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { items, customItems, getCartItemsCount } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  // Use our custom auth context
  const { user, isAuthenticated, isAdmin, isCustomer, logout, loading } = useAuth()

  // Keep Auth0 for Google login functionality
  const { loginWithRedirect } = useAuth0()

  const currentLanguage = languages.find((lang) => lang.code === language)
  
  // Compute cart count that will automatically update when cart data changes
  const cartCount = useMemo(() => {
    let totalCount = 0;
    
    // Count regular cart items
    if (items && items.length > 0) {
      totalCount += items.reduce((total, item) => total + (item?.quantity ?? 0), 0);
    }
    
    // Count custom jacket items
    if (customItems && customItems.length > 0) {
      totalCount += customItems.reduce((total, item) => total + (item?.quantity ?? 0), 0);
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
    }
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

  return (
    <>
      {/* Top Promotional Banner */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{t("promo.freeShipping")}</span>
            <Separator orientation="vertical" className="h-4 bg-primary-foreground/20" />
            <Mail className="h-3 w-3" />
            <span>{t("promo.support")}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        {/* Top Header Row */}
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-wrap h-auto min-h-[64px] items-center justify-between gap-2 sm:gap-4 md:gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1 group flex-shrink-0">
              <div className="text-lg md:text-2xl font-bold text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                NORD
              </div>
              <div className="text-lg md:text-2xl font-light text-primary group-hover:text-primary/80 transition-colors duration-300">
                FLEX
              </div>
            </Link>

            {/* Custom Jacket Button */}
            <Link to="/custom-jacket" className="ml-0 sm:ml-6 flex-shrink-0">
              <Button variant="default" size="lg" className="font-semibold bg-yellow-400 text-leather-900 shadow-gold-200/40 shadow-md transition-transform border border-yellow-300 whitespace-nowrap px-2 sm:px-4 text-xs sm:text-base min-h-[36px] sm:min-h-[44px] hover:bg-yellow-500 hover:text-leather-900 hover:border-yellow-400">
                {t('customJacket.title')}
              </Button>
            </Link>
            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-2 sm:mx-6">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-muted/50 border-border focus:border-primary"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                >
                  <Search className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Button>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
              {/* Desktop Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hidden sm:flex">
                    <span className="text-lg">{currentLanguage?.flag}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border border-border">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className="hover:bg-accent"
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Desktop Theme Toggle */}
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-9 w-9 p-0 hidden sm:flex">
                {theme === "light" ? "🌙" : "☀️"}
              </Button>

              {/* Search Icon for Mobile */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden">
                    <Search className="h-4 w-4" />
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

              {/* Wishlist - Only show for customers */}
              {!isAdmin && (
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hidden sm:flex">
                  <Heart className="h-4 w-4" />
                </Button>
              )}

              {/* Cart - Only show for customers */}
              {!isAdmin && (
                <Link to="/cart">
                  <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground"
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
                                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0" title={t('admin.dashboard')}>
                    <LayoutDashboard className="h-4 w-4 text-blue-600" />
                  </Button>
                </Link>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hidden sm:flex">
                    {isAdmin ? <Shield className="h-4 w-4 text-blue-600" /> : <User className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border border-border w-56">
                  {loading ? (
                    <div className="p-2 text-sm text-muted-foreground">{t("auth.loading")}</div>
                  ) : isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 text-sm">
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 text-blue-600">
                              <Shield className="h-3 w-3" />
                              {t('admin.dashboard')}
                            </span>
                          ) : (
                            <span className="text-green-600">{t('auth.customerLogin')}</span>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />

                      {isCustomer && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to="/profile" className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              {t('auth.profile')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/orders" className="flex items-center">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              {t('nav.orders')}
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="hover:bg-accent cursor-pointer text-red-600">
                        <LogIn className="mr-2 h-4 w-4" />
                        {t("auth.logout")}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/login" className="flex items-center hover:bg-accent">
                          <LogIn className="mr-2 h-4 w-4" />
                          {t('auth.customerLogin')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/signup" className="flex items-center hover:bg-accent">
                          <UserPlus className="mr-2 h-4 w-4" />
                          {t('auth.signup')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleGoogleLogin} className="hover:bg-accent cursor-pointer">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        {t('auth.signInWithGoogle')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Hamburger Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SheetHeader className="p-4">
                    <SheetTitle>{t("nav.menu")}</SheetTitle>
                  </SheetHeader>

                  <div className="px-4 pb-4">
                    {/* Mobile Auth Section */}
                    {loading ? (
                      <div className="p-2 text-sm text-muted-foreground">{t("auth.loading")}</div>
                    ) : isAuthenticated ? (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <div className="font-medium text-sm">{user?.name}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {isAdmin ? (
                                                      <span className="inline-flex items-center gap-1 text-blue-600">
                            <Shield className="mr-2 h-4 w-4" />
                            {t('admin.dashboard')}
                          </span>
                        ) : (
                          <span className="text-green-600">{t('auth.customerLogin')}</span>
                        )}
                        </div>
                        {isAdmin && (
                          <Link to="/admin/dashboard">
                                                      <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            {t('admin.dashboard')}
                          </Button>
                          </Link>
                        )}
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {t('auth.logout')}
                        </Button>
                      </div>
                    ) : (
                      <div className="mb-4 space-y-2">
                        <Link to="/login">
                          <Button variant="outline" size="sm" className="w-full">
                            <LogIn className="mr-2 h-4 w-4" />
                            {t('auth.customerLogin')}
                          </Button>
                        </Link>
                        <Link to="/signup">
                          <Button variant="outline" size="sm" className="w-full">
                            <UserPlus className="mr-2 h-4 w-4" />
                            {t('auth.signup')}
                          </Button>
                        </Link>
                        <Button onClick={handleGoogleLogin} variant="outline" size="sm" className="w-full">
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                          </svg>
                          Google
                        </Button>
                      </div>
                    )}

                    <Separator className="my-4" />

                    {/* Navigation Categories */}
                    <nav className="flex flex-col gap-1">
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          to={category.path}
                          className="block rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-accent"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </nav>
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