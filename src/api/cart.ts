import api from './axios';
import type { Cart, CartItem, CustomJacketItem } from '@/types/Cart';
import axios from 'axios'; // Added axios import for custom jacket operations

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
        const headers = getHeaders(sessionId, bearerToken);
        
        const response = await api.get('/cart', {
            headers: headers,
        });
        
        return response.data;
    } catch (error) {
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
    const headers = getHeaders(sessionId, bearerToken);
    
    const response = await api.post(
        '/cart',
        { product_variant_id: productVariantId, quantity },
        {
        headers: headers,
        }
    );
    
    return response.data;
  } catch (error) {
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
        throw new Error(error.response?.data?.message || 'Failed to remove cart item');
    }
};

export const clearCart = async (sessionId?: string, bearerToken?: string): Promise<void> => {
  try {
      await api.delete('/cart', {
    headers: getHeaders(sessionId, bearerToken),
  });
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
};

// Custom Jacket Cart Operations
export const addCustomJacketToCart = async (
  customJacket: Omit<CustomJacketItem, 'id' | 'createdAt'>,
  sessionId: string | undefined,
  token?: string
): Promise<CustomJacketItem> => {
  try {
    // Convert base64 images to blobs
    const frontBlob = await dataURLToBlob(customJacket.frontImageUrl);
    const backBlob = await dataURLToBlob(customJacket.backImageUrl);
    
    // Create FormData
    const formData = new FormData();
    formData.append('front_image', frontBlob, 'front.png');
    formData.append('back_image', backBlob, 'back.png');
    formData.append('jacket_data', JSON.stringify({
      ...customJacket,
      frontImageUrl: undefined, // Remove base64, backend will provide URLs
      backImageUrl: undefined
    }));
    
    // Only append session_id if it exists (for guest users)
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    for (const [key, value] of formData.entries()) {
      if (value instanceof Blob) {
      } else {
      }
    }

    const response = await api.post('/cart/custom-jacket', formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper function to convert base64 to blob
const dataURLToBlob = async (dataURL: string): Promise<Blob> => {
  try {
    // Parse the data URL
    const arr = dataURL.split(',');
    if (arr.length !== 2) {
      throw new Error('Invalid data URL format');
    }
    
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  } catch (error) {
    throw new Error('Failed to convert image data to blob');
  }
};

export const removeCustomJacketFromCart = async (
  customItemId: string,
  sessionId: string | undefined,
  token?: string
): Promise<void> => {
  const params: any = {};
  
  // Only add session_id to params if it exists (for guest users)
  if (sessionId) {
    params.session_id = sessionId;
  }
  
  await api.delete(`/cart/custom-jacket/${customItemId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    params: params
  });
};

export const fetchCustomJacketCart = async (
  sessionId: string | undefined,
  token?: string
): Promise<CustomJacketItem[]> => {
  const params: any = {};
  
  // Only add session_id to params if it exists (for guest users)
  if (sessionId) {
    params.session_id = sessionId;
  }
  
  
  const response = await api.get('/cart/custom-jackets', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    params: params
  });
  
  return response.data;
};

// Combined cart fetch function that gets both regular and custom items
export const fetchCombinedCart = async (
  sessionId?: string,
  bearerToken?: string
): Promise<{ regularItems: CartItem[]; customItems: CustomJacketItem[] }> => {
  try {
    
    // Fetch both regular cart and custom jacket cart in parallel
    const [regularCart, customItems] = await Promise.all([
      fetchCart(sessionId, bearerToken),
      fetchCustomJacketCart(sessionId, bearerToken) // Pass undefined for authenticated users
    ]);

    return {
      regularItems: regularCart.cart?.items || [],
      customItems: customItems || []
    };
  } catch (error) {
    // Return empty arrays if either fetch fails
    return {
      regularItems: [],
      customItems: []
    };
  }
};

export const updateCustomJacketQuantity = async (
  customItemId: string,
  quantity: number,
  sessionId: string | undefined,
  token?: string
): Promise<CustomJacketItem> => {
  try {
    
    const params: any = {};
    
    // Only add session_id to params if it exists (for guest users)
    if (sessionId) {
      params.session_id = sessionId;
    }
    
    const response = await api.put(`/cart/custom-jacket/${customItemId}`, {
      quantity: quantity
    }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: params
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update custom jacket quantity');
  }
};