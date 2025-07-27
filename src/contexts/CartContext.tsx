import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchCart, addOrUpdateCartItem, updateCartItem, removeCartItem, clearCart 
} from '@/api/cart';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { CartItem } from '@/types/Cart';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product_variant_id: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCartItems: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  getItemPrice: (item: CartItem) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { token } = useAuth(); // Get token from auth context

  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Handle session ID for guest carts
    let currentSessionId = localStorage.getItem('nordic_fashion_cart_session_id');
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID(); 
      localStorage.setItem('nordic_fashion_cart_session_id', currentSessionId);
    }
    setSessionId(currentSessionId);
  }, []); // Run only once on component mount

  // Fetch cart data, enabled only when sessionId is available
  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart', sessionId, token], // Use token from auth context
    queryFn: () => fetchCart(sessionId, token), // Pass token from auth context
    staleTime: 5 * 60 * 1000, 
    enabled: !!sessionId, // Only run the query if sessionId is truthy
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized) or 400 errors (bad request)
      if ((error as any)?.response?.status === 401 || (error as any)?.response?.status === 400) {
        return false;
      }
      return failureCount < 3;
    },
    onSuccess: (data) => {
      // Debug log to see what's coming from the API
      console.log('Cart data received:', data);
    }
  });

  const items: CartItem[] = cart?.items || [];

  const addMutation = useMutation({
    mutationFn: ({ product_variant_id, quantity }: { product_variant_id: number; quantity: number; }) =>
      addOrUpdateCartItem(product_variant_id, quantity, sessionId, token), // Use token from auth context
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] }); 
      toast({ title: t('toast.addedToCart') });
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
      toast({ title: t('toast.cartError'), description: error.message || t('toast.error'), variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number; }) =>
      updateCartItem(itemId, quantity, sessionId, token), // Use token from auth context
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] }); 
      toast({ title: t('toast.cartUpdated') });
    },
    onError: (error) => {
      console.error('Error updating cart:', error);
      toast({ title: t('toast.cartError'), description: error.message || t('toast.error'), variant: 'destructive' });
    }
  });

  const removeMutation = useMutation({
    mutationFn: ({ itemId }: { itemId: number; }) =>
      removeCartItem(itemId, sessionId, token), // Use token from auth context
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] }); 
      toast({ title: t('toast.itemRemoved') || 'Item removed from cart' });
    },
    onError: (error) => {
      console.error('Error removing item:', error);
      toast({ title: t('toast.cartError'), description: error.message || t('toast.error'), variant: 'destructive' });
    }
  });

  const clearMutation = useMutation({
    mutationFn: () =>
      clearCart(sessionId, token), // Use token from auth context
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] }); 
      toast({ title: t('toast.cartUpdated') });
    },
    onError: (error) => {
      console.error('Error clearing cart:', error);
      toast({ title: t('toast.cartError'), description: error.message || t('toast.error'), variant: 'destructive' });
    }
  });

  const addToCart = async (product_variant_id: number, quantity: number) => {
    if (!sessionId) {
      toast({ title: t('error.generic'), description: t('common.loading'), variant: 'destructive' });
      return;
    }
    await addMutation.mutateAsync({ product_variant_id, quantity });
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!sessionId) {
      toast({ title: t('error.generic'), description: t('common.loading'), variant: 'destructive' });
      return;
    }
    if (quantity <= 0) {
      await removeFromCart(itemId); 
      return;
    }
    await updateMutation.mutateAsync({ itemId, quantity });
  };

  const removeFromCart = async (itemId: number) => {
    if (!sessionId) {
      toast({ title: t('error.generic'), description: t('common.loading'), variant: 'destructive' });
      return;
    }
    await removeMutation.mutateAsync({ itemId });
  };

  const clearCartItems = async () => {
    if (!sessionId) {
      toast({ title: t('error.generic'), description: t('common.loading'), variant: 'destructive' });
      return;
    }
    await clearMutation.mutateAsync();
  };

  const getItemPrice = (item: CartItem): number => {
    // First try to get price from variant.product.price since actual_price is undefined
    let price = 0;
    
    if (item?.variant?.product?.price) {
      // Convert string price to number
      price = parseFloat(item.variant.product.price);
      
      // Add any price_difference from the variant (if any)
      if (item?.variant?.price_difference) {
        price += parseFloat(item.variant.price_difference);
      }
    }
    
    return price;
  };

  const getCartTotal = () => {
    if (!items || items.length === 0) return 0;
    try {
      console.log('Cart items for calculation:', JSON.stringify(items, null, 2));
      
      // Log each item's structure to check if actual_price exists
      items.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          id: item.id,
          quantity: item.quantity,
          variant_id: item.product_variant_id,
          variant_obj: item.variant,
          actual_price: item.variant?.actual_price,
          calculated_total: (item.variant?.actual_price ?? 0) * (item.quantity ?? 0)
        });
      });
      
      return items.reduce((total, item) => {
        const price = getItemPrice(item);
        const quantity = item?.quantity ?? 0;
        const itemTotal = price * quantity;
        
        console.log(`Item ${item?.id}: price=${price}, quantity=${quantity}, total=${itemTotal}`);
        
        return total + itemTotal;
      }, 0);
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return 0;
    }
  };

  const getCartItemsCount = () => {
    if (!items || items.length === 0) return 0;
    try {
      return items.reduce((total, item) => total + (item?.quantity ?? 0), 0);
    } catch (error) {
      console.error('Error calculating cart items count:', error);
      return 0;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartItems,
        getCartTotal,
        getCartItemsCount,
        getItemPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};