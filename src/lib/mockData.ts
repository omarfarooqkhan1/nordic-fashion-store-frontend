export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'bags' | 'wallets' | 'belts' | 'jackets' | 'accessories' | 'other';
  images: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  isNew?: boolean;
  discount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Nordic Explorer Backpack',
    description: 'Handcrafted leather backpack perfect for Nordic adventures. Made from premium full-grain leather with brass hardware.',
    price: 2490,
    category: 'bags',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600'],
    sizes: ['S', 'M', 'L'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    featured: true
  },
  {
    id: '2',
    name: 'Scandinavian Gentleman Wallet',
    description: 'Minimalist leather wallet crafted for the modern Nordic gentleman. Features RFID protection and Italian leather.',
    price: 890,
    category: 'wallets',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 'https://images.unsplash.com/photo-1608901494796-c6c9cd2a2825?w=600'],
    sizes: ['One Size'],
    colors: ['Black', 'Brown', 'Navy'],
    inStock: true,
    featured: true
  },
  {
    id: '3',
    name: 'Cowhide Heritage Belt',
    description: 'Luxurious cowhide belt with natural spotted pattern. Features premium gold-tone hardware and hand-finished edges.',
    price: 1650,
    category: 'belts',
    images: ['/lovable-uploads/731fa0a1-188d-4f8d-9829-7fde55e5e458.png', 'https://images.unsplash.com/photo-1575056320028-b9bb9590db6e?w=600'],
    sizes: ['80cm', '85cm', '90cm', '95cm', '100cm'],
    colors: ['Cream Cowhide', 'Natural', 'Spotted'],
    inStock: true,
    featured: true,
    isNew: true
  },
  {
    id: '4',
    name: 'Arctic Rider Jacket',
    description: 'Premium leather jacket designed for Nordic winters. Features thermal lining and weatherproof treatment.',
    price: 4990,
    category: 'jackets',
    images: ['https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600', 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=600'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Brown', 'Dark Brown'],
    inStock: true,
    featured: true
  },
  {
    id: '5',
    name: 'Fjord Messenger Bag',
    description: 'Professional leather messenger bag for the Nordic businessman. Handstitched with vegetable-tanned leather.',
    price: 1890,
    category: 'bags',
    images: ['https://images.unsplash.com/photo-1575056320028-b9bb9590db6e?w=600', 'https://images.unsplash.com/photo-1586336321045-6829b2a9b4b7?w=600'],
    sizes: ['M', 'L'],
    colors: ['Brown', 'Cognac', 'Black'],
    inStock: true,
    featured: false
  },
  {
    id: '6',
    name: 'Nordic Key Holder',
    description: 'Elegant leather key holder with magnetic closure. Perfect accessory for the organized Nordic lifestyle.',
    price: 490,
    category: 'accessories',
    images: ['https://images.unsplash.com/photo-1608901494796-c6c9cd2a2825?w=600', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600'],
    sizes: ['One Size'],
    colors: ['Black', 'Brown', 'Tan'],
    inStock: true,
    featured: false
  },
  {
    id: '7',
    name: 'Executive Business Wallet',
    description: 'Premium executive wallet with RFID blocking technology. Crafted from Italian calfskin leather.',
    price: 1250,
    category: 'wallets',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 'https://images.unsplash.com/photo-1608901494796-c6c9cd2a2825?w=600'],
    sizes: ['One Size'],
    colors: ['Black', 'Brown', 'Burgundy'],
    inStock: true,
    featured: false,
    isNew: true
  },
  {
    id: '8',
    name: 'Minimalist Card Holder',
    description: 'Ultra-slim card holder for the modern minimalist. Holds up to 8 cards with easy access.',
    price: 420,
    category: 'wallets',
    images: ['https://images.unsplash.com/photo-1608901494796-c6c9cd2a2825?w=600'],
    sizes: ['One Size'],
    colors: ['Black', 'Brown'],
    inStock: true,
    featured: false
  },
  {
    id: '9',
    name: 'Classic Bifold Wallet',
    description: 'Traditional bifold wallet with coin pocket. Handcrafted from full-grain leather.',
    price: 690,
    category: 'wallets',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 'https://images.unsplash.com/photo-1608901494796-c6c9cd2a2825?w=600'],
    sizes: ['One Size'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    featured: false
  },
  {
    id: '10',
    name: 'Travel Document Wallet',
    description: 'Spacious travel wallet for passports, boarding passes, and cards. Perfect for the frequent traveler.',
    price: 950,
    category: 'wallets',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 'https://images.unsplash.com/photo-1608901494796-c6c9cd2a2825?w=600'],
    sizes: ['One Size'],
    colors: ['Black', 'Brown', 'Navy'],
    inStock: false,
    featured: false
  },
  {
    id: '11',
    name: 'Money Clip Wallet',
    description: 'Sleek money clip with card slots. Perfect combination of style and functionality.',
    price: 580,
    category: 'wallets',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'],
    sizes: ['One Size'],
    colors: ['Black', 'Silver'],
    inStock: true,
    featured: false,
    discount: 15
  },
  {
    id: '12',
    name: 'Heritage Tote Bag',
    description: 'Spacious leather tote bag perfect for work or shopping. Features sturdy handles and interior pockets.',
    price: 1650,
    category: 'bags',
    images: ['https://images.unsplash.com/photo-1575056320028-b9bb9590db6e?w=600', 'https://images.unsplash.com/photo-1586336321045-6829b2a9b4b7?w=600'],
    sizes: ['M', 'L'],
    colors: ['Brown', 'Black', 'Cognac'],
    inStock: true,
    featured: false
  },
  {
    id: '13',
    name: 'Urban Crossbody Bag',
    description: 'Compact crossbody bag for city adventures. Features adjustable strap and secure zip closure.',
    price: 890,
    category: 'bags',
    images: ['https://images.unsplash.com/photo-1575056320028-b9bb9590db6e?w=600', 'https://images.unsplash.com/photo-1586336321045-6829b2a9b4b7?w=600'],
    sizes: ['One Size'],
    colors: ['Black', 'Brown'],
    inStock: true,
    featured: false
  },
  {
    id: '14',
    name: 'Classic Dress Belt',
    description: 'Elegant dress belt perfect for formal occasions. Features subtle stitching and polished buckle.',
    price: 650,
    category: 'belts',
    images: ['https://images.unsplash.com/photo-1586336321045-6829b2a9b4b7?w=600', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'],
    sizes: ['80cm', '85cm', '90cm', '95cm', '100cm'],
    colors: ['Black', 'Brown'],
    inStock: true,
    featured: false
  },
  {
    id: '15',
    name: 'Vintage Leather Jacket',
    description: 'Timeless leather jacket with vintage appeal. Soft lambskin leather with classic cut.',
    price: 3890,
    category: 'jackets',
    images: ['https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600', 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=600'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Brown'],
    inStock: true,
    featured: false,
    discount: 20
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    items: [
      {
        product: mockProducts[0],
        quantity: 1,
        size: 'M',
        color: 'Brown'
      }
    ],
    total: 2490,
    status: 'processing',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'ORD-002',
    customerId: 'CUST-002',
    items: [
      {
        product: mockProducts[1],
        quantity: 2,
        color: 'Black'
      },
      {
        product: mockProducts[5],
        quantity: 1,
        color: 'Brown'
      }
    ],
    total: 2270,
    status: 'shipped',
    createdAt: '2024-01-14T14:20:00Z'
  }
];

// Mock API functions
export const mockAPI = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return mockProducts;
  },

  getProduct: async (id: string): Promise<Product | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts.find(p => p.id === id) || null;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockProducts.filter(p => p.featured);
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockProducts.filter(p => p.category === category);
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockOrders;
  },

  createOrder: async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newOrder: Order = {
      ...order,
      id: `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    mockOrders.push(newOrder);
    return newOrder;
  },

  // Admin functions
  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newProduct: Product = {
      ...product,
      id: String(mockProducts.length + 1)
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    mockProducts[index] = { ...mockProducts[index], ...updates };
    return mockProducts[index];
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    mockProducts.splice(index, 1);
    return true;
  }
};