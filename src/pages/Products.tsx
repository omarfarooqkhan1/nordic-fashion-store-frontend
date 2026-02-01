import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { fetchProducts, type ProductFilters } from '@/api/products';
import { fetchCategories } from '@/api/admin';
import { LoadingState } from '@/components/common/LoadingState';

interface Category {
  id: number;
  name: string;
}

const Products = () => {
  const { t } = useLanguage();
  const { convertPrice, getCurrencySymbol, currency, exchangeRates } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [debouncedMinPrice, setDebouncedMinPrice] = useState<string>('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState<string>('');
  const [previousCurrency, setPreviousCurrency] = useState<string>(currency);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);

  const genders = ['all', 'male', 'female', 'unisex'];

  // Helper function to convert price from user currency to EUR (backend currency)
  const convertToBackendCurrency = (price: number): number => {
    const exchangeRate = exchangeRates[currency] || 1;
    // Use more precision for backend conversion to avoid filtering issues
    return Math.round((price / exchangeRate) * 10000) / 10000;
  };

  // Helper function to convert price from EUR to user currency
  const convertFromBackendCurrency = (price: number): number => {
    const exchangeRate = exchangeRates[currency] || 1;
    return Math.round((price * exchangeRate) * 100) / 100;
  };

  // Handle currency changes - convert existing price values
  useEffect(() => {
    if (previousCurrency !== currency && previousCurrency && (minPrice || maxPrice)) {
      const prevRate = exchangeRates[previousCurrency] || 1;
      const newRate = exchangeRates[currency] || 1;
      
      if (minPrice && minPrice.trim() !== '') {
        const minPriceNum = parseFloat(minPrice);
        if (!isNaN(minPriceNum)) {
          // Convert from previous currency to EUR, then to new currency
          const priceInEUR = minPriceNum / prevRate;
          const newPrice = Math.round(priceInEUR * newRate * 100) / 100;
          setMinPrice(newPrice.toString());
        }
      }
      
      if (maxPrice && maxPrice.trim() !== '') {
        const maxPriceNum = parseFloat(maxPrice);
        if (!isNaN(maxPriceNum)) {
          // Convert from previous currency to EUR, then to new currency
          const priceInEUR = maxPriceNum / prevRate;
          const newPrice = Math.round(priceInEUR * newRate * 100) / 100;
          setMaxPrice(newPrice.toString());
        }
      }
    }
    setPreviousCurrency(currency);
  }, [currency, exchangeRates, minPrice, maxPrice, previousCurrency]);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Scroll to top when component mounts or page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Sync URL params with state
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const genderParam = searchParams.get('gender');
    const searchParam = searchParams.get('search');
    const pageParam = searchParams.get('page');
    const minPriceParam = searchParams.get('min_price');
    const maxPriceParam = searchParams.get('max_price');
    const sortByParam = searchParams.get('sort_by');
    const sortOrderParam = searchParams.get('sort_order');

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (genderParam && genders.includes(genderParam)) {
      setSelectedGender(genderParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (pageParam) {
      setCurrentPage(parseInt(pageParam) || 1);
    }
    if (minPriceParam) {
      setMinPrice(minPriceParam);
      setDebouncedMinPrice(minPriceParam);
    }
    if (maxPriceParam) {
      setMaxPrice(maxPriceParam);
      setDebouncedMaxPrice(maxPriceParam);
    }
    if (sortByParam) {
      setSortBy(sortByParam);
    }
    if (sortOrderParam) {
      setSortOrder(sortOrderParam);
    }
  }, [searchParams]);

  // Debounce price inputs with validation
  useEffect(() => {
    const timer = setTimeout(() => {
      let validMinPrice = minPrice;
      let validMaxPrice = maxPrice;
      
      // Validate that min price is not greater than max price
      if (minPrice && maxPrice) {
        const minNum = parseFloat(minPrice);
        const maxNum = parseFloat(maxPrice);
        if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
          // If min > max, clear the max price to avoid confusion
          validMaxPrice = '';
          setMaxPrice('');
        }
      }
      
      setDebouncedMinPrice(validMinPrice);
      setDebouncedMaxPrice(validMaxPrice);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  // Update URL when debounced values change
  useEffect(() => {
    // Store price values in URL in user's currency for better UX
    const params: any = { page: 1 };
    
    if (debouncedMinPrice && debouncedMinPrice.trim() !== '') {
      params.min_price = debouncedMinPrice;
    }
    if (debouncedMaxPrice && debouncedMaxPrice.trim() !== '') {
      params.max_price = debouncedMaxPrice;
    }
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
    updateUrlParams(params);
  }, [debouncedMinPrice, debouncedMaxPrice]);

  // Build filters object
  const filters: ProductFilters = useMemo(() => {
    const filterObj: ProductFilters = {
      page: currentPage,
      per_page: perPage,
      sort_by: sortBy as 'name' | 'price' | 'created_at',
      sort_order: sortOrder as 'asc' | 'desc'
    };

    if (searchQuery) filterObj.search = searchQuery;
    if (selectedGender !== 'all') filterObj.gender = selectedGender;
    if (selectedCategory !== 'all') {
      const category = categories.find((cat: Category) => cat.name.toLowerCase() === selectedCategory.toLowerCase());
      if (category) filterObj.category_id = category.id;
    }
    
    // Convert price filters from user's currency back to EUR (base currency) for backend
    // Add small tolerance to account for currency conversion rounding
    if (debouncedMinPrice && debouncedMinPrice.trim() !== '') {
      const minPriceNum = parseFloat(debouncedMinPrice);
      if (!isNaN(minPriceNum) && minPriceNum > 0) {
        const convertedPrice = convertToBackendCurrency(minPriceNum);
        // Subtract small tolerance (0.01 EUR) to account for rounding
        filterObj.min_price = Math.max(0, convertedPrice - 0.01);
      }
    }
    if (debouncedMaxPrice && debouncedMaxPrice.trim() !== '') {
      const maxPriceNum = parseFloat(debouncedMaxPrice);
      if (!isNaN(maxPriceNum) && maxPriceNum > 0) {
        const convertedPrice = convertToBackendCurrency(maxPriceNum);
        // Add small tolerance (0.01 EUR) to account for rounding
        filterObj.max_price = convertedPrice + 0.01;
      }
    }

    return filterObj;
  }, [currentPage, perPage, sortBy, sortOrder, searchQuery, selectedGender, selectedCategory, categories, debouncedMinPrice, debouncedMaxPrice, currency, exchangeRates, convertToBackendCurrency]);

  // React Query hook to fetch products with filters
  const { data: productsResponse, isLoading, isError, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination;

  // Update URL params
  const updateUrlParams = (newParams: Record<string, string | number | undefined>) => {
    const urlParams = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all' || (key === 'page' && value === 1)) {
        urlParams.delete(key);
      } else {
        urlParams.set(key, value.toString());
      }
    });
    
    setSearchParams(urlParams);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedGender('all');
    setSortBy('name');
    setSortOrder('asc');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setDebouncedMinPrice('');
    setDebouncedMaxPrice('');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!pagination || pagination.last_page <= 1) return [];
    
    const items: (number | 'ellipsis')[] = [];
    const current = pagination.current_page;
    const total = pagination.last_page;
    
    // Always show first page
    items.push(1);
    
    if (current > 3) {
      items.push('ellipsis');
    }
    
    // Show pages around current page
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!items.includes(i)) {
        items.push(i);
      }
    }
    
    if (current < total - 2) {
      items.push('ellipsis');
    }
    
    // Always show last page if more than 1 page
    if (total > 1) {
      items.push(total);
    }
    
    return items;
  };

  // Filter content component for mobile
  const MobileFilterContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="grid grid-cols-1 gap-4">
      {/* Search Filter */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Search</Label>
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
            updateUrlParams({ search: e.target.value, page: 1 });
          }}
        />
      </div>

      {/* Category Filter */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Category</Label>
        <Select 
          value={selectedCategory} 
          onValueChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1);
            updateUrlParams({ category: value, page: 1 });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat: Category) => (
              <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender Filter */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Gender</Label>
        <Select 
          value={selectedGender} 
          onValueChange={(value) => {
            setSelectedGender(value);
            setCurrentPage(1);
            updateUrlParams({ gender: value, page: 1 });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="unisex">Unisex</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-2 gap-2">
        {/* Min Price Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Min Price ({getCurrencySymbol()})</Label>
          <Input
            type="number"
            placeholder={`${Math.round(convertPrice(50))}`}
            value={minPrice}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                setMinPrice(value);
              }
            }}
            min="0"
            step="0.01"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Max Price ({getCurrencySymbol()})</Label>
          <Input
            type="number"
            placeholder={`${Math.round(convertPrice(500))}`}
            value={maxPrice}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                setMaxPrice(value);
              }
            }}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Sort Filter */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Sort By</Label>
        <Select 
          value={`${sortBy}-${sortOrder}`} 
          onValueChange={(value) => {
            const [newSortBy, newSortOrder] = value.split('-');
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
            setCurrentPage(1);
            updateUrlParams({ sort_by: newSortBy, sort_order: newSortOrder, page: 1 });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
            <SelectItem value="created_at-desc">Newest First</SelectItem>
            <SelectItem value="created_at-asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      <Button 
        variant="outline" 
        onClick={() => {
          clearAllFilters();
          onClose?.();
        }}
        className="w-full"
      >
        <X className="w-4 h-4 mr-2" />
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-2 sm:px-4 py-0 sm:py-0 space-y-8">
      {/* Header */}
      <section className="text-center space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-leather-900 dark:text-leather-100">
          {searchQuery ? `Search Results for "${searchQuery}"` : t('products.title') || 'Our Products'}
        </h1>
        <p className="text-base sm:text-xl text-leather-700 dark:text-leather-200 max-w-xl sm:max-w-2xl mx-auto">
          {searchQuery
            ? `Found ${pagination?.total || 0} product${(pagination?.total || 0) !== 1 ? 's' : ''}`
            : t('common.discover') || 'Discover our premium collection'}
        </p>
      </section>

      {/* Filters */}
      {/* Desktop Filters - Original 6-column layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Search</Label>
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
                updateUrlParams({ search: e.target.value, page: 1 });
              }}
            />
          </div>

          {/* Category Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Category</Label>
            <Select 
              value={selectedCategory} 
              onValueChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
                updateUrlParams({ category: value, page: 1 });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat: Category) => (
                  <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Gender</Label>
            <Select 
              value={selectedGender} 
              onValueChange={(value) => {
                setSelectedGender(value);
                setCurrentPage(1);
                updateUrlParams({ gender: value, page: 1 });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Price Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Min Price ({getCurrencySymbol()})</Label>
            <Input
              type="number"
              placeholder={`${Math.round(convertPrice(50))}`}
              value={minPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  setMinPrice(value);
                }
              }}
              min="0"
              step="0.01"
            />
          </div>

          {/* Max Price Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Max Price ({getCurrencySymbol()})</Label>
            <Input
              type="number"
              placeholder={`${Math.round(convertPrice(500))}`}
              value={maxPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  setMaxPrice(value);
                }
              }}
              min="0"
              step="0.01"
            />
          </div>

          {/* Sort Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Sort By</Label>
            <Select 
              value={`${sortBy}-${sortOrder}`} 
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
                setCurrentPage(1);
                updateUrlParams({ sort_by: newSortBy, sort_order: newSortOrder, page: 1 });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Desktop Clear Filters Button */}
        {(searchQuery || selectedCategory !== 'all' || selectedGender !== 'all' || minPrice || maxPrice || sortBy !== 'name') && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Filter Button and Sheet */}
      <div className="lg:hidden flex items-center justify-between gap-4">
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {(searchQuery || selectedCategory !== 'all' || selectedGender !== 'all' || minPrice || maxPrice || sortBy !== 'name') && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  Active
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
              <SheetDescription>
                Refine your search to find the perfect products
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <MobileFilterContent onClose={() => setIsFilterOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile Sort - Quick access */}
        <div className="flex-1 max-w-[200px]">
          <Select 
            value={`${sortBy}-${sortOrder}`} 
            onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              setCurrentPage(1);
              updateUrlParams({ sort_by: newSortBy, sort_order: newSortOrder, page: 1 });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              <SelectItem value="created_at-desc">Newest First</SelectItem>
              <SelectItem value="created_at-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {pagination ? (
            <>
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} products
              {(debouncedMinPrice || debouncedMaxPrice) && (
                <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                  Price filter: {debouncedMinPrice && `${getCurrencySymbol()}${debouncedMinPrice}+`}{debouncedMinPrice && debouncedMaxPrice && ' - '}{debouncedMaxPrice && `${getCurrencySymbol()}${debouncedMaxPrice}`}
                </span>
              )}
            </>
          ) : (
            `${products.length} products`
          )}
        </p>
      </div>
      {/* Loading/Error */}
      {isLoading && <LoadingState message="Loading products..." className="py-12" />}
      {isError && <p className="text-center text-red-600">Error: {error?.message}</p>}

      {/* Product Grid */}
      {!isLoading && !isError && (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto px-2 sm:px-4 mb-12">
              {products.map((product: any) => (
                <Card
                  key={product.id}
                  className="bg-gradient-to-br from-card to-leather-100/50 dark:from-card dark:to-leather-800/30 border-border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group rounded-xl md:rounded-2xl"
                >
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-leather-200 to-leather-300 dark:from-leather-800 dark:to-leather-900 relative overflow-hidden">
                      {product.discount > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white z-10">
                          -{product.discount}%
                        </Badge>
                      )}
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt_text || product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      ) : product.variants && product.variants.length > 0 && product.variants[0].main_images && product.variants[0].main_images.length > 0 ? (
                        <img
                          src={product.variants[0].main_images[0].url}
                          alt={product.variants[0].main_images[0].alt_text || product.name}
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
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">{product.category?.name}</p>
                      </div>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                            if (!firstVariant) return <span className="text-lg font-bold text-cognac-500">N/A</span>;
                            const basePrice = firstVariant.price;
                            const discount = product.discount || 0;
                            const discountedPrice = basePrice * (1 - discount / 100);
                            if (discount > 0) {
                              return (
                                <>
                                  <span className="text-lg font-bold text-cognac-500">
                                    {getCurrencySymbol()}{Math.round(Number(convertPrice(discountedPrice)))}
                                  </span>
                                  <span className="text-sm text-muted-foreground line-through">{getCurrencySymbol()}{convertPrice(basePrice).toFixed(2)}</span>
                                </>
                              );
                            } else {
                              return <span className="text-lg font-bold text-cognac-500">{getCurrencySymbol()}{convertPrice(basePrice).toFixed(2)}</span>;
                            }
                          })()}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:border-primary/40"
                      >
                        <Link to={`/product/${product.id}`}>
                          {t('common.buyNow') || 'Buy Now'}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('products.noProductsFound') || 'No products found'}</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        const newPage = currentPage - 1;
                        setCurrentPage(newPage);
                        updateUrlParams({ page: newPage });
                      }
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {generatePaginationItems().map((item, index) => (
                  <PaginationItem key={index}>
                    {item === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(item as number);
                          updateUrlParams({ page: item });
                        }}
                        isActive={currentPage === item}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pagination.last_page) {
                        const newPage = currentPage + 1;
                        setCurrentPage(newPage);
                        updateUrlParams({ page: newPage });
                      }
                    }}
                    className={currentPage === pagination.last_page ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default Products;