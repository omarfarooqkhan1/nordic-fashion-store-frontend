import api from './axios';
import type { Product } from '@/types/Product';

export interface ProductsResponse {
  data: Product[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more_pages: boolean;
  };
}

export interface ProductFilters {
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  gender?: string;
  sort_by?: 'name' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export const fetchProducts = async (filters?: ProductFilters): Promise<ProductsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/products?${params.toString()}`);
    
    // Handle the response structure
    if (response.data.data && response.data.pagination) {
      return {
        data: response.data.data.data || response.data.data,
        pagination: response.data.pagination
      };
    }
    
    // Fallback for non-paginated response
    const products = Array.isArray(response.data) ? response.data : 
                    response.data.data ? (Array.isArray(response.data.data) ? response.data.data : response.data.data.data || []) : [];
    
    return {
      data: products,
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: products.length,
        total: products.length,
        has_more_pages: false
      }
    };
  } catch (error) {
    throw error;
  }
};

// Keep the old function for backward compatibility
export const fetchAllProducts = async (): Promise<Product[]> => {
  const response = await fetchProducts({ per_page: 1000 });
  return response.data;
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
    throw error;
  }
};