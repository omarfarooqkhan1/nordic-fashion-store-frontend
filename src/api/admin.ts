import api from './axios.js';
import axios from 'axios';
import { buildApiHeaders } from './api-headers';

export interface ProductFormData {
  name: string;
  description: string;
  gender: 'male' | 'female' | 'unisex';
  discount?: number; // Add discount field
  category_id: number;
  variants?: ProductVariantFormData[];
  images?: ProductImageFormData[];
  styling_images?: string[]; // Array of styling image URLs
  mobile_detailed_images?: string[]; // Array of mobile detailed image URLs
}

export interface ProductVariantFormData {
  id?: number;
  sku: string;
  color?: string;
  size?: string;
  price?: number;
  stock: number;
  video_url?: string;
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
  gender: 'male' | 'female' | 'unisex';
  price: string;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  created_at: string;
  updated_at: string;
  discount?: number; // Add discount field
  allImages?: ProductImage[]; // Add allImages field
  size_guide_image?: string; // Add size guide image field
}

export interface ProductVariant {
  id: number;
  product_id?: number;
  sku: string;
  color?: string;
  size?: string;
  price?: number;
  stock: number;
  actual_price: number;
  created_at?: string;
  updated_at?: string;
  main_images?: ProductImage[];
  detailed_images?: ProductImage[];
  mobile_detailed_images?: ProductImage[];
  styling_images?: ProductImage[];
  video_path?: string;
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  sort_order: number;
  image_type?: 'main' | 'detailed' | 'styling' | 'size_guide'; // Add image type field
  is_mobile?: boolean; // Add is_mobile field
}

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
                headers: buildApiHeaders(undefined, token),
      }
    );
    
    // Debug: Log the response to see the structure
    console.log('Create product response:', response.data);
    
    // Handle different response structures
    const product = response.data?.data || response.data;
    
    if (!product || !product.id) {
      console.error('Invalid product response:', response.data);
      throw new Error('Invalid product response from server');
    }
    
    return product;
  } catch (error: any) {
    console.error('Create product error:', error);
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
                headers: buildApiHeaders(undefined, token),
      }
    );
    
    return response.data;
  } catch (error: any) {
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
                headers: buildApiHeaders(undefined, token),
      }
    );
  } catch (error: any) {
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
                    ...buildApiHeaders(undefined, token),
                    'Content-Type': 'multipart/form-data',
                },
      }
    );
    
    return response.data;
  } catch (error: any) {
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
                headers: buildApiHeaders(undefined, token),
        responseType: 'blob',
      }
    );
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to download template');
  }
};

// Admin Dashboard API functions
export interface AdminStats {
  total_products: number;
  total_categories: number;
  total_variants: number;
  total_customers: number;
  total_admins: number;
  low_stock_variants: number;
  new_orders: number;
  new_registrations: number;
  pending_orders: number;
  shipped_orders: number;
  new_contact_forms: number;
  unread_contact_forms: number;
  recent_revenue: number;
  total_revenue: number;
}

export interface AdminRegistration {
  id: number;
  name: string;
  email: string;
  role: string;
  registered_at: string;
  time_ago: string;
  is_notified: boolean;
}

export interface AdminOrder {
  id: number;
  order_number: number;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  time_ago: string;
}

