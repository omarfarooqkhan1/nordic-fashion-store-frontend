export interface Image {
  id: number;
  url: string;
  alt_text: string;
  sort_order: number;
  image_type: 'main' | 'detailed' | 'styling' | 'size_guide'; // Add image type
  is_mobile?: boolean; // Add is_mobile field for mobile-specific images
  created_at: string;
  updated_at: string;
}

export interface Variant {
  id: number;
  sku: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  main_images?: Image[];
  detailed_images?: Image[];
  mobile_detailed_images?: Image[];
  styling_images?: Image[];
  video_path?: string;
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
  gender: 'male' | 'female' | 'unisex';
  category: Category;
  variants: Variant[];
  images: Image[]; // First variant's main images for product listing pages
  detailed_images?: Image[]; // Detailed images
  mobile_detailed_images?: Image[]; // Mobile detailed images
  allImages?: Image[]; // All images including size guide images
  availability?: Record<string, boolean>; // Added to match API response
  variantPrices?: Record<string, number>; // Added to match API response
  similar_products?: Product[]; // Similar products
  created_at: string;
  updated_at: string;
  discount?: number;
  size_guide_image?: string; // Add size guide image field
}