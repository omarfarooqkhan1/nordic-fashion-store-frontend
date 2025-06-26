export interface CartItem {
  id: number;
  product_variant_id: number;
  quantity: number;
  variant: {
    id: number;
    size: string;
    color: string;
    actual_price: number;
    product: {
      id: number;
      name: string;
      images: { url: string }[];
      category: { name: string };
      variants: any[];
    };
  };
}

export interface Cart {
  id: number;
  user_id?: number;
  session_id?: string;
  items: CartItem[];
}