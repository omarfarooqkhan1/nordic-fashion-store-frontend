import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchCart, addOrUpdateCartItem, updateCartItem, removeCartItem, clearCart 
} from '@/api/cart';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/types/Cart';

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product_variant_id: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCartItems: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  // State to store the bearer token
  const [bearerToken, setBearerToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Handle session ID for guest carts
    let currentSessionId = localStorage.getItem('nordic_fashion_cart_session_id');
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID(); 
      localStorage.setItem('nordic_fashion_cart_session_id', currentSessionId);
    }
    setSessionId(currentSessionId);

    // Retrieve bearer token from localStorage
    const token = localStorage.getItem('accessToken'); // Assuming 'accessToken' is the key
    if (token) {
      setBearerToken(token);
    }
  }, []); // Run only once on component mount

  // Fetch cart data, enabled only when sessionId is available
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart', sessionId, bearerToken], // Add bearerToken to queryKey to refetch if token changes
    queryFn: () => fetchCart(sessionId, bearerToken), // Pass both sessionId and bearerToken to fetchCart
    staleTime: 5 * 60 * 1000, 
    enabled: !!sessionId, // Only run the query if sessionId is truthy
    onError: (error) => {
      console.error('Error fetching cart:', error);
      toast({ title: 'Error fetching cart', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
    }
  });

  const addMutation = useMutation({
    mutationFn: ({ product_variant_id, quantity }: { product_variant_id: number; quantity: number; }) =>
      addOrUpdateCartItem(product_variant_id, quantity, sessionId, bearerToken), // Pass sessionId and bearerToken
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']); 
      toast({ title: 'Added to cart' });
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
      toast({ title: 'Error adding to cart', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number; }) =>
      updateCartItem(itemId, quantity, sessionId, bearerToken), // Pass sessionId and bearerToken
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']); 
      toast({ title: 'Cart updated' });
    },
    onError: (error) => {
      console.error('Error updating cart:', error);
      toast({ title: 'Error updating cart', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
    }
  });

  const removeMutation = useMutation({
    mutationFn: ({ itemId }: { itemId: number; }) =>
      removeCartItem(itemId, sessionId, bearerToken), // Pass sessionId and bearerToken
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']); 
      toast({ title: 'Item removed' });
    },
    onError: (error) => {
      console.error('Error removing item:', error);
      toast({ title: 'Error removing item', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
    }
  });

  const clearMutation = useMutation({
    mutationFn: () =>
      clearCart(sessionId, bearerToken), // Pass sessionId and bearerToken
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']); 
      toast({ title: 'Cart cleared' });
    },
    onError: (error) => {
      console.error('Error clearing cart:', error);
      toast({ title: 'Error clearing cart', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
    }
  });

  const items = cart?.items || [];

  const addToCart = async (product_variant_id: number, quantity: number) => {
    if (!sessionId) {
      toast({ title: 'Error', description: 'Session not ready. Please try again.', variant: 'destructive' });
      return;
    }
    await addMutation.mutateAsync({ product_variant_id, quantity });
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!sessionId) {
      toast({ title: 'Error', description: 'Session not ready. Please try again.', variant: 'destructive' });
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
      toast({ title: 'Error', description: 'Session not ready. Please try again.', variant: 'destructive' });
      return;
    }
    await removeMutation.mutateAsync({ itemId });
  };

  const clearCartItems = async () => {
    if (!sessionId) {
      toast({ title: 'Error', description: 'Session not ready. Please try again.', variant: 'destructive' });
      return;
    }
    await clearMutation.mutateAsync();
  };

  const getCartTotal = () =>
    items.reduce((total, item) => total + item.variant.actual_price * item.quantity, 0);

  const getCartItemsCount = () =>
    items.reduce((total, item) => total + item.quantity, 0);

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