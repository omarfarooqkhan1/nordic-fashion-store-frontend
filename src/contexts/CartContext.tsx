import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchCart, addOrUpdateCartItem, updateCartItem, removeCartItem, clearCart,
  addCustomJacketToCart, removeCustomJacketFromCart, fetchCustomJacketCart, updateCustomJacketQuantity
} from '@/api/cart';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { CartItem, CustomJacketItem } from '@/types/Cart';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  customItems: CustomJacketItem[];
  isLoading: boolean;
  addToCart: (product_variant_id: number, quantity: number) => Promise<void>;
  addCustomJacketToCart: (customJacket: Omit<CustomJacketItem, 'id' | 'createdAt'>) => Promise<CustomJacketItem>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  updateCustomJacketQuantity: (customItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  removeCustomJacketFromCart: (customItemId: string) => void;
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

  // Fetch cart data, enabled for both authenticated and guest users
  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart', token ? 'user' : sessionId, token], // Use 'user' for authenticated, sessionId for guests
    queryFn: () => fetchCart(token ? undefined : sessionId, token), // Pass undefined for authenticated users
    staleTime: 5 * 60 * 1000, 
    enabled: !!(token || sessionId), // Enable for either token or sessionId
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized) or 400 errors (bad request)
      if ((error as any)?.response?.status === 401 || (error as any)?.response?.status === 400) {
        return false;
      }
      return failureCount < 3;
    }
  });

  const items: CartItem[] = (cart as any)?.cart?.items || [];

  // Fetch custom jacket cart data
  const { data: customJacketCart, isLoading: isLoadingCustom } = useQuery({
    queryKey: ['customJacketCart', token ? 'user' : sessionId, token],
    queryFn: () => fetchCustomJacketCart(token ? undefined : sessionId, token),
    staleTime: 5 * 60 * 1000,
    enabled: !!(token || sessionId),
    retry: (failureCount, error) => {
      if ((error as any)?.response?.status === 401 || (error as any)?.response?.status === 400) {
        return false;
      }
      return failureCount < 3;
    }
  });

  const customItems: CustomJacketItem[] = customJacketCart || [];

  const addMutation = useMutation({
    mutationFn: ({ product_variant_id, quantity }: { product_variant_id: number; quantity: number; }) => {
      // For authenticated users, pass undefined as sessionId
      // For guest users, pass the actual sessionId
      const sessionIdToUse = token ? undefined : sessionId;
      return addOrUpdateCartItem(product_variant_id, quantity, sessionIdToUse, token);
    },
    onSuccess: () => {
      // Invalidate both cart queries to ensure all cart data is refreshed
      const cartIdentifier = token ? 'user' : sessionId;
      
      queryClient.invalidateQueries({ queryKey: ['cart', cartIdentifier, token] });
      queryClient.invalidateQueries({ queryKey: ['customJacketCart', cartIdentifier, token] });
      
      // Also try to refetch immediately to ensure data is fresh
      queryClient.refetchQueries({ queryKey: ['cart', cartIdentifier, token] });
      queryClient.refetchQueries({ queryKey: ['customJacketCart', cartIdentifier, token] });
      
      toast({ title: t('toast.addedToCart') });
    },
    onError: (error: any) => {
      
      // Extract the actual error message from the backend response
      let errorMessage = t('toast.error');
      
      if (error?.response?.data?.message) {
        // Backend returned a specific error message
        errorMessage = error.response.data.message;
        
        // Add additional details if available
        if (error.response.data.available !== undefined) {
          errorMessage += ` (Available: ${error.response.data.available})`;
        }
        if (error.response.data.requested !== undefined) {
          errorMessage += ` (Requested: ${error.response.data.requested})`;
        }
      } else if (error?.message) {
        // Error object has a message property
        errorMessage = error.message;
      }
      
      toast({ 
        title: t('toast.cartError'), 
        description: errorMessage, 
        variant: 'destructive' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number; }) => {
      // For authenticated users, pass undefined as sessionId
      // For guest users, pass the actual sessionId
      const sessionIdToUse = token ? undefined : sessionId;
      return updateCartItem(itemId, quantity, sessionIdToUse, token);
    },
    onSuccess: () => {
      // Invalidate both cart queries to ensure all cart data is refreshed
      const cartIdentifier = token ? 'user' : sessionId;
      queryClient.invalidateQueries({ queryKey: ['cart', cartIdentifier, token] });
      queryClient.invalidateQueries({ queryKey: ['customJacketCart', cartIdentifier, token] });
      toast({ title: t('toast.cartUpdated') });
    },
    onError: (error: any) => {
      
      // Extract the actual error message from the backend response
      let errorMessage = t('toast.error');
      
      if (error?.response?.data?.message) {
        // Backend returned a specific error message
        errorMessage = error.response.data.message;
        
        // Add additional details if available
        if (error.response.data.available !== undefined) {
          errorMessage += ` (Available: ${error.response.data.available})`;
        }
        if (error.response.data.requested !== undefined) {
          errorMessage += ` (Requested: ${error.response.data.requested})`;
        }
      } else if (error?.message) {
        // Error object has a message property
        errorMessage = error.message;
      }
      
      toast({ 
        title: t('toast.cartError'), 
        description: errorMessage, 
        variant: 'destructive' 
      });
    }
  });

  const removeMutation = useMutation({
    mutationFn: ({ itemId }: { itemId: number; }) => {
      // For authenticated users, pass undefined as sessionId
      // For guest users, pass the actual sessionId
      const sessionIdToUse = token ? undefined : sessionId;
      return removeCartItem(itemId, sessionIdToUse, token);
    },
    onSuccess: () => {
      // Invalidate both cart queries to ensure all cart data is refreshed
      const cartIdentifier = token ? 'user' : sessionId;
      
      queryClient.invalidateQueries({ queryKey: ['cart', cartIdentifier, token] });
      queryClient.invalidateQueries({ queryKey: ['customJacketCart', cartIdentifier, token] });
      
      // Also try to refetch immediately to ensure data is fresh
      queryClient.refetchQueries({ queryKey: ['cart', cartIdentifier, token] });
      queryClient.refetchQueries({ queryKey: ['customJacketCart', cartIdentifier, token] });
      
      toast({ title: t('toast.itemRemoved') || 'Item removed from cart' });
    },
    onError: (error) => {
      toast({ title: t('toast.cartError'), description: error.message || t('toast.error'), variant: 'destructive' });
    }
  });

  // Custom jacket mutations
  const addCustomJacketMutation = useMutation({
    mutationFn: (customJacket: Omit<CustomJacketItem, 'id' | 'createdAt'>) =>
      addCustomJacketToCart(customJacket, sessionId, token),
    onSuccess: () => {
      // Invalidate both cart queries to ensure all cart data is refreshed
      const cartIdentifier = token ? 'user' : sessionId;
      queryClient.invalidateQueries({ queryKey: ['cart', cartIdentifier, token] });
      queryClient.invalidateQueries({ queryKey: ['customJacketCart', cartIdentifier, token] });
      toast({ title: 'Custom jacket added to cart' });
    },
    onError: (error) => {
      toast({ title: 'Error adding custom jacket', description: error.message || 'Failed to add to cart', variant: 'destructive' });
    }
  });

  const removeCustomJacketMutation = useMutation({
    mutationFn: (customItemId: string) =>
      removeCustomJacketFromCart(customItemId, sessionId, token),
    onSuccess: () => {
      // Invalidate both cart queries to ensure all cart data is refreshed
      const cartIdentifier = token ? 'user' : sessionId;
      queryClient.invalidateQueries({ queryKey: ['cart', cartIdentifier, token] });
      queryClient.invalidateQueries({ queryKey: ['customJacketCart', cartIdentifier, token] });
      toast({ title: 'Custom jacket removed from cart' });
    },
    onError: (error) => {
      toast({ title: 'Error removing custom jacket', description: error.message || 'Failed to remove from cart', variant: 'destructive' });
    }
  });

  const updateCustomJacketQuantityMutation = useMutation({
    mutationFn: ({ customItemId, quantity }: { customItemId: string; quantity: number }) =>
      updateCustomJacketQuantity(customItemId, quantity, sessionId, token),
    onSuccess: () => {
      // Invalidate both cart queries to ensure all cart data is refreshed
      const cartIdentifier = token ? 'user' : sessionId;
      queryClient.invalidateQueries({ queryKey: ['cart', cartIdentifier, token] });
      queryClient.invalidateQueries({ queryKey: ['customJacketCart', cartIdentifier, token] });
      toast({ title: 'Custom jacket quantity updated' });
    },
    onError: (error) => {
      toast({ title: 'Error updating quantity', description: error.message || 'Failed to update quantity', variant: 'destructive' });
    }
  });

  const clearMutation = useMutation({
    mutationFn: () => {
      // For authenticated users, pass undefined as sessionId
      // For guest users, pass the actual sessionId
      const sessionIdToUse = token ? undefined : sessionId;
      return clearCart(sessionIdToUse, token);
    },
    onSuccess: () => {
      // Invalidate both cart queries to ensure all cart data is refreshed
      const cartIdentifier = token ? 'user' : sessionId;
      
      queryClient.invalidateQueries({ queryKey: ['cart', cartIdentifier, token] });
      queryClient.invalidateQueries({ queryKey: ['customJacketCart', cartIdentifier, token] });
      
      // Also try to refetch immediately to ensure data is fresh
      queryClient.refetchQueries({ queryKey: ['cart', cartIdentifier, token] });
      queryClient.refetchQueries({ queryKey: ['customJacketCart', cartIdentifier, token] });
      
      toast({ title: t('toast.cartUpdated') });
    },
    onError: (error) => {
      toast({ title: t('toast.cartError'), description: error.message || t('toast.error'), variant: 'destructive' });
    }
  });

  const addToCart = async (product_variant_id: number, quantity: number) => {
    // For authenticated users, we can proceed without sessionId
    // For guest users, we need sessionId
    if (!token && !sessionId) {
      toast({ title: t('error.generic'), description: t('common.loading'), variant: 'destructive' });
      return;
    }
    await addMutation.mutateAsync({ product_variant_id, quantity });
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    // For authenticated users, we can proceed without sessionId
    // For guest users, we need sessionId
    if (!token && !sessionId) {
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
    // For authenticated users, we can proceed without sessionId
    // For guest users, we need sessionId
    if (!token && !sessionId) {
      toast({ title: t('error.generic'), description: t('common.loading'), variant: 'destructive' });
      return;
    }
    await removeMutation.mutateAsync({ itemId });
  };

  const clearCartItems = async () => {
    // For authenticated users, we can proceed without sessionId
    // For guest users, we need sessionId
    if (!token && !sessionId) {
      toast({ title: t('error.generic'), description: t('common.loading'), variant: 'destructive' });
      return;
    }
    await clearMutation.mutateAsync();
  };

  const getItemPrice = (item: CartItem): number => {
    // Use the actual_price from the variant directly
    return item?.variant?.actual_price || 0;
  };

  const getCartTotal = () => {
    let totalAmount = 0;
    
    // Calculate total from regular items
    if (items && items.length > 0) {
      
      const regularItemsTotal = items.reduce((total, item) => {
        const price = getItemPrice(item);
        const quantity = item?.quantity ?? 0;
        const itemTotal = price * quantity;
        
        
        return total + itemTotal;
      }, 0);
      
      totalAmount += regularItemsTotal;
    }
    
    // Calculate total from custom jacket items
    if (customItems && customItems.length > 0) {
      const customItemsTotal = customItems.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 0;
        const itemTotal = price * quantity;
        
        
        return total + itemTotal;
      }, 0);
      
      totalAmount += customItemsTotal;
    }
    
    return totalAmount;
  };

  const getCartItemsCount = () => {
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
  };

  // Update custom jacket quantity function
  const handleUpdateCustomJacketQuantity = async (customItemId: string, quantity: number) => {
    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item
      await removeCustomJacketMutation.mutateAsync(customItemId);
      return;
    }
    
    try {
      
      // Use the mutation to update the quantity
      await updateCustomJacketQuantityMutation.mutateAsync({ customItemId, quantity });
      
    } catch (error) {
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        customItems,
        isLoading: isLoading || isLoadingCustom,
        addToCart,
        addCustomJacketToCart: addCustomJacketMutation.mutateAsync,
        updateQuantity,
        updateCustomJacketQuantity: handleUpdateCustomJacketQuantity,
        removeFromCart,
        removeCustomJacketFromCart: removeCustomJacketMutation.mutateAsync,
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