"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, Menu, User, Settings, Search, Heart, Phone, Mail, LogIn, UserPlus, Shield } from "lucide-react"
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
  const { getCartItemsCount } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  // Use our custom auth context
  const { user, isAuthenticated, isAdmin, isCustomer, logout, loading } = useAuth()

  // Keep Auth0 for Google login functionality
  const { loginWithRedirect } = useAuth0()

  const currentLanguage = languages.find((lang) => lang.code === language)

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
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1 group">
              <div className="text-lg md:text-2xl font-bold text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                NORDIC
              </div>
              <div className="text-lg md:text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors duration-300">
                LEATHER
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
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
            <div className="flex items-center space-x-2">
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

              {/* Wishlist */}
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hidden sm:flex">
                <Heart className="h-4 w-4" />
              </Button>

              {/* Cart */}
              <Link to="/cart">
                <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
                  <ShoppingCart className="h-4 w-4" />
                  {getCartItemsCount() > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                    >
                      {getCartItemsCount()}
                    </Badge>
                  )}
                </Button>
              </Link>

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
                              Administrator
                            </span>
                          ) : (
                            <span className="text-green-600">Customer</span>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />

                      {isCustomer && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to="/profile" className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              My Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/orders" className="flex items-center">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              My Orders
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/dashboard" className="flex items-center">
                              <Settings className="mr-2 h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/products" className="flex items-center">
                              <Settings className="mr-2 h-4 w-4" />
                              Manage Products
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
                          Customer Login
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/signup" className="flex items-center hover:bg-accent">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Sign Up
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
                        Sign in with Google
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/login" className="flex items-center hover:bg-accent text-blue-600">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Login
                        </Link>
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
                              <Shield className="h-3 w-3" />
                              Administrator
                            </span>
                          ) : (
                            <span className="text-green-600">Customer</span>
                          )}
                        </div>
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="mb-4 space-y-2">
                        <Link to="/login">
                          <Button variant="outline" size="sm" className="w-full">
                            <LogIn className="mr-2 h-4 w-4" />
                            Customer Login
                          </Button>
                        </Link>
                        <Link to="/signup">
                          <Button variant="outline" size="sm" className="w-full">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Sign Up
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
                        <Link to="/admin/login">
                          <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Login
                          </Button>
                        </Link>
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

                      {isAdmin && (
                        <>
                          <Separator className="my-2" />
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center rounded-md px-2 py-1 text-sm font-medium text-blue-600 hover:bg-accent"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </>
                      )}
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