export const getAdminStats = async (token: string, dateFilter = '30'): Promise<AdminStats> => {
  try {
    const response = await api.get(
      `/admin/stats?date_filter=${dateFilter}`,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch admin stats');
  }
};

export const getRecentRegistrations = async (
  token: string,
  limit = 10,
  days = 7
): Promise<{ registrations: AdminRegistration[]; total_count: number }> => {
  try {
    const response = await api.get(
      `/admin/recent-registrations?limit=${limit}&days=${days}`,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recent registrations');
  }
};

export const getRecentOrders = async (
  token: string,
  limit = 10,
  days = 7
): Promise<{ orders: AdminOrder[]; total_count: number }> => {
  try {
    const response = await api.get(
      `/admin/recent-orders?limit=${limit}&days=${days}`,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recent orders');
  }
};

export const markRegistrationAsNotified = async (
  token: string,
  userId: number
): Promise<{ message: string }> => {
  try {
    const response = await api.post(
      `/admin/users/${userId}/mark-notified`,
      {},
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to mark registration as notified');
  }
};

// User Management Types
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'banned';
  orders_count?: number;
  total_spent?: number;
}

export interface UserFormData {
  name: string;
  email: string;
  role: 'customer' | 'admin';
  status?: 'active' | 'inactive' | 'banned';
  password?: string;
}

// User Management API Functions
export const getAllUsers = async (
  token: string,
  page = 1,
  limit = 20,
  search = '',
  role = '',
  status = ''
): Promise<{
  users: AdminUser[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role }),
      ...(status && { status })
    });

    const response = await api.get(
      `/admin/users?${params.toString()}`,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const getUserById = async (
  userId: number,
  token: string
): Promise<AdminUser> => {
  try {
    const response = await api.get(
      `/admin/users/${userId}`,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
};

export const createUser = async (
  userData: UserFormData,
  token: string
): Promise<AdminUser> => {
  try {
    const response = await api.post(
      '/admin/users',
      userData,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create user');
  }
};

export const updateUser = async (
  userId: number,
  userData: Partial<UserFormData>,
  token: string
): Promise<AdminUser> => {
  try {
    const response = await api.put(
      `/admin/users/${userId}`,
      userData,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
};

export const deleteUser = async (
  userId: number,
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await api.delete(
      `/admin/users/${userId}`,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

export const updateUserStatus = async (
  userId: number,
  status: 'active' | 'inactive' | 'banned',
  token: string
): Promise<AdminUser> => {
  try {
    const response = await api.patch(
      `/admin/users/${userId}/status`,
      { status },
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update user status');
  }
};

export const resetUserPassword = async (
  userId: number,
  token: string
): Promise<{ message: string; temporary_password: string }> => {
  try {
    const response = await api.post(
      `/admin/users/${userId}/reset-password`,
      {},
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reset user password');
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories');
    return response.data.data || response.data;
  } catch (error: any) {
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
                headers: buildApiHeaders(undefined, token),
      }
    );
    
    return response.data;
  } catch (error: any) {
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
                headers: buildApiHeaders(undefined, token),
      }
    );
    
    return response.data;
  } catch (error: any) {
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
                headers: buildApiHeaders(undefined, token),
      }
    );
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
};

// Image management functions
export const uploadProductImage = async (
  productId: number,
  imageFile: File,
  token: string,
  imageType?: string,
  variantId?: number // Add variantId parameter
): Promise<ProductImage> => {
  try {
    console.log('=== UPLOAD PRODUCT IMAGE START ===');
    console.log('Uploading image for product ID:', productId, 'File:', imageFile.name, 'Size:', imageFile.size);
    try {
      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please select an image file.');
      }
      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        throw new Error('File too large. Please select an image smaller than 10MB.');
      }

      const formData = new FormData();
      formData.append('image', imageFile, imageFile.name);
      formData.append('alt_text', 'Product image');
      if (imageType) {
        formData.append('image_type', imageType);
      }
      if (variantId) {
        formData.append('variant_id', variantId.toString());
      }

      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        // Let axios set Content-Type for FormData
      };

      const response = await axios.post(
        `${api.defaults.baseURL}/products/${productId}/images`,
        formData,
        {
          headers,
          withCredentials: true,
          timeout: 60000,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Network error: Unable to connect to server');
      } else if (error.response?.status === 413) {
        throw new Error('File too large: Please use an image smaller than 10MB');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed: Please log in again');
      } else if (error.response?.status === 404) {
        throw new Error('Product not found: The product may have been deleted');
      } else if (error.response?.status === 422) {
        throw new Error('Invalid file: Please ensure the file is a valid image');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to upload image');
      }
    }
  } catch (error: any) {
    console.error('Upload product image error:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload product image');
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
                headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
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
                headers: buildApiHeaders(undefined, token),
      }
    );
    
    return response.data;
  } catch (error: any) {
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
  temp_image_ids?: number[]; // Add temp_image_ids for new variants
}

export const createProductVariant = async (
  productId: number,
  variantData: VariantFormData,
  token: string
): Promise<{ message: string; variant: ProductVariant }> => {
  try {
    console.log('Creating variant for product ID:', productId, 'with data:', variantData);
    try {
      console.log('[createProductVariant] Request body:', JSON.stringify(variantData, null, 2));
    } catch (e) {
      console.log('[createProductVariant] Could not stringify variantData');
    }
    
    const response = await api.post(
      `/products/${productId}/variants`,
      variantData,
      {
                headers: buildApiHeaders(undefined, token),
      }
    );
    
    console.log('Create variant response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Create variant error:', error);
    console.error('Error response:', error.response?.data);
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
                headers: buildApiHeaders(undefined, token),
      }
    );
    
    return response.data;
  } catch (error: any) {
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
                headers: buildApiHeaders(undefined, token),
      }
    );
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete variant');
  }
};

export const updateProductBasicInfo = async (
  productId: number,
  productData: {
    name: string;
    description: string;
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
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
};

export const uploadProductImages = async (
  productId: number,
  imageFiles: File[],
  token: string,
  altTexts?: string[]
): Promise<any> => {
  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  // Upload images one by one since backend expects single 'image' field
  const results = [];
  for (let idx = 0; idx < imageFiles.length; idx++) {
    const file = imageFiles[idx];
    const formData = new FormData();
    formData.append('image', file, file.name);
    if (altTexts && altTexts[idx]) {
      formData.append('alt_text', altTexts[idx]);
    }
    
    const response = await axios.post(
      `${api.defaults.baseURL}/products/${productId}/images`,
      formData,
      { headers }
    );
    results.push(response.data);
  }
  
  return results;
};

// Add the missing deleteProductImage function
export const deleteProductImage = async (
  productId: number,
  imageId: number,
  token: string
): Promise<{ message: string; warning?: string; variant_info?: { color: string; size: string } }> => {
  try {
    const response = await api.delete(
      `/products/${productId}/images/${imageId}`,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete image');
  }
};

// FAQ Management Types
export interface FaqFormData {
  question: string;
  answer: string;
  order?: number;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

// FAQ Management API Functions
export const getAllFaqs = async (token: string): Promise<Faq[]> => {
  try {
    const response = await api.get(
      '/faqs',
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch FAQs');
  }
};

export const createFaq = async (
  faqData: FaqFormData,
  token: string
): Promise<Faq> => {
  try {
    const response = await api.post(
      '/faqs',
      faqData,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create FAQ');
  }
};

export const updateFaq = async (
  faqId: number,
  faqData: FaqFormData,
  token: string
): Promise<Faq> => {
  try {
    const response = await api.put(
      `/faqs/${faqId}`,
      faqData,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update FAQ');
  }
};

export const deleteFaq = async (
  faqId: number,
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await api.delete(
      `/faqs/${faqId}`,
      {
        headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete FAQ');
  }
};
