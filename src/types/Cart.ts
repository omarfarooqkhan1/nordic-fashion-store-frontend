export interface CartItem {
  id: number;
  product_variant_id: number;
  quantity: number;
  variant: {
    id: number;
    size: string;
    color: string;
    actual_price: number;
    price_difference: string;
    product: {
      id: number;
      name: string;
      gender: 'male' | 'female' | 'unisex';
      price: string;
      images: { url: string }[];
      category: { name: string };
      variants: any[];
    };
  };
}

export interface CustomJacketItem {
  id: string;
  type: 'custom_jacket';
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  frontImageUrl: string; // Cloudinary URL for front view with logos
  backImageUrl: string;  // Cloudinary URL for back view with logos
  logos: Array<{
    id: string;
    src: string;
    position: { x: number; y: number };
    view: 'front' | 'back';
  }>;
  customDescription?: string;
  createdAt: Date;
}

export interface Cart {
  cart: {
    id: number;
    user_id?: number;
    session_id?: string;
    items: CartItem[];
  };
  stock_adjustments?: any[];
  message?: string;
}