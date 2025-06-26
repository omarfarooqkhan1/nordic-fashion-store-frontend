import api from './axios';
import type { Product } from '@/types/Product';

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  console.log('Fetched products:', response.data.data);
  return response.data.data;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data.data;
};