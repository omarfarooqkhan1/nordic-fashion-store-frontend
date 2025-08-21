import api from './axios';
import type { Product } from '@/types/Product';

export const fetchProductById = async (id: number | string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data.data;
};
