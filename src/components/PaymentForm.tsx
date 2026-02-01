import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard } from 'lucide-react';

interface PaymentFormProps {
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: string) => void;
  clientSecret: string;
  paymentMethod: 'card' | 'paypal';
  validateForm?: () => boolean;
  isCheckoutFormValid?: boolean;
  billingDetails: {
    name: string;
    email: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  isCreatingPaymentIntent?: boolean;
  onCreatePaymentIntent?: () => Promise<string>;
}

// Stripe Elements styling
const elementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '10px 12px',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  onPaymentSuccess,
  onPaymentError,
  clientSecret,
  paymentMethod,
  validateForm,
  isCheckoutFormValid = true,
  billingDetails,
  isCreatingPaymentIntent = false,
  onCreatePaymentIntent,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState(billingDetails.name);
  const [cardComplete, setCardComplete] = useState(false);
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);

  // PayPal state
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    setCardholderName(billingDetails.name);
  }, [billingDetails.name]);

  // Load PayPal SDK
  useEffect(() => {
    if (paymentMethod === 'paypal' && !paypalLoaded) {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=demo&currency=EUR';
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);
    }
  }, [paymentMethod, paypalLoaded]);

  // Check if payment form fields are valid (silent validation for button state)
  const isPaymentFormValid = () => {
    // Check payment form fields only
    if (paymentMethod === 'card') {
      return (
        cardholderName.trim() !== '' &&
        cardComplete &&
        expiryComplete &&
        cvcComplete
      );
    }

    if (paymentMethod === 'paypal') {
      // For PayPal, we just need basic validation
      return cardholderName.trim() !== '';
    }

    return false;
  };

  // Check if all forms are valid (checkout + payment)
  const isAllFormsValid = () => {
    return isCheckoutFormValid && isPaymentFormValid();
  };

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate checkout form first
    if (validateForm && !validateForm()) {
      return;
    }

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setError('Card information is incomplete.');
      return;
    }

    // Validate payment form fields
    if (!cardholderName.trim()) {
      setError('Please enter the cardholder name.');
      return;
    }

    if (!cardComplete || !expiryComplete || !cvcComplete) {
      setError('Please complete all card information.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent if not already created
      let currentClientSecret = clientSecret;
      if (!currentClientSecret && onCreatePaymentIntent) {
        currentClientSecret = await onCreatePaymentIntent();
      }

      if (!currentClientSecret) {
        throw new Error('Unable to create payment intent');
      }

      // Confirm the payment with card details
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(currentClientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: cardholderName,
            email: billingDetails.email,
            address: billingDetails.address,
          },
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        onPaymentError(confirmError.message || 'Payment failed');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent);
      } else {
        setError('Payment was not completed. Please try again.');
        onPaymentError('Payment was not completed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    // Validate checkout form first
    if (validateForm && !validateForm()) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Create payment intent if not already created
      let currentClientSecret = clientSecret;
      if (!currentClientSecret && onCreatePaymentIntent) {
        currentClientSecret = await onCreatePaymentIntent();
      }

      if (!currentClientSecret) {
        throw new Error('Unable to create payment intent');
      }

      // For now, simulate PayPal payment - in production this would use Stripe's PayPal integration
      // TODO: Implement actual Stripe PayPal integration
      setTimeout(() => {
        const mockPaymentIntent = {
          id: 'paypal_stripe_' + Date.now(),
          status: 'succeeded',
          payment_method: 'paypal',
          amount: Math.round(parseFloat(currentClientSecret.split('_secret_')[0].replace('pi_', '')) || 0),
        };
        
        onPaymentSuccess(mockPaymentIntent);
        setIsProcessing(false);
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'PayPal payment failed';
      setError(errorMessage);
      onPaymentError(errorMessage);
      setIsProcessing(false);
    }
  };

  if (paymentMethod === 'card') {
    return (
      <form onSubmit={handleStripeSubmit} className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardholder-name">Cardholder Name</Label>
            <Input
              id="cardholder-name"
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Name on card"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Card Number</Label>
            <div className="mt-1 p-3 border border-input rounded-md bg-background">
              <CardNumberElement 
                options={elementOptions}
                onChange={(event) => {
                  setCardComplete(event.complete);
                  if (event.error) {
                    setError(event.error.message);
                  } else {
                    setError(null);
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Expiry Date</Label>
              <div className="mt-1 p-3 border border-input rounded-md bg-background">
                <CardExpiryElement 
                  options={elementOptions}
                  onChange={(event) => {
                    setExpiryComplete(event.complete);
                    if (event.error) {
                      setError(event.error.message);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <Label>CVC</Label>
              <div className="mt-1 p-3 border border-input rounded-md bg-background">
                <CardCvcElement 
                  options={elementOptions}
                  onChange={(event) => {
                    setCvcComplete(event.complete);
                    if (event.error) {
                      setError(event.error.message);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!stripe || isProcessing || isCreatingPaymentIntent || !isAllFormsValid()}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing || isCreatingPaymentIntent ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isCreatingPaymentIntent ? 'Setting up payment...' : 'Processing Payment...'}
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Complete Order
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>🔒 Secure payment powered by Stripe</p>
          <p>Test card: 4242 4242 4242 4242</p>
        </div>
      </form>
    );
  }

  if (paymentMethod === 'paypal') {
    return (
      <div className="space-y-4">
        <div className="border rounded-lg p-6 bg-blue-50 text-center">
          <div className="mb-4">
            <svg className="w-16 h-8 mx-auto" viewBox="0 0 124 32" fill="none">
              <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47.117 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z" fill="#253B80"/>
              <path d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.562.482z" fill="#179BD7"/>
              <path d="M7.266 29.154l.523-3.322-1.165-.027H1.061L4.927 1.292a.316.316 0 0 1 .314-.268h9.38c1.598 0 2.756.412 3.44 1.225.323.38.523.816.595 1.295.077.513.32.513.32.513l.094-.006.321-.175c.232-.129.498-.21.756-.267.764-.17 1.697-.205 2.653-.205h.026c.554 0 1.141.021 1.765.058.191.011.384.025.578.042.543.048 1.107.135 1.69.275a6.493 6.493 0 0 1 1.524.65c.181.102.34.21.483.334.438.378.672.91.672 1.538 0 .729-.131 1.534-.389 2.396-.258.861-.6 1.777-1.019 2.729a10.73 10.73 0 0 1-1.477 2.339c-.543.65-1.165 1.201-1.848 1.643-.664.428-1.386.729-2.147.895-.744.162-1.509.244-2.273.244h-.529c-.235 0-.464.018-.684.054-.22.035-.426.09-.615.162a2.434 2.434 0 0 0-.535.3c-.152.129-.279.283-.372.456-.093.174-.143.365-.148.558L11.39 20.8l-.093.236a.327.327 0 0 1-.189.213.34.34 0 0 1-.121.018z" fill="#253B80"/>
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-blue-800 mb-2">PayPal Payment (Demo)</h3>
          <p className="text-sm text-blue-600 mb-4">
            This is a demo PayPal integration. In production, this would redirect to PayPal's secure checkout.
          </p>
          
          <Button
            onClick={handlePayPalPayment}
            disabled={isProcessing || isCreatingPaymentIntent || !isAllFormsValid()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing || isCreatingPaymentIntent ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isCreatingPaymentIntent ? 'Setting up PayPal...' : 'Processing PayPal Payment...'}
              </>
            ) : (
              'Complete Order with PayPal'
            )}
          </Button>
          
          <p className="text-xs text-blue-500 mt-2">
            Secure PayPal payment via Stripe
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentForm;