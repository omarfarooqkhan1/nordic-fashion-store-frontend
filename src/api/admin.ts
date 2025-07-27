import api from './axios.js';

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: number;
  variants?: ProductVariantFormData[];
  images?: ProductImageFormData[];
}

export interface ProductVariantFormData {
  id?: number;
  sku: string;
  color?: string;
  size?: string;
  price_difference?: number;
  stock: number;
}

export interface ProductImageFormData {
  url: string;
  alt_text?: string;
  sort_order?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  color?: string;
  size?: string;
  price_difference?: number;
  stock: number;
  actual_price: number;
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  sort_order: number;
}

const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Admin Products API
export const createProduct = async (
  productData: ProductFormData,
  token: string
): Promise<Product> => {
  try {
    const response = await api.post(
      '/products',
      productData,
      {
        headers: getAuthHeaders(token),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
};

export const updateProduct = async (
  productId: number,
  productData: ProductFormData,
  token: string
): Promise<Product> => {
  try {
    const response = await api.put(
      `/products/${productId}`,
      productData,
      {
        headers: getAuthHeaders(token),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error updating product:', error);
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
};

export const deleteProduct = async (
  productId: number,
  token: string
): Promise<void> => {
  try {
    await api.delete(
      `/products/${productId}`,
      {
        headers: getAuthHeaders(token),
      }
    );
  } catch (error: any) {
    console.error('Error deleting product:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
};

export const bulkUploadProducts = async (
  file: File,
  updateExisting: boolean,
  token: string
): Promise<{
  total_rows: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
}> => {
  try {
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('update_existing', updateExisting ? '1' : '0');

    const response = await api.post(
      '/products/bulk-upload',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error uploading products:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload products');
  }
};

export const getBulkUploadTemplate = async (
  token: string
): Promise<Blob> => {
  try {
    const response = await api.get(
      '/products/bulk-upload/template',
      {
        headers: getAuthHeaders(token),
        responseType: 'blob',
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error downloading template:', error);
    throw new Error(error.response?.data?.message || 'Failed to download template');
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories');
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

export const createCategory = async (
  categoryData: { name: string; description?: string },
  token: string
): Promise<Category> => {
  try {
    const response = await api.post(
      '/categories',
      categoryData,
      {
        headers: getAuthHeaders(token),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating category:', error);
    throw new Error(error.response?.data?.message || 'Failed to create category');
  }
};
