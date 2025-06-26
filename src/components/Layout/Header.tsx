import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, User, Settings, Search, Heart, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth0 } from '@auth0/auth0-react';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
];

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { getCartItemsCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

  const currentLanguage = languages.find(lang => lang.code === language);

  const categories = [
    { name: t('categories.bags'), path: '/products?category=bags' },
    { name: t('categories.wallets'), path: '/products?category=wallets' },
    { name: t('categories.belts'), path: '/products?category=belts' },
    { name: t('categories.jackets'), path: '/products?category=jackets' },
    { name: t('categories.accessories'), path: '/products?category=accessories' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top Promotional Banner */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{t('promo.freeShipping')}</span>
            <Separator orientation="vertical" className="h-4 bg-primary-foreground/20" />
            <Mail className="h-3 w-3" />
            <span>{t('promo.support')}</span>
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
                  placeholder={t('search.placeholder')}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0 hidden sm:flex"
              >
                {theme === 'light' ? '🌙' : '☀️'}
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
                    <SheetTitle>{t('search.title')}</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleSearch} className="mt-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={t('search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3"
                      >
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
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border border-border">
                  {isLoading ? (
                    <div className="p-2">{t('auth.loading')}</div>
                  ) : isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 text-sm">
                        {t('auth.hello')}, {user?.name ?? user?.email}
                      </div>
                      <DropdownMenuItem
                        onClick={() => logout({ returnTo: window.location.origin })}
                        className="hover:bg-accent cursor-pointer"
                      >
                        {t('auth.logout')}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => loginWithRedirect()}
                      className="hover:bg-accent cursor-pointer"
                    >
                      {t('auth.login')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center hover:bg-accent">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.admin')}
                    </Link>
                  </DropdownMenuItem>
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
                  <SheetHeader>
                    <SheetTitle>{t('nav.menu')}</SheetTitle>
                  </SheetHeader>

                  <nav className="flex flex-col gap-1 px-4">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.path}
                        className="block rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-accent"
                      >
                        {category.name}
                      </Link>
                    ))}

                    <Separator className="my-2" />

                    <Link
                      to="/admin"
                      className="flex items-center rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.admin')}
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};