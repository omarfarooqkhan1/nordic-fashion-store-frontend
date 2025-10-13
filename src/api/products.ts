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
    console.error('[api/products.ts] fetchProducts error:', error);
    throw error;
  }
};

export const fetchProductById = async (id: string): Promise<Product> => {
  try {
    // Include allImages and variants.images relationships to ensure complete product data
    const response = await api.get(`/products/${id}`);

    // Handle both old and new response formats
    let productData;
    if (response.data.data) {
      productData = response.data.data;
    } else {
      // Fallback for direct response
      productData = response.data;
    }

    return productData;
  } catch (error) {
    console.error('[api/products.ts] fetchProduct details error:', error);
    throw error;
  }
};