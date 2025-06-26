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
  price: string; // Note: string here; you may want to convert to number in your app
  category: Category;
  variants: Variant[];
  images: Image[];
  created_at: string;
  updated_at: string;
  discount?: number;
}