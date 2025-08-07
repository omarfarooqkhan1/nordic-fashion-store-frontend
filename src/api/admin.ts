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
  type?: 'product' | 'variant';
  belongs_to?: string;
  variant_id?: number;
  variant_sku?: string;
  variant_info?: {
    color?: string;
    size?: string;
    sku?: string;
  };
  category?: string;
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
  product_id?: number;
  sku: string;
  color?: string;
  size?: string;
  price_difference?: number;
  stock: number;
  actual_price: number;
  created_at?: string;
  updated_at?: string;
  images?: ProductImage[];
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
  unique_products?: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
}> => {
  try {
    const formData = new FormData();
    formData.append('upload_file', file); // Changed from 'csv_file' to 'upload_file'
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

export const updateCategory = async (
  categoryId: number,
  categoryData: { name: string; description?: string },
  token: string
): Promise<Category> => {
  try {
    const response = await api.put(
      `/categories/${categoryId}`,
      categoryData,
      {
        headers: getAuthHeaders(token),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error updating category:', error);
    throw new Error(error.response?.data?.message || 'Failed to update category');
  }
};

export const deleteCategory = async (
  categoryId: number,
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await api.delete(
      `/categories/${categoryId}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error deleting category:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
};

// Image management functions
export const uploadProductImage = async (
  productId: number,
  imageFile: File,
  token: string
): Promise<ProductImage> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('alt_text', imageFile.name);

    const response = await api.post(
      `/products/${productId}/images`,
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
    console.error('Error uploading image:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

export const deleteProductImage = async (
  productId: number,
  imageId: number,
  token: string
): Promise<{ message: string; variant_info?: any; warning?: string }> => {
  try {
    const response = await api.delete(
      `/products/${productId}/images/${imageId}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting image:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete image');
  }
};

export const getCategorizedImages = async (
  productId: number,
  token: string
): Promise<{
  product_images: ProductImage[];
  variant_images: ProductImage[];
  total_images: number;
  summary: {
    product_image_count: number;
    variant_image_count: number;
    variants_with_images: number;
  };
}> => {
  try {
    const response = await api.get(
      `/products/${productId}/images/categorized`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error getting categorized images:', error);
    throw new Error(error.response?.data?.message || 'Failed to get categorized images');
  }
};

export const updateProductImageOrder = async (
  productId: number,
  imageUpdates: { id: number; sort_order: number }[],
  token: string
): Promise<ProductImage[]> => {
  try {
    const response = await api.put(
      `/products/${productId}/images/reorder`,
      { images: imageUpdates },
      {
        headers: getAuthHeaders(token),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error updating image order:', error);
    throw new Error(error.response?.data?.message || 'Failed to update image order');
  }
};

// Variant Management Functions
export interface VariantFormData {
  size: string;
  color: string;
  sku?: string;
  actual_price: number;
  stock: number;
}

export const createProductVariant = async (
  productId: number,
  variantData: VariantFormData,
  token: string
): Promise<{ message: string; variant: ProductVariant }> => {
  try {
    const response = await api.post(
      `/products/${productId}/variants`,
      variantData,
      {
        headers: getAuthHeaders(token),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating variant:', error);
    throw new Error(error.response?.data?.message || 'Failed to create variant');
  }
};

export const updateProductVariant = async (
  productId: number,
  variantId: number,
  variantData: VariantFormData,
  token: string
): Promise<{ message: string; variant: ProductVariant }> => {
  try {
    const response = await api.put(
      `/products/${productId}/variants/${variantId}`,
      variantData,
      {
        headers: getAuthHeaders(token),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error updating variant:', error);
    throw new Error(error.response?.data?.message || 'Failed to update variant');
  }
};

export const deleteProductVariant = async (
  variantId: number,
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await api.delete(
      `/variants/${variantId}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error deleting variant:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete variant');
  }
};

export const updateProductBasicInfo = async (
  productId: number,
  productData: {
    name: string;
    description: string;
    price: number;
    discount?: number;
    category_id: number;
  },
  token: string
): Promise<{ message: string; product: any }> => {
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
