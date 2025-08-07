import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Truck, Shield, ArrowLeft, MapPin, User } from 'lucide-react';
import { createOrder } from '@/api/orders';
import { fetchUserAddresses, createAddress, type Address, type CreateAddressData } from '@/api/addresses';
import { CardInput } from '@/components/common';
import { validateCardNumber, validateExpiryDate, validateCVV } from '@/utils/cardFormatting';

// Nordic countries for selection
const NORDIC_COUNTRIES = [
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Norway', label: 'Norway' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Finland', label: 'Finland' },
  { value: 'Iceland', label: 'Iceland' },
] as const;

interface CheckoutFormData {
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  billing_same_as_shipping: boolean;
  billing_name: string;
  billing_email: string;
  billing_phone: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
  payment_method: 'credit_card' | 'paypal' | 'stripe';
  notes: string;
  // Payment details for demo
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  card_name: string;
}

const CheckoutFixed: React.FC = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, getCartItemsCount, clearCartItems, isLoading } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [hasExistingAddresses, setHasExistingAddresses] = useState(false);
  
  console.log('🏪 Checkout Fixed - Cart items:', items?.length || 0, 'isLoading:', isLoading);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping_name: user?.name || '',
    shipping_email: user?.email || '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: 'Stockholm',
    shipping_postal_code: '',
    shipping_country: 'Sweden',
    billing_same_as_shipping: true,
    billing_name: user?.name || '',
    billing_email: user?.email || '',
    billing_phone: '',
    billing_address: '',
    billing_city: '',
    billing_state: 'Stockholm',
    billing_postal_code: '',
    billing_country: 'Sweden',
    payment_method: 'credit_card',
    notes: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    card_name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGuestMode, setIsGuestMode] = useState(!isAuthenticated);

  // Load user's default address on component mount
  useEffect(() => {
    const loadDefaultAddress = async () => {
      if (!isAuthenticated || !token || isGuestMode) {
        console.log('🔒 User not authenticated or in guest mode, skipping address load');
        return;
      }
      
      try {
        setIsLoadingAddress(true);
        console.log('📍 Loading user addresses...');
        const addresses = await fetchUserAddresses();
        console.log('📍 Fetched addresses:', addresses);
        
        setHasExistingAddresses(addresses.length > 0);
        
        const defaultAddr = addresses.find(addr => addr.is_default);
        if (defaultAddr) {
          console.log('✅ Found default address:', defaultAddr);
          setDefaultAddress(defaultAddr);
          
          // Prefill form with default address
          setFormData(prev => {
            const updated = {
              ...prev,
              shipping_name: user?.name || defaultAddr.label || '',
              shipping_address: defaultAddr.street,
              shipping_city: defaultAddr.city,
              shipping_state: defaultAddr.state,
              shipping_postal_code: defaultAddr.postal_code,
              shipping_country: defaultAddr.country,
            };
            
            // If billing same as shipping, copy the info
            if (updated.billing_same_as_shipping) {
              updated.billing_name = updated.shipping_name;
              updated.billing_email = updated.shipping_email;
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
          console.log('ℹ️ No default address found');
          setUseDefaultAddress(false); // No default address, so allow manual entry
        }
      } catch (error) {
        console.error('❌ Error loading default address:', error);
        setHasExistingAddresses(false);
        setUseDefaultAddress(false); // On error, allow manual entry
      } finally {
        setIsLoadingAddress(false);
      }
    };

    loadDefaultAddress();
  }, [isAuthenticated, token, user?.name]);

  // Update name fields when user data changes
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => {
        const updated = {
          ...prev,
          shipping_name: user.name,
          shipping_email: user.email || prev.shipping_email,
        };
        
        // If billing same as shipping, update billing info too
        if (updated.billing_same_as_shipping) {
          updated.billing_name = user.name;
          updated.billing_email = user.email || prev.billing_email;
        }
        
        return updated;
      });
    }
  }, [user?.name, user?.email]);

  // Handle toggle between default address and custom address
  const handleAddressToggle = (useDefault: boolean) => {
    setUseDefaultAddress(useDefault);
    
    if (useDefault && defaultAddress) {
      // Restore default address
      setFormData(prev => {
        const updated = {
          ...prev,
          shipping_name: user?.name || defaultAddress.label || '',
          shipping_address: defaultAddress.street,
          shipping_city: defaultAddress.city,
          shipping_state: defaultAddress.state,
          shipping_postal_code: defaultAddress.postal_code,
          shipping_country: defaultAddress.country,
        };
        
        // If billing same as shipping, copy the info
        if (updated.billing_same_as_shipping) {
          updated.billing_name = updated.shipping_name;
          updated.billing_email = updated.shipping_email;
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
      // Clear address fields for manual entry but keep name
      setFormData(prev => {
        const updated = {
          ...prev,
          shipping_name: user?.name || '',
          shipping_address: '',
          shipping_city: '',
          shipping_state: 'Stockholm',
          shipping_postal_code: '',
          shipping_country: 'Sweden',
        };
        
        // If billing same as shipping, copy the info
        if (updated.billing_same_as_shipping) {
          updated.billing_name = updated.shipping_name;
          updated.billing_email = updated.shipping_email;
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

  // Function to save the checkout address as the user's first address
  const saveFirstAddress = async (formData: CheckoutFormData): Promise<void> => {
    try {
      console.log('💾 Saving user\'s first address...');
      
      const addressData: CreateAddressData = {
        type: 'home',
        label: `${formData.shipping_name}'s Address`,
        street: formData.shipping_address,
        city: formData.shipping_city,
        state: formData.shipping_state || '',
        postal_code: formData.shipping_postal_code,
        country: formData.shipping_country,
      };
      
      const savedAddress = await createAddress(addressData);
      console.log('✅ Address saved successfully:', savedAddress);
      
      // Set this as the default address for future use
      setDefaultAddress(savedAddress);
      setHasExistingAddresses(true);
      
      toast({
        title: 'Address saved',
        description: 'Your shipping address has been saved for future orders',
        className: "bg-green-500 text-white"
      });
      
    } catch (error: any) {
      console.error('❌ Error saving address:', error);
      // Don't show error toast for address saving failure as it shouldn't block checkout
      // The order was successful, saving address is just a convenience feature
    }
  };

  // Simple cart check - no automatic redirects, just manual button
  const hasValidCart = items && items.length > 0;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Shipping validation
    if (!formData.shipping_name) newErrors.shipping_name = 'Name is required';
    if (!formData.shipping_email) newErrors.shipping_email = 'Email is required';
    if (!formData.shipping_address) newErrors.shipping_address = 'Address is required';
    if (!formData.shipping_city) newErrors.shipping_city = 'City is required';
    if (!formData.shipping_postal_code) newErrors.shipping_postal_code = 'Postal code is required';
    if (!formData.shipping_country) newErrors.shipping_country = 'Country is required';

    // Billing validation (if different from shipping)
    if (!formData.billing_same_as_shipping) {
      if (!formData.billing_name) newErrors.billing_name = 'Billing name is required';
      if (!formData.billing_email) newErrors.billing_email = 'Billing email is required';
      if (!formData.billing_address) newErrors.billing_address = 'Billing address is required';
      if (!formData.billing_city) newErrors.billing_city = 'Billing city is required';
      if (!formData.billing_postal_code) newErrors.billing_postal_code = 'Billing postal code is required';
      if (!formData.billing_country) newErrors.billing_country = 'Billing country is required';
    }

    // Payment validation (for demo purposes)
    if (formData.payment_method === 'credit_card') {
      if (!formData.card_number) {
        newErrors.card_number = 'Card number is required';
      } else if (!validateCardNumber(formData.card_number)) {
        newErrors.card_number = 'Please enter a valid card number';
      }
      
      if (!formData.card_expiry) {
        newErrors.card_expiry = 'Expiry date is required';
      } else if (!validateExpiryDate(formData.card_expiry)) {
        newErrors.card_expiry = 'Please enter a valid expiry date (MM/YY)';
      }
      
      if (!formData.card_cvv) {
        newErrors.card_cvv = 'CVV is required';
      } else if (!validateCVV(formData.card_cvv)) {
        newErrors.card_cvv = 'Please enter a valid CVV';
      }
      
      if (!formData.card_name) newErrors.card_name = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // If billing_same_as_shipping is checked, copy shipping info to billing
      if (field === 'billing_same_as_shipping' && value === true) {
        updated.billing_name = updated.shipping_name;
        updated.billing_email = updated.shipping_email;
        updated.billing_phone = updated.shipping_phone;
        updated.billing_address = updated.shipping_address;
        updated.billing_city = updated.shipping_city;
        updated.billing_state = updated.shipping_state;
        updated.billing_postal_code = updated.shipping_postal_code;
        updated.billing_country = updated.shipping_country;
      }
      
      // If shipping info is updated and billing_same_as_shipping is true, sync billing info
      if (updated.billing_same_as_shipping && field.startsWith('shipping_')) {
        const billingField = field.replace('shipping_', 'billing_');
        switch (billingField) {
          case 'billing_name':
            updated.billing_name = value as string;
            break;
          case 'billing_email':
            updated.billing_email = value as string;
            break;
          case 'billing_phone':
            updated.billing_phone = value as string;
            break;
          case 'billing_address':
            updated.billing_address = value as string;
            break;
          case 'billing_city':
            updated.billing_city = value as string;
            break;
          case 'billing_state':
            updated.billing_state = value as string;
            break;
          case 'billing_postal_code':
            updated.billing_postal_code = value as string;
            break;
          case 'billing_country':
            updated.billing_country = value as string;
            break;
        }
      }
      
      return updated;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    console.log('🚀 handleSubmit called');
    console.log('🔍 User:', user);
    console.log('🔑 Token:', token);
    console.log('🛒 Cart items:', items);
    console.log('💳 Form data:', formData);
    
    if (e) {
      e.preventDefault();
    }

    // Check cart before processing
    if (!hasValidCart) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checkout',
        variant: 'destructive'
      });
      return;
    }
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      toast({
        title: 'Please fix the errors',
        description: 'Check the form fields and try again',
        variant: 'destructive'
      });
      return;
    }

    console.log('✅ Form validation passed');
    setIsProcessing(true);

    try {
      console.log('💰 Starting payment processing...');
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('📝 Creating order with API call...');
      console.log('📤 Order data being sent:', formData);
      console.log('🔐 Using token:', token);
      
      // Additional debugging for session/auth
      const sessionId = localStorage.getItem('nordic_fashion_cart_session_id');
      console.log('🎫 Session ID:', sessionId);
      console.log('👤 User data:', user);
      console.log('🔒 Is authenticated:', isAuthenticated);
      
      // Create order
      const orderData = await createOrder(formData, token);
      console.log('✅ Order created successfully:', orderData);
      
      if (!orderData || !orderData.order) {
        throw new Error('Invalid order response from server');
      }
      
      toast({
        title: 'Order placed successfully!',
        description: `Order #${orderData.order.order_number} has been created`,
        className: "bg-green-500 text-white"
      });

      // Save address if this is the user's first checkout (no existing addresses)
      if (!hasExistingAddresses && isAuthenticated && !isGuestMode) {
        console.log('🏠 User has no saved addresses, saving this address for future use...');
        await saveFirstAddress(formData);
      }

      console.log('🧭 Navigating to order page...');
      // Navigate to order confirmation
      navigate(`/orders/${orderData.order.id}`, { 
        state: { orderData: orderData.order, fromCheckout: true }
      });

      console.log('🧹 Clearing cart...');
      // Clear cart after successful navigation
      await clearCartItems();
      console.log('✅ Cart cleared');

    } catch (error: any) {
      console.error('💥 Checkout error details:', {
        error,
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      toast({
        title: 'Payment failed',
        description: error.message || 'There was an error processing your order',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      console.log('🏁 handleSubmit finished, isProcessing set to false');
    }
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.25; // 25% VAT
  const total = subtotal + shipping + tax;

  // Show loading while cart is loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
          <span className="ml-2">Loading checkout...</span>
        </div>
      </div>
    );
  }

  // Show empty cart message if no items (but don't redirect automatically)
  if (!hasValidCart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items to your cart before checkout.</p>
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/products')}
              className="bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold border border-gold-400 hover:border-gold-500"
            >
              Browse Products
            </Button>
            <br />
            <Button 
              variant="outline"
              onClick={() => navigate('/cart')}
            >
              View Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/cart')}
        className="mb-6 hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
            <p className="text-muted-foreground">Complete your order information</p>
          </div>

          {/* Guest Mode Toggle */}
          {!isAuthenticated && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-amber-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-amber-800">Guest Checkout</h3>
                    <p className="text-sm text-amber-700">
                      You're checking out as a guest. No account required!
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/login', { state: { returnTo: '/checkout' } })}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Mode Info */}
          {isAuthenticated && !isGuestMode && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-green-800">
                      Signed in as {user?.name || user?.email}
                    </h3>
                    <p className="text-sm text-green-700">
                      Your address and order details will be saved to your account.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsGuestMode(true)}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Switch to Guest
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Info about saving address for first-time users */}
                {!hasExistingAddresses && isAuthenticated && !isGuestMode && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Address will be saved</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      This address will be saved to your profile for faster checkout in future orders.
                    </p>
                  </div>
                )}

                {/* Address Toggle - Only show if user has a default address and is not in guest mode */}
                {defaultAddress && !isGuestMode && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Use saved address</span>
                      </div>
                      <Switch
                        checked={useDefaultAddress}
                        onCheckedChange={handleAddressToggle}
                        disabled={isLoadingAddress}
                      />
                    </div>
                    
                    {useDefaultAddress && (
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">{defaultAddress.label}</p>
                        <p>{defaultAddress.street}</p>
                        <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postal_code}</p>
                        <p>{defaultAddress.country}</p>
                      </div>
                    )}
                    
                    {!useDefaultAddress && (
                      <p className="text-sm text-muted-foreground">
                        Fill in a different shipping address below
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping_name">Full Name *</Label>
                    <Input
                      id="shipping_name"
                      value={formData.shipping_name}
                      onChange={(e) => handleInputChange('shipping_name', e.target.value)}
                      className={errors.shipping_name ? 'border-red-500' : ''}
                      disabled={useDefaultAddress && !!defaultAddress}
                    />
                    {errors.shipping_name && <p className="text-sm text-red-500">{errors.shipping_name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="shipping_email">Email *</Label>
                    <Input
                      id="shipping_email"
                      type="email"
                      value={formData.shipping_email}
                      onChange={(e) => handleInputChange('shipping_email', e.target.value)}
                      className={errors.shipping_email ? 'border-red-500' : ''}
                    />
                    {errors.shipping_email && <p className="text-sm text-red-500">{errors.shipping_email}</p>}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="shipping_address">Address *</Label>
                  <Input
                    id="shipping_address"
                    value={formData.shipping_address}
                    onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                    className={errors.shipping_address ? 'border-red-500' : ''}
                    disabled={useDefaultAddress && !!defaultAddress}
                  />
                  {errors.shipping_address && <p className="text-sm text-red-500">{errors.shipping_address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping_city">City *</Label>
                    <Input
                      id="shipping_city"
                      value={formData.shipping_city}
                      onChange={(e) => handleInputChange('shipping_city', e.target.value)}
                      className={errors.shipping_city ? 'border-red-500' : ''}
                      disabled={useDefaultAddress && !!defaultAddress}
                    />
                    {errors.shipping_city && <p className="text-sm text-red-500">{errors.shipping_city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="shipping_state">State/Region</Label>
                    <Input
                      id="shipping_state"
                      value={formData.shipping_state}
                      onChange={(e) => handleInputChange('shipping_state', e.target.value)}
                      placeholder="Stockholm"
                      disabled={useDefaultAddress && !!defaultAddress}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping_postal_code">Postal Code *</Label>
                    <Input
                      id="shipping_postal_code"
                      value={formData.shipping_postal_code}
                      onChange={(e) => handleInputChange('shipping_postal_code', e.target.value)}
                      className={errors.shipping_postal_code ? 'border-red-500' : ''}
                      disabled={useDefaultAddress && !!defaultAddress}
                    />
                    {errors.shipping_postal_code && <p className="text-sm text-red-500">{errors.shipping_postal_code}</p>}
                  </div>
                  <div>
                    <Label htmlFor="shipping_country">Country *</Label>
                    <Select 
                      value={formData.shipping_country} 
                      onValueChange={(value) => handleInputChange('shipping_country', value)}
                      disabled={useDefaultAddress && !!defaultAddress}
                    >
                      <SelectTrigger id="shipping_country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {NORDIC_COUNTRIES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="shipping_phone">Phone</Label>
                  <Input
                    id="shipping_phone"
                    value={formData.shipping_phone}
                    onChange={(e) => handleInputChange('shipping_phone', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="billing_same"
                    checked={formData.billing_same_as_shipping}
                    onCheckedChange={(checked) => handleInputChange('billing_same_as_shipping', checked as boolean)}
                  />
                  <Label htmlFor="billing_same">Same as shipping address</Label>
                </div>

                {!formData.billing_same_as_shipping && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billing_name">Full Name *</Label>
                        <Input
                          id="billing_name"
                          value={formData.billing_name}
                          onChange={(e) => handleInputChange('billing_name', e.target.value)}
                          className={errors.billing_name ? 'border-red-500' : ''}
                        />
                        {errors.billing_name && <p className="text-sm text-red-500">{errors.billing_name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billing_email">Email *</Label>
                        <Input
                          id="billing_email"
                          type="email"
                          value={formData.billing_email}
                          onChange={(e) => handleInputChange('billing_email', e.target.value)}
                          className={errors.billing_email ? 'border-red-500' : ''}
                        />
                        {errors.billing_email && <p className="text-sm text-red-500">{errors.billing_email}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="billing_address">Address *</Label>
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
                        <Label htmlFor="billing_city">City *</Label>
                        <Input
                          id="billing_city"
                          value={formData.billing_city}
                          onChange={(e) => handleInputChange('billing_city', e.target.value)}
                          className={errors.billing_city ? 'border-red-500' : ''}
                        />
                        {errors.billing_city && <p className="text-sm text-red-500">{errors.billing_city}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billing_state">State/Region</Label>
                        <Input
                          id="billing_state"
                          value={formData.billing_state}
                          onChange={(e) => handleInputChange('billing_state', e.target.value)}
                          placeholder="Stockholm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billing_postal_code">Postal Code *</Label>
                        <Input
                          id="billing_postal_code"
                          value={formData.billing_postal_code}
                          onChange={(e) => handleInputChange('billing_postal_code', e.target.value)}
                          className={errors.billing_postal_code ? 'border-red-500' : ''}
                        />
                        {errors.billing_postal_code && <p className="text-sm text-red-500">{errors.billing_postal_code}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billing_country">Country *</Label>
                        <Select value={formData.billing_country} onValueChange={(value) => handleInputChange('billing_country', value)}>
                          <SelectTrigger id="billing_country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {NORDIC_COUNTRIES.map((country) => (
                              <SelectItem key={country.value} value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Payment Method</Label>
                  <RadioGroup
                    value={formData.payment_method}
                    onValueChange={(value) => handleInputChange('payment_method', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card">Credit/Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">PayPal (Demo)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.payment_method === 'credit_card' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="card_name">Cardholder Name *</Label>
                      <Input
                        id="card_name"
                        value={formData.card_name}
                        onChange={(e) => handleInputChange('card_name', e.target.value)}
                        className={errors.card_name ? 'border-red-500' : ''}
                        placeholder="John Doe"
                      />
                      {errors.card_name && <p className="text-sm text-red-500">{errors.card_name}</p>}
                    </div>
                    
                    <div>
                      <CardInput
                        id="card_number"
                        label="Card Number *"
                        type="cardNumber"
                        value={formData.card_number}
                        onChange={(value) => handleInputChange('card_number', value)}
                        error={errors.card_number}
                        placeholder="4242 4242 4242 4242"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Demo: 4242424242424242</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <CardInput
                        id="card_expiry"
                        label="Expiry Date *"
                        type="expiry"
                        value={formData.card_expiry}
                        onChange={(value) => handleInputChange('card_expiry', value)}
                        error={errors.card_expiry}
                        placeholder="MM/YY"
                      />
                      <CardInput
                        id="card_cvv"
                        label="CVV *"
                        type="cvv"
                        value={formData.card_cvv}
                        onChange={(value) => handleInputChange('card_cvv', value)}
                        error={errors.card_cvv}
                        placeholder="123"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Demo Payment Information</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    This is a demo environment. Use test card number 4242424242424242 for successful payments.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-4 lg:h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items && items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.variant?.product?.name}</p>
                      <p className="text-muted-foreground">
                        {item.variant?.size} - {item.variant?.color} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">€{(getCartTotal() / getCartItemsCount() * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (25% VAT)</span>
                  <span>€{tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  console.log('🔘 Checkout button clicked!');
                  handleSubmit();
                }}
                disabled={isProcessing}
                className="w-full bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold py-3 border border-gold-400 hover:border-gold-500"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  `Complete Order - €${total.toFixed(2)}`
                )}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Secure payment processing</p>
                <p>• Free shipping on orders over €100</p>
                <p>• 30-day return policy</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFixed;
