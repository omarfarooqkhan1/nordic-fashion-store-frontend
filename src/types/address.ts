export interface Address {
  id: string;
  user_id: number;
  type?: 'home' | 'work' | 'other';
  label?: string;
  name?: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAddressData {
  type: 'home' | 'work' | 'other';
  label: string;
  name?: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}
