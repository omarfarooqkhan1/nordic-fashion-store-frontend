export interface Image {
  id: number;
  url: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Variant {
  id: number;
  sku: string;
  color: string;
  size: string;
  price_difference: string;
  actual_price: number;
  stock: number;
  images: Image[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number; // Changed from string to number to match API response
  category: Category;
  variants: Variant[];
  images: Image[];
  availability?: Record<string, boolean>; // Added to match API response
  variantPrices?: Record<string, number>; // Added to match API response
  created_at: string;
  updated_at: string;
  discount?: number;
}