import api from './axios';
import type { Cart, CartItem } from '@/types/Cart';

/**
 * Helper function to construct headers, including optional session ID and bearer token.
 * @param sessionId - Optional session ID for guest carts.
 * @param bearerToken - Optional Bearer token for authenticated users.
 * @returns An object containing HTTP headers.
 */
const getHeaders = (sessionId?: string, bearerToken?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json', // Ensure content type is always JSON for POST/PUT requests
  };
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }
  return headers;
};

export const fetchCart = async (sessionId?: string, bearerToken?: string): Promise<Cart> => {
    try {
            const response = await api.get('/cart', {
        headers: getHeaders(sessionId, bearerToken),
    });
    return response.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch cart');
    }
};

export const addOrUpdateCartItem = async (
  productVariantId: number,
  quantity: number,
  sessionId?: string,
  bearerToken?: string
): Promise<CartItem> => {
  try {
    const response = await api.post(
        '/cart',
        { product_variant_id: productVariantId, quantity },
        {
        headers: getHeaders(sessionId, bearerToken),
        }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding/updating cart item:', error);
    throw new Error(error.response?.data?.message || 'Failed to add/update cart item');
  }
};

export const updateCartItem = async (
  itemId: number,
  quantity: number,
  sessionId?: string,
  bearerToken?: string
): Promise<CartItem> => {
  try {
        const response = await api.put(
            `/cart/${itemId}`,
            { quantity },
            {
            headers: getHeaders(sessionId, bearerToken),
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw new Error(error.response?.data?.message || 'Failed to update cart item');
    }
};

export const removeCartItem = async (
  itemId: number,
  sessionId?: string,
  bearerToken?: string
): Promise<void> => {
    try {
        await api.delete(`/cart/${itemId}`, {
            headers: getHeaders(sessionId, bearerToken),
        });
    } catch (error) {
        console.error('Error removing cart item:', error);
        throw new Error(error.response?.data?.message || 'Failed to remove cart item');
    }
};

export const clearCart = async (sessionId?: string, bearerToken?: string): Promise<void> => {
  try {
      await api.delete('/cart', {
    headers: getHeaders(sessionId, bearerToken),
  });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
};