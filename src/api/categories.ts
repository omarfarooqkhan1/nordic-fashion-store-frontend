import api from './axios';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriesResponse {
  data: Category[];
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories');
    
    // Handle different response structures
    if (response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};
