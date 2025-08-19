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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Truck, Shield, ArrowLeft, Plus, MapPin } from 'lucide-react';
import { createOrder } from '@/api/orders';
import { createAddress } from '@/api/addresses';

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

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, customItems, getCartTotal, getCartItemsCount, clearCartItems, isLoading } = useCart();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Debug cart state
  console.log('🏪 Checkout rendered - Cart items:', items?.length || 0, 'Custom items:', customItems?.length || 0, 'isLoading:', isLoading, 'isProcessing:', isProcessing);
  console.log('🔍 Full cart data:', { items, customItems, getCartTotal: getCartTotal(), getCartItemsCount: getCartItemsCount() });
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping_name: user?.name || '',
    shipping_email: user?.email || '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: 'Turku',
    shipping_postal_code: '',
    shipping_country: 'Finland',
    billing_same_as_shipping: true,
    billing_name: '',
    billing_email: '',
    billing_phone: '',
    billing_address: '',
    billing_city: '',
    billing_state: 'Turku',
    billing_postal_code: '',
    billing_country: 'Finland',
    payment_method: 'credit_card',
    notes: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    card_name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Wait for cart to load before checking if it's empty
  useEffect(() => {
    console.log('🔄 useEffect - isLoading:', isLoading, 'items:', items?.length, 'customItems:', customItems?.length, 'isProcessing:', isProcessing);
    console.log('🔍 useEffect - Full data:', { items, customItems });
    
    // Only check cart status after loading is complete
    if (!isLoading && !isProcessing) {
      const totalItems = (items?.length || 0) + (customItems?.length || 0);
      console.log('📊 Total items calculation:', { itemsCount: items?.length || 0, customItemsCount: customItems?.length || 0, totalItems });
      if (totalItems === 0) {
        console.log('⚠️ Cart is empty after loading, redirecting to cart page');
        navigate('/cart');
      } else {
        console.log('✅ Cart has items, staying on checkout');
      }
    } else {
      console.log('🔄 Still loading or processing, waiting...');
    }
  }, [isLoading, items, customItems, navigate, isProcessing]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Shipping validation
    if (!formData.shipping_name) newErrors.shipping_name = 'Name is required';
    if (!formData.shipping_email) newErrors.shipping_email = 'Email is required';
    if (!formData.shipping_address) newErrors.shipping_address = 'Address is required';
    if (!formData.shipping_city) newErrors.shipping_city = 'City is required';
    if (!formData.shipping_postal_code) newErrors.shipping_postal_code = 'Postal code is required';

    // Billing validation (if different from shipping)
    if (!formData.billing_same_as_shipping) {
      if (!formData.billing_name) newErrors.billing_name = 'Billing name is required';
      if (!formData.billing_email) newErrors.billing_email = 'Billing email is required';
      if (!formData.billing_address) newErrors.billing_address = 'Billing address is required';
      if (!formData.billing_city) newErrors.billing_city = 'Billing city is required';
      if (!formData.billing_postal_code) newErrors.billing_postal_code = 'Billing postal code is required';
    }

    // Payment validation (for demo purposes)
    if (formData.payment_method === 'credit_card') {
      if (!formData.card_number) newErrors.card_number = 'Card number is required';
      if (!formData.card_expiry) newErrors.card_expiry = 'Expiry date is required';
      if (!formData.card_cvv) newErrors.card_cvv = 'CVV is required';
      if (!formData.card_name) newErrors.card_name = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      // Save shipping address to user's address book if user is authenticated
      if (user && token) {
        try {
          console.log('🏠 Saving shipping address to address book...');
          const addressData = {
            type: 'home' as const,
            label: 'Checkout Address',
            street: formData.shipping_address,
            city: formData.shipping_city,
            state: formData.shipping_state,
            postal_code: formData.shipping_postal_code,
            country: formData.shipping_country,
          };
          
          await createAddress(addressData);
          console.log('✅ Shipping address saved to address book');
        } catch (addressError) {
          console.warn('⚠️ Failed to save address to address book:', addressError);
          // Don't fail the order if address saving fails
        }
      }

      console.log('📝 Creating order with API call...');
      console.log('📤 Order data being sent:', formData);
      console.log('🔐 Using token:', token);
      
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
    console.log('🔄 Showing loading state');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
          <span className="ml-2">Loading checkout...</span>
        </div>
      </div>
    );
  }

  // Don't render if cart is empty and we're not processing
  if ((!items || items.length === 0) && !isProcessing) {
    console.log('🚫 Cart is empty, not rendering checkout');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p>Redirecting to cart...</p>
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

          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
                {user && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Your shipping address will be saved to your address book for future orders
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping_name">Full Name *</Label>
                    <Input
                      id="shipping_name"
                      value={formData.shipping_name}
                      onChange={(e) => handleInputChange('shipping_name', e.target.value)}
                      className={errors.shipping_name ? 'border-red-500' : ''}
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
                    />
                    {errors.shipping_city && <p className="text-sm text-red-500">{errors.shipping_city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="shipping_state">State/Region</Label>
                    <Input
                      id="shipping_state"
                      value={formData.shipping_state}
                      onChange={(e) => handleInputChange('shipping_state', e.target.value)}
                      placeholder="Turku"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shipping_postal_code">Postal Code *</Label>
                  <Input
                    id="shipping_postal_code"
                    value={formData.shipping_postal_code}
                    onChange={(e) => handleInputChange('shipping_postal_code', e.target.value)}
                    className={errors.shipping_postal_code ? 'border-red-500' : ''}
                  />
                  {errors.shipping_postal_code && <p className="text-sm text-red-500">{errors.shipping_postal_code}</p>}
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
                          placeholder="Turku"
                        />
                      </div>
                    </div>
                    
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
                      <Label htmlFor="card_number">Card Number * (Demo: 4242424242424242)</Label>
                      <Input
                        id="card_number"
                        value={formData.card_number}
                        onChange={(e) => handleInputChange('card_number', e.target.value)}
                        className={errors.card_number ? 'border-red-500' : ''}
                        placeholder="4242 4242 4242 4242"
                      />
                      {errors.card_number && <p className="text-sm text-red-500">{errors.card_number}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="card_expiry">Expiry Date * (MM/YY)</Label>
                        <Input
                          id="card_expiry"
                          value={formData.card_expiry}
                          onChange={(e) => handleInputChange('card_expiry', e.target.value)}
                          className={errors.card_expiry ? 'border-red-500' : ''}
                          placeholder="12/25"
                        />
                        {errors.card_expiry && <p className="text-sm text-red-500">{errors.card_expiry}</p>}
                      </div>
                      <div>
                        <Label htmlFor="card_cvv">CVV * (123)</Label>
                        <Input
                          id="card_cvv"
                          value={formData.card_cvv}
                          onChange={(e) => handleInputChange('card_cvv', e.target.value)}
                          className={errors.card_cvv ? 'border-red-500' : ''}
                          placeholder="123"
                        />
                        {errors.card_cvv && <p className="text-sm text-red-500">{errors.card_cvv}</p>}
                      </div>
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
                {/* Regular Items */}
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
                    <span className="font-medium">€{(Number(customItem.price) || 0).toFixed(2)}</span>
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

export default Checkout;
