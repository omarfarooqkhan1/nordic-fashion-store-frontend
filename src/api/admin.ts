import api from './axios.js';
import axios from 'axios';
import { buildApiHeaders } from './api-headers';

export interface ProductFormData {
  name: string;
  description: string;
  gender: 'male' | 'female' | 'unisex';
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
  gender: 'male' | 'female' | 'unisex';
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
  token: string
): Promise<ProductImage> => {
  try {
    console.log('=== UPLOAD PRODUCT IMAGE START ===');
    console.log('Uploading image for product ID:', productId, 'File:', imageFile.name, 'Size:', imageFile.size);
    console.log('File type:', imageFile.type);
    console.log('File lastModified:', imageFile.lastModified);
    console.log('Token available:', !!token);
    console.log('File object:', imageFile);
    console.log('File instanceof File:', imageFile instanceof File);
    
    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }
    
    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      throw new Error('File too large. Please select an image smaller than 10MB.');
    }
    
    // Test if backend is reachable first
    try {
      const testResponse = await api.get(`/products/${productId}`);
      console.log('Backend reachable, product exists:', testResponse.status === 200);
    } catch (testError) {
      console.error('Backend connectivity test failed:', testError);
      throw new Error('Cannot reach backend server. Please check your connection.');
    }
    
    let formData = new FormData();
    
    // Try multiple approaches to ensure the image field is recognized
    formData.append('image', imageFile, imageFile.name);
    formData.append('file', imageFile, imageFile.name); // Alternative field name
    formData.append('photo', imageFile, imageFile.name); // Another alternative
    formData.append('alt_text', 'Product image');
    
    // Also try without filename parameter
    const formData2 = new FormData();
    formData2.append('image', imageFile);
    formData2.append('alt_text', 'Product image');

    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, `File: ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(key, value);
      }
    }
    
    // Verify the image field exists
    console.log('Image field exists:', formData.has('image'));
    console.log('Image field value:', formData.get('image'));

    // Create a clean axios instance without default headers for FormData
    const formDataApi = axios.create({
      baseURL: api.defaults.baseURL,
      timeout: 60000,
      withCredentials: true,
    });
    
    // Add only the necessary headers for FormData
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for FormData, let axios set it automatically with boundary
    };
    
    console.log('Request headers:', headers);
    console.log('Request URL:', `/products/${productId}/images`);
    
    // Test FormData with a simple approach
    console.log('Testing FormData with fetch...');
    try {
      const testFormData = new FormData();
      testFormData.append('image', imageFile, imageFile.name);
      testFormData.append('alt_text', 'Test');
      
      console.log('Test FormData entries:');
      for (let [key, value] of testFormData.entries()) {
        if (value instanceof File) {
          console.log(key, `File: ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(key, value);
        }
      }
    } catch (testError) {
      console.error('FormData test failed:', testError);
    }

    // Try the upload with retry mechanism
    let response;
    let lastError;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/3`);
        
        // Try different FormData approaches
        let currentFormData = formData;
        if (attempt === 2) {
          console.log('Attempt 2: Using simpler FormData structure');
          currentFormData = formData2;
        } else if (attempt === 3) {
          console.log('Attempt 3: Using native fetch API');
          // Try with native fetch API as a last resort
          const fetchFormData = new FormData();
          fetchFormData.append('image', imageFile);
          fetchFormData.append('alt_text', 'Product image');
          
          console.log('Fetch FormData contents:');
          for (let [key, value] of fetchFormData.entries()) {
            if (value instanceof File) {
              console.log(key, `File: ${value.name} (${value.size} bytes, ${value.type})`);
            } else {
              console.log(key, value);
            }
          }
          
          const fetchResponse = await fetch(`${api.defaults.baseURL}/products/${productId}/images`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              // Don't set Content-Type for FormData, let browser set it
            },
            body: fetchFormData,
          });
          
          if (!fetchResponse.ok) {
            const errorData = await fetchResponse.json();
            throw new Error(`Fetch failed: ${fetchResponse.status} - ${JSON.stringify(errorData)}`);
          }
          
          const fetchData = await fetchResponse.json();
          console.log('Image uploaded successfully via fetch:', fetchData);
          return fetchData;
        }
        
        console.log('Current FormData for attempt', attempt, ':');
        for (let [key, value] of currentFormData.entries()) {
          if (value instanceof File) {
            console.log(key, `File: ${value.name} (${value.size} bytes, ${value.type})`);
          } else {
            console.log(key, value);
          }
        }
        
        response = await formDataApi.post(
          `/products/${productId}/images`,
          currentFormData,
          { 
            headers,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          }
        );
        
        console.log('Image uploaded successfully:', response.data);
        return response.data;
        
      } catch (error: any) {
        lastError = error;
        console.error(`Upload attempt ${attempt} failed:`, error.response?.data);
        
        // Log detailed error information
        if (error.response?.data) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
        }
      }
    }
    
    if (!response) {
      throw lastError;
    }
    
    console.log('Image upload response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Image upload error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error config:', error.config);
    
    // Log detailed validation errors for 422
    if (error.response?.status === 422) {
      console.error('Validation errors:', error.response?.data?.errors);
      console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Handle different types of errors
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
                headers: buildApiHeaders(undefined, token),
      }
    );
    return response.data;
  } catch (error: any) {
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
}

export const createProductVariant = async (
  productId: number,
  variantData: VariantFormData,
  token: string
): Promise<{ message: string; variant: ProductVariant }> => {
  try {
    console.log('Creating variant for product ID:', productId, 'with data:', variantData);
    
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
