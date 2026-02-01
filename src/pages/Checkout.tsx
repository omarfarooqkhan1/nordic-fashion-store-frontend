import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Truck, Shield, ArrowLeft, MapPin, User, Loader2, Mail } from 'lucide-react';
import { createOrder } from '@/api/orders';
import { fetchUserAddresses, type Address } from '@/api/addresses';
import { createPaymentIntent } from '@/api/stripe';
import { STRIPE_CONFIG } from '@/config/stripe';
import { COUNTRIES, NORDIC_COUNTRIES as NORDIC_CODES, getCountryByCode, getCurrencyPrimaryCountry } from '@/utils/countries';
import { PhoneInput } from '@/components/common/PhoneInput';
import { CheckoutNewsletterSubscription } from '@/components/common';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '@/components/PaymentForm';

const Checkout: React.FC = () => {
  // Hooks and state initializations FIRST
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, customItems, getCartTotal, clearCartItems } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const { currency, convertPrice, getCurrencySymbol, detectedCountry } = useCurrency();
  const toast = useToast();
  
  // Stripe state
  const [stripePromise] = useState(() => loadStripe(STRIPE_CONFIG.publishableKey));
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [formData, setFormData] = useState<any>({
    shipping_name: isAuthenticated ? (user?.name || '') : '',
    shipping_email: isAuthenticated ? (user?.email || '') : '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: detectedCountry || 'FI',
    billing_same_as_shipping: true,
    billing_name: '',
    billing_email: isAuthenticated ? (user?.email || '') : '',
    billing_phone: '',
    billing_address: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_country: detectedCountry || 'FI',
    payment_method: 'card', // Default to card instead of stripe
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckoutFormValid, setIsCheckoutFormValid] = useState(false);
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [hasExistingAddresses, setHasExistingAddresses] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const { t } = useLanguage();
  
  // Create sorted countries list with Nordic countries first
  const sortedCountries = useMemo(() => {
    const nordicCountries = NORDIC_CODES.map(code => getCountryByCode(code)).filter(Boolean);
    const otherCountries = COUNTRIES.filter(country => !NORDIC_CODES.includes(country.code));
    const allCountries = [...nordicCountries, ...otherCountries];
    
    // Convert to searchable select format
    return allCountries.map(country => ({
      value: country.code,
      label: country.name,
      code: country.code,
      flag: country.flag
    }));
  }, []);

  const hasValidCart = (items && items.length > 0) || (customItems && customItems.length > 0);
  
  // Use useMemo to recalculate totals when cart changes, converting to user's currency
  const subtotal = React.useMemo(() => convertPrice(getCartTotal()), [items, customItems, getCartTotal, convertPrice]);
  const shipping = React.useMemo(() => subtotal > convertPrice(100) ? 0 : convertPrice(9.99), [subtotal, convertPrice]);
  const tax = React.useMemo(() => subtotal * 0.25, [subtotal]); // 25% VAT
  const total = React.useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax]);

  // Auto-switch to COD if Stripe fails - REMOVED since we're removing COD
  // useEffect(() => {
  //   if (clientSecret === 'failed' && (formData.payment_method === 'stripe' || formData.payment_method === 'paypal')) {
  //     handleInputChange('payment_method', 'cod');
  //   }
  // }, [clientSecret, formData.payment_method]);

  // Remove automatic payment intent creation - will create on order completion instead
  // useEffect(() => {
  //   const createPaymentIntentAutomatically = async () => {
  //     if (!hasValidCart || clientSecret) return; // Don't create if already exists
  //     
  //     try {
  //       const paymentIntent = await createPaymentIntent({
  //         amount: Math.round(total * 100), // Convert to cents
  //         currency: 'eur',
  //         customer_email: formData.shipping_email || user?.email || '',
  //         metadata: {
  //           cart_items: JSON.stringify(items?.map(item => ({
  //             product_name: item.variant?.product?.name,
  //             variant_size: item.variant?.size,
  //             variant_color: item.variant?.color,
  //             quantity: item.quantity,
  //             price: item.variant?.price || item.variant?.product?.price
  //           })) || []),
  //           custom_items: JSON.stringify(customItems?.map(item => ({
  //             name: item.name,
  //             color: item.color,
  //             size: item.size,
  //             quantity: item.quantity,
  //             price: item.price
  //           })) || [])
  //         }
  //       }, token);
  //       
  //       if (paymentIntent.client_secret) {
  //         setClientSecret(paymentIntent.client_secret);
  //         setPaymentIntentId(paymentIntent.payment_intent_id);
  //       }
  //     } catch (error) {
  ////       // Set a flag to indicate payment intent creation failed
  //       setClientSecret('failed');
  //       
  //       // Show a toast notification about the issue
  //       toast.toast({
  //         title: 'Payment Setup Issue',
  //         description: 'Online payment is temporarily unavailable. You can still place your order.',
  //         variant: 'default'
  //       });
  //     }
  //   };

  //   // Add a small delay to prevent immediate API calls
  //   const timer = setTimeout(createPaymentIntentAutomatically, 1000);
  //   return () => clearTimeout(timer);
  // }, [hasValidCart, total, formData.shipping_email, user?.email, token, items, customItems]); // Remove clientSecret from dependencies

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch user's saved addresses on mount if authenticated
  useEffect(() => {
    const loadAddresses = async () => {
      if (!isAuthenticated) return;
      setIsLoadingAddress(true);
      try {
        const addresses = await fetchUserAddresses();
        if (addresses && addresses.length > 0) {
          setHasExistingAddresses(true);
          setDefaultAddress(addresses[0]);
          setUseDefaultAddress(true);
          setFormData(prev => ({
            ...prev,
            shipping_name: addresses[0].name || user?.name || '',
            shipping_email: user?.email || '',
            shipping_phone: addresses[0].phone || '',
            shipping_address: addresses[0].street,
            shipping_city: addresses[0].city,
            shipping_state: addresses[0].state,
            shipping_postal_code: addresses[0].postal_code,
            shipping_country: addresses[0].country,
            billing_email: user?.email || '',
          }));
        } else {
          setHasExistingAddresses(false);
          setDefaultAddress(null);
          // For users without saved addresses, still preload their name
          if (user?.name) {
            setFormData(prev => ({
              ...prev,
              shipping_name: user.name,
            }));
          }
        }
      } catch (err) {
        setHasExistingAddresses(false);
        setDefaultAddress(null);
        // For users without saved addresses, still preload their name
        if (user?.name) {
          setFormData(prev => ({
            ...prev,
            shipping_name: user.name,
          }));
        }
      } finally {
        setIsLoadingAddress(false);
      }
    };
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.name]);

  // Update form data when detected country becomes available
  useEffect(() => {
    if (detectedCountry && (formData.shipping_country === 'FI' || !formData.shipping_country)) {
      setFormData(prev => ({
        ...prev,
        shipping_country: detectedCountry,
        billing_country: prev.billing_same_as_shipping ? detectedCountry : prev.billing_country,
      }));
    }
  }, [detectedCountry]);

  // Update country when currency changes (if user manually selects a different currency)
  useEffect(() => {
    const currencyCountry = getCurrencyPrimaryCountry(currency);
    // Only update if the current country doesn't match the currency and user hasn't manually changed the country
    if (currencyCountry && currencyCountry !== formData.shipping_country) {
      // Check if this is a manual currency change (not the initial auto-detection)
      const isManualCurrencyChange = localStorage.getItem('manual-currency-selection') === 'true';
      if (isManualCurrencyChange) {
        setFormData(prev => ({
          ...prev,
          shipping_country: currencyCountry,
          billing_country: prev.billing_same_as_shipping ? currencyCountry : prev.billing_country,
        }));
      }
    }
  }, [currency]);

  // Update email and name fields whenever user changes (only for authenticated users)
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        shipping_name: prev.shipping_name || user.name || '',
        shipping_email: user.email || '',
        billing_email: prev.billing_same_as_shipping ? (user.email || '') : prev.billing_email,
      }));
    }
  }, [user?.email, user?.name, isAuthenticated]);

  // Update form validity state whenever form data changes
  useEffect(() => {
    const isValid = checkFormValiditySilently();
    setIsCheckoutFormValid(isValid);
  }, [formData]);

  // Function to handle toggling between default and custom address
  const handleAddressToggle = (useDefault: boolean) => {
    setUseDefaultAddress(useDefault);
    if (useDefault && defaultAddress) {
      setFormData(prev => {
        const updated = {
          ...prev,
          shipping_name: defaultAddress.name || user?.name || '',
          shipping_phone: defaultAddress.phone || '',
          shipping_address: defaultAddress.street,
          shipping_city: defaultAddress.city,
          shipping_state: defaultAddress.state,
          shipping_postal_code: defaultAddress.postal_code,
          shipping_country: defaultAddress.country,
        };
        if (updated.billing_same_as_shipping) {
          updated.billing_name = updated.shipping_name;
          updated.billing_email = user?.email || '';
          updated.billing_phone = updated.shipping_phone;
          updated.billing_address = updated.shipping_address;
          updated.billing_city = updated.shipping_city;
          updated.billing_state = updated.shipping_state;
          updated.billing_postal_code = updated.shipping_postal_code;
          updated.billing_country = updated.shipping_country;
        }
        return updated;
      });
    } else {
      setFormData(prev => {
        const updated = {
          ...prev,
          shipping_name: user?.name || '',
          shipping_phone: '',
          shipping_address: '',
          shipping_city: '',
          shipping_state: '',
          shipping_postal_code: '',
          shipping_country: detectedCountry || 'FI',
        };
        if (updated.billing_same_as_shipping) {
          updated.billing_name = updated.shipping_name;
          updated.billing_email = user?.email || '';
          updated.billing_phone = updated.shipping_phone;
          updated.billing_address = updated.shipping_address;
          updated.billing_city = updated.shipping_city;
          updated.billing_state = updated.shipping_state;
          updated.billing_postal_code = updated.shipping_postal_code;
          updated.billing_country = updated.shipping_country;
        }
        return updated;
      });
    }
  };

  // Function to handle input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // If billing_same_as_shipping is checked, copy shipping info to billing
      if (field === 'billing_same_as_shipping' && value === true) {
        updated.billing_name = updated.shipping_name;
        updated.billing_email = user?.email || '';
        updated.billing_phone = updated.shipping_phone;
        updated.billing_address = updated.shipping_address;
        updated.billing_city = updated.shipping_city;
        updated.billing_state = updated.shipping_state;
        updated.billing_postal_code = updated.shipping_postal_code;
        updated.billing_country = updated.shipping_country;
      }
      
      // If shipping info is updated and billing_same_as_shipping is true, sync billing info
      if (updated.billing_same_as_shipping && typeof field === 'string' && field.startsWith('shipping_')) {
        const billingField = field.replace('shipping_', 'billing_');
        updated[billingField] = value;
      }
      
      return updated;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Function to validate checkout form
  const validateCheckoutForm = (): boolean => {
    const requiredFields = ['shipping_name', 'shipping_email', 'shipping_address', 'shipping_city', 'shipping_postal_code'];
    const newErrors: Record<string, string> = {};
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace('_', ' ')} is required`;
      }
    });

    // Validate email format
    if (formData.shipping_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.shipping_email)) {
      newErrors.shipping_email = 'Please enter a valid email address';
    }

    // If billing is separate, validate billing fields too
    if (!formData.billing_same_as_shipping) {
      const billingFields = ['billing_name', 'billing_email', 'billing_address', 'billing_city', 'billing_postal_code'];
      billingFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = `${field.replace('_', ' ')} is required`;
        }
      });

      if (formData.billing_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billing_email)) {
        newErrors.billing_email = 'Please enter a valid billing email address';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.toast({
        title: t('checkout.validationError'),
        description: t('checkout.validationErrorDesc'),
        variant: 'destructive'
      });
      return false;
    }

    // Clear any existing errors
    setErrors({});
    return true;
  };

  // Silent validation for button state (doesn't show errors)
  const checkFormValiditySilently = (): boolean => {
    const requiredFields = ['shipping_name', 'shipping_email', 'shipping_address', 'shipping_city', 'shipping_postal_code'];
    
    const isShippingValid = requiredFields.every(field => formData[field] && formData[field].trim() !== '');
    const isEmailValid = formData.shipping_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.shipping_email);
    
    if (!formData.billing_same_as_shipping) {
      const billingFields = ['billing_name', 'billing_email', 'billing_address', 'billing_city', 'billing_postal_code'];
      const isBillingValid = billingFields.every(field => formData[field] && formData[field].trim() !== '');
      const isBillingEmailValid = formData.billing_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billing_email);
      
      return isShippingValid && isEmailValid && isBillingValid && isBillingEmailValid;
    }
    
    return isShippingValid && isEmailValid;
  };

  // Handle successful Stripe payment
  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      // Now create the order after successful payment
      const orderData = {
        shipping_name: formData.shipping_name,
        shipping_email: formData.shipping_email,
        shipping_phone: formData.shipping_phone,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_state: formData.shipping_state,
        shipping_postal_code: formData.shipping_postal_code,
        shipping_country: formData.shipping_country,
        billing_same_as_shipping: formData.billing_same_as_shipping,
        billing_name: formData.billing_same_as_shipping ? formData.shipping_name : formData.billing_name,
        billing_email: formData.billing_same_as_shipping ? formData.shipping_email : formData.billing_email,
        billing_phone: formData.billing_same_as_shipping ? formData.shipping_phone : formData.billing_phone,
        billing_address: formData.billing_same_as_shipping ? formData.shipping_address : formData.billing_address,
        billing_city: formData.billing_same_as_shipping ? formData.shipping_city : formData.billing_city,
        billing_state: formData.billing_same_as_shipping ? formData.shipping_state : formData.billing_state,
        billing_postal_code: formData.billing_same_as_shipping ? formData.shipping_postal_code : formData.billing_postal_code,
        billing_country: formData.billing_same_as_shipping ? formData.shipping_country : formData.billing_country,
        payment_method: (formData.payment_method === 'card' ? 'credit_card' : 'paypal') as 'credit_card' | 'paypal',
        currency: currency,
        // Include calculated totals in user's selected currency
        calculated_subtotal: subtotal,
        calculated_tax: tax,
        calculated_shipping: shipping,
        calculated_total: total,
        notes: `Estimated shipping time: 7-14 business days\nStripe Payment Intent: ${paymentIntentId}`
      };

      const result = await createOrder(orderData, token);
      
      toast.toast({
        title: 'Payment Successful!',
        description: 'Your order has been placed successfully',
        className: 'bg-green-500 text-white'
      });
      
      // Clear cart and redirect to order confirmation
      await clearCartItems();
      
      // Force cart state refresh to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['customJacketCart'] });
      
      // Small delay to ensure cart clearing completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate(`/orders/${result.order.id}`, { 
        state: { 
          fromCheckout: true, 
          orderData: result.order 
        } 
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      toast.toast({
        title: 'Error',
        description: `Payment succeeded but there was an error creating your order: ${errorMessage}`,
        variant: 'destructive'
      });
    }
  };

  // Handle Stripe payment error
  const handlePaymentError = (error: string) => {
    toast.toast({
      title: 'Payment Failed',
      description: error,
      variant: 'destructive'
    });
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-10 md:py-12">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/cart')}
        className="mb-4 sm:mb-6 hover:bg-accent text-base sm:text-lg"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('checkout.backToCart')}
      </Button>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 md:gap-10 lg:gap-12">
        {/* Checkout Form */}
        <div className="space-y-5 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">{t('checkout.title')}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">{t('checkout.subtitle')}</p>
          </div>

          {/* Guest Mode Toggle */}
          {!isAuthenticated && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <User className="h-5 w-5 text-amber-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-amber-800">{t('checkout.guestCheckout')}</h3>
                    <p className="text-sm text-amber-700">
                      {t('checkout.guestHint')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/signup', { state: { returnTo: '/checkout' } })}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    {t('auth.signup')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-5 sm:space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <Truck className="h-5 w-5" />
                  {t('checkout.shippingInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Info about no saved addresses for authenticated users */}
                {!hasExistingAddresses && isAuthenticated && !isLoadingAddress && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('checkout.firstTime')}</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      {t('checkout.addressSavedInfo')}
                    </p>
                  </div>
                )}

                {/* Loading state for addresses */}
                {isLoadingAddress && isAuthenticated && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold-500"></div>
                      <span className="text-sm">{t('checkout.loadingAddresses')}</span>
                    </div>
                  </div>
                )}

                {/* Address Toggle - Only show if user has a default address and is not in guest mode */}
                {defaultAddress && !isLoadingAddress && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                      <Checkbox
                        id="use_default_address"
                        checked={useDefaultAddress}
                        onCheckedChange={handleAddressToggle}
                        disabled={isLoadingAddress}
                      />
                      <Label htmlFor="use_default_address" className="flex items-center gap-2 cursor-pointer">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{t('checkout.useSavedAddress')}</span>
                      </Label>
                    </div>
                    {useDefaultAddress && (
                      <div className="ml-0 sm:ml-6 text-sm text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="font-medium text-blue-800">{defaultAddress.label}</p>
                        <p className="text-blue-700">{defaultAddress.street}</p>
                        <p className="text-blue-700">{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postal_code}</p>
                        <p className="text-blue-700">{defaultAddress.country}</p>
                      </div>
                    )}
                    {!useDefaultAddress && (
                      <p className="ml-0 sm:ml-6 text-sm text-muted-foreground">
                        {t('checkout.uncheckToEnterDifferent')}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping_name">{t('checkout.fullName')} *</Label>
                    <Input
                      id="shipping_name"
                      value={formData.shipping_name}
                      onChange={(e) => handleInputChange('shipping_name', e.target.value)}
                      className={`${errors.shipping_name ? 'border-red-500' : ''} ${useDefaultAddress && defaultAddress ? 'bg-muted text-muted-foreground' : ''}`}
                      disabled={useDefaultAddress && !!defaultAddress}
                    />
                    {errors.shipping_name && <p className="text-sm text-red-500">{errors.shipping_name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="shipping_email">{t('checkout.email')} *</Label>
                    <Input
                      id="shipping_email"
                      type="email"
                      value={formData.shipping_email}
                      onChange={(e) => handleInputChange('shipping_email', e.target.value)}
                      className={errors.shipping_email ? 'border-red-500' : ''}
                      placeholder={user?.email || t('checkout.emailPlaceholder') || 'Enter your email address'}
                    />
                    {errors.shipping_email && <p className="text-sm text-red-500">{errors.shipping_email}</p>}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="shipping_address">{t('checkout.address')} *</Label>
                  <Input
                    id="shipping_address"
                    value={formData.shipping_address}
                    onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                    className={`${errors.shipping_address ? 'border-red-500' : ''} ${useDefaultAddress && defaultAddress ? 'bg-muted text-muted-foreground' : ''}`}
                    disabled={useDefaultAddress && !!defaultAddress}
                  />
                  {errors.shipping_address && <p className="text-sm text-red-500">{errors.shipping_address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping_city">{t('checkout.city')} *</Label>
                    <Input
                      id="shipping_city"
                      value={formData.shipping_city}
                      onChange={(e) => handleInputChange('shipping_city', e.target.value)}
                      className={`${errors.shipping_city ? 'border-red-500' : ''} ${useDefaultAddress && defaultAddress ? 'bg-muted text-muted-foreground' : ''}`}
                      disabled={useDefaultAddress && !!defaultAddress}
                    />
                    {errors.shipping_city && <p className="text-sm text-red-500">{errors.shipping_city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="shipping_state">{t('checkout.state')}</Label>
                    <Input
                      id="shipping_state"
                      value={formData.shipping_state}
                      onChange={(e) => handleInputChange('shipping_state', e.target.value)}
                      placeholder=""
                      className={useDefaultAddress && defaultAddress ? 'bg-muted text-muted-foreground' : ''}
                      disabled={useDefaultAddress && !!defaultAddress}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping_postal_code">{t('checkout.postalCode')} *</Label>
                    <Input
                      id="shipping_postal_code"
                      value={formData.shipping_postal_code}
                      onChange={(e) => handleInputChange('shipping_postal_code', e.target.value)}
                      className={`${errors.shipping_postal_code ? 'border-red-500' : ''} ${useDefaultAddress && defaultAddress ? 'bg-muted text-muted-foreground' : ''}`}
                      disabled={useDefaultAddress && !!defaultAddress}
                    />
                    {errors.shipping_postal_code && <p className="text-sm text-red-500">{errors.shipping_postal_code}</p>}
                  </div>
                  <div>
                    <Label htmlFor="shipping_country">{t('checkout.country')} *</Label>
                    <SearchableSelect
                      options={sortedCountries}
                      value={formData.shipping_country}
                      onValueChange={(value) => handleInputChange('shipping_country', value)}
                      placeholder={t('checkout.selectCountry')}
                      searchPlaceholder="Search countries..."
                      disabled={useDefaultAddress && !!defaultAddress}
                      className={useDefaultAddress && defaultAddress ? 'bg-muted text-muted-foreground' : ''}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shipping_phone">{t('checkout.phone')}</Label>
                  <PhoneInput
                    value={formData.shipping_phone}
                    onChange={(value) => handleInputChange('shipping_phone', value)}
                    placeholder={t('checkout.phone')}
                    disabled={useDefaultAddress && !!defaultAddress}
                    defaultCountry={formData.shipping_country}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('checkout.billingInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="billing_same"
                    checked={formData.billing_same_as_shipping}
                    onCheckedChange={(checked) => handleInputChange('billing_same_as_shipping', checked as boolean)}
                  />
                  <Label htmlFor="billing_same">{t('checkout.sameAsShipping')}</Label>
                </div>

                {!formData.billing_same_as_shipping && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billing_name">{t('checkout.fullName')} *</Label>
                        <Input
                          id="billing_name"
                          value={formData.billing_name}
                          onChange={(e) => handleInputChange('billing_name', e.target.value)}
                          className={errors.billing_name ? 'border-red-500' : ''}
                        />
                        {errors.billing_name && <p className="text-sm text-red-500">{errors.billing_name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billing_email">{t('checkout.email')} *</Label>
                        <Input
                          id="billing_email"
                          type="email"
                          value={formData.billing_email}
                          onChange={(e) => handleInputChange('billing_email', e.target.value)}
                          className={errors.billing_email ? 'border-red-500' : ''}
                          disabled={formData.billing_same_as_shipping}
                          placeholder={formData.billing_same_as_shipping ? 'Same as shipping email' : 'Enter billing email'}
                        />
                        {errors.billing_email && <p className="text-sm text-red-500">{errors.billing_email}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billing_phone">{t('checkout.phone')}</Label>
                        <PhoneInput
                          value={formData.billing_phone}
                          onChange={(value) => handleInputChange('billing_phone', value)}
                          placeholder={t('checkout.phone')}
                          disabled={formData.billing_same_as_shipping}
                          defaultCountry={formData.billing_country}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="billing_address">{t('checkout.address')} *</Label>
                      <Input
                        id="billing_address"
                        value={formData.billing_address}
                        onChange={(e) => handleInputChange('billing_address', e.target.value)}
                        className={errors.billing_address ? 'border-red-500' : ''}
                      />
                      {errors.billing_address && <p className="text-sm text-red-500">{errors.billing_address}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billing_city">{t('checkout.city')} *</Label>
                        <Input
                          id="billing_city"
                          value={formData.billing_city}
                          onChange={(e) => handleInputChange('billing_city', e.target.value)}
                          className={errors.billing_city ? 'border-red-500' : ''}
                        />
                        {errors.billing_city && <p className="text-sm text-red-500">{errors.billing_city}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billing_state">{t('checkout.state')}</Label>
                        <Input
                          id="billing_state"
                          value={formData.billing_state}
                          onChange={(e) => handleInputChange('billing_state', e.target.value)}
                          placeholder=""
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billing_postal_code">{t('checkout.postalCode')} *</Label>
                        <Input
                          id="billing_postal_code"
                          value={formData.billing_postal_code}
                          onChange={(e) => handleInputChange('billing_postal_code', e.target.value)}
                          className={errors.billing_postal_code ? 'border-red-500' : ''}
                        />
                        {errors.billing_postal_code && <p className="text-sm text-red-500">{errors.billing_postal_code}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billing_country">{t('checkout.country')} *</Label>
                        <SearchableSelect
                          options={sortedCountries}
                          value={formData.billing_country}
                          onValueChange={(value) => handleInputChange('billing_country', value)}
                          placeholder="Select country"
                          searchPlaceholder="Search countries..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Newsletter Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Newsletter Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CheckoutNewsletterSubscription
                  email={formData.shipping_email}
                  name={formData.shipping_name}
                  onSubscriptionChange={(subscribed) => {
                    // Optional: You can track the subscription state if needed
                  }}
                />
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('checkout.paymentInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('checkout.paymentMethod')}</Label>
                  <RadioGroup
                    value={formData.payment_method}
                    onValueChange={(value) => handleInputChange('payment_method', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">
                        PayPal
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Card Payment - Show immediately without waiting for payment intent */}
                {formData.payment_method === 'card' && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      {stripePromise ? (
                        <Elements 
                          stripe={stripePromise}
                          options={{
                            // Don't pass clientSecret here since we'll create it on submit
                            appearance: {
                              theme: 'stripe',
                            },
                          }}
                        >
                          <PaymentForm 
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentError={handlePaymentError}
                            clientSecret={clientSecret} // Will be empty initially
                            paymentMethod="card"
                            validateForm={validateCheckoutForm}
                            isCheckoutFormValid={isCheckoutFormValid}
                            billingDetails={{
                              name: formData.billing_same_as_shipping ? formData.shipping_name : formData.billing_name,
                              email: formData.billing_same_as_shipping ? formData.shipping_email : formData.billing_email,
                              address: {
                                line1: formData.billing_same_as_shipping ? formData.shipping_address : formData.billing_address,
                                city: formData.billing_same_as_shipping ? formData.shipping_city : formData.billing_city,
                                state: formData.billing_same_as_shipping ? formData.shipping_state : formData.billing_state,
                                postal_code: formData.billing_same_as_shipping ? formData.shipping_postal_code : formData.billing_postal_code,
                                country: formData.billing_same_as_shipping ? formData.shipping_country : formData.billing_country,
                              }
                            }}
                            isCreatingPaymentIntent={isCreatingPaymentIntent}
                            onCreatePaymentIntent={async () => {
                              setIsCreatingPaymentIntent(true);
                              try {
                                const paymentIntent = await createPaymentIntent({
                                  amount: Math.round(total * 100),
                                  currency: currency.toLowerCase(),
                                  customer_email: formData.shipping_email || user?.email || '',
                                  metadata: {
                                    cart_items: JSON.stringify(items?.map(item => ({
                                      product_name: item.variant?.product?.name,
                                      variant_size: item.variant?.size,
                                      variant_color: item.variant?.color,
                                      quantity: item.quantity,
                                      price: item.variant?.price || item.variant?.product?.price
                                    })) || []),
                                    custom_items: JSON.stringify(customItems?.map(item => ({
                                      name: item.name,
                                      color: item.color,
                                      size: item.size,
                                      quantity: item.quantity,
                                      price: item.price
                                    })) || []),
                                    currency: currency
                                  }
                                }, token);
                                
                                if (paymentIntent.client_secret) {
                                  setClientSecret(paymentIntent.client_secret);
                                  setPaymentIntentId(paymentIntent.payment_intent_id);
                                  return paymentIntent.client_secret;
                                }
                                throw new Error('Failed to create payment intent');
                              } catch (error) {throw error;
                              } finally {
                                setIsCreatingPaymentIntent(false);
                              }
                            }}
                          />
                        </Elements>
                      ) : (
                        <div className="text-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Loading Stripe...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PayPal Payment - Also using Stripe */}
                {formData.payment_method === 'paypal' && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      {stripePromise ? (
                        <Elements 
                          stripe={stripePromise}
                          options={{
                            appearance: {
                              theme: 'stripe',
                            },
                          }}
                        >
                          <PaymentForm 
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentError={handlePaymentError}
                            clientSecret={clientSecret}
                            paymentMethod="paypal"
                            validateForm={validateCheckoutForm}
                            isCheckoutFormValid={isCheckoutFormValid}
                            billingDetails={{
                              name: formData.billing_same_as_shipping ? formData.shipping_name : formData.billing_name,
                              email: formData.billing_same_as_shipping ? formData.shipping_email : formData.billing_email,
                              address: {
                                line1: formData.billing_same_as_shipping ? formData.shipping_address : formData.billing_address,
                                city: formData.billing_same_as_shipping ? formData.shipping_city : formData.billing_city,
                                state: formData.billing_same_as_shipping ? formData.shipping_state : formData.billing_state,
                                postal_code: formData.billing_same_as_shipping ? formData.shipping_postal_code : formData.billing_postal_code,
                                country: formData.billing_same_as_shipping ? formData.shipping_country : formData.billing_country,
                              }
                            }}
                            isCreatingPaymentIntent={isCreatingPaymentIntent}
                            onCreatePaymentIntent={async () => {
                              setIsCreatingPaymentIntent(true);
                              try {
                                const paymentIntent = await createPaymentIntent({
                                  amount: Math.round(total * 100),
                                  currency: currency.toLowerCase(),
                                  customer_email: formData.shipping_email || user?.email || '',
                                  metadata: {
                                    cart_items: JSON.stringify(items?.map(item => ({
                                      product_name: item.variant?.product?.name,
                                      variant_size: item.variant?.size,
                                      variant_color: item.variant?.color,
                                      quantity: item.quantity,
                                      price: item.variant?.price || item.variant?.product?.price
                                    })) || []),
                                    custom_items: JSON.stringify(customItems?.map(item => ({
                                      name: item.name,
                                      color: item.color,
                                      size: item.size,
                                      quantity: item.quantity,
                                      price: item.price
                                    })) || []),
                                    currency: currency
                                  }
                                }, token);
                                
                                if (paymentIntent.client_secret) {
                                  setClientSecret(paymentIntent.client_secret);
                                  setPaymentIntentId(paymentIntent.payment_intent_id);
                                  return paymentIntent.client_secret;
                                }
                                throw new Error('Failed to create payment intent');
                              } catch (error) {throw error;
                              } finally {
                                setIsCreatingPaymentIntent(false);
                              }
                            }}
                          />
                        </Elements>
                      ) : (
                        <div className="text-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Loading Stripe...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('checkout.demoPaymentInfo')}</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    {t('checkout.demoHint')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-4 lg:h-fit order-2 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('checkout.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* Regular Items */}
                {items && items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.variant?.product?.name}</p>
                      <p className="text-muted-foreground">
                        {item.variant?.size} - {item.variant?.color} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">{getCurrencySymbol()}{(convertPrice((item.variant?.price ?? Number(item.variant?.product?.price)) || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                {/* Custom Jacket Items */}
                {customItems && customItems.map((customItem) => (
                  <div key={customItem.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{customItem.name}</p>
                      <p className="text-muted-foreground">
                        Custom Design - {customItem.color} • Size: {customItem.size} × {customItem.quantity}
                      </p>
                      {customItem.logos && customItem.logos.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {customItem.logos.length} logo{customItem.logos.length !== 1 ? 's' : ''} placed
                        </p>
                      )}
                    </div>
                    <span className="font-medium">{getCurrencySymbol()}{(convertPrice(Number(customItem.price) || 0) * customItem.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('checkout.subtotal')}</span>
                  <span>{getCurrencySymbol()}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('checkout.shipping')}</span>
                  <span>{shipping === 0 ? t('checkout.free') : `${getCurrencySymbol()}${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('checkout.taxVat')}</span>
                  <span>{getCurrencySymbol()}{tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('checkout.total')}</span>
                  <span>{getCurrencySymbol()}{total.toFixed(2)}</span>
                </div>
              </div>

              <Separator />
              
              {/* Estimated Shipping Time */}
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">{t('checkout.estimatedShipping')}</h4>
                </div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{t('checkout.shippingTime')}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">{t('checkout.shippingTimeDesc')}</p>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• {t('checkout.bulletSecure')}</p>
                <p>• {t('checkout.bulletFreeShipping')}</p>
                <p>• {t('checkout.bulletReturns')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;