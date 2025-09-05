import api from './axios';
import type { Product } from '@/types/Product';

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/products');
    
    // Handle the nested structure: response.data.data.data (ProductCollection wraps data)
    if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }
    // Handle single nested structure: response.data.data
    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Fallback for direct array response
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw error;
  }
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  // Handle both old and new response formats
  if (response.data.data) {
    return response.data.data;
  }
  // Fallback for direct response
  return response.data;
};