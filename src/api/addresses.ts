import api from './axios'

export interface Address {
  id: string
  user_id: number
  type?: 'home' | 'work' | 'other'
  label?: string
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateAddressData {
  type?: 'home' | 'work' | 'other'
  label?: string
  street: string
  city: string
  state?: string
  postal_code: string
  country: string
}

export interface UpdateAddressData extends CreateAddressData {
  is_default?: boolean
}

// Get all addresses for the authenticated user
export const fetchUserAddresses = async (): Promise<Address[]> => {
  try {
    const response = await api.get('/user/addresses')
    return response.data.data || []
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch addresses')
  }
}

// Create a new address
export const createAddress = async (addressData: CreateAddressData): Promise<Address> => {
  try {
    const response = await api.post('/user/addresses', {
      type: addressData.type,
      label: addressData.label,
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postal_code,
      country: addressData.country,
    })
    return response.data.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create address')
  }
}

// Update an existing address
export const updateAddress = async (addressId: string, addressData: UpdateAddressData): Promise<Address> => {
  try {
    const response = await api.put(`/user/addresses/${addressId}`, {
      type: addressData.type,
      label: addressData.label,
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postal_code,
      country: addressData.country,
      is_default: addressData.is_default,
    })
    return response.data.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update address')
  }
}

// Delete an address
export const deleteAddress = async (addressId: string): Promise<void> => {
  try {
    await api.delete(`/user/addresses/${addressId}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete address')
  }
}

// Set an address as default
export const setDefaultAddress = async (addressId: string): Promise<Address> => {
  try {
    const response = await api.patch(`/user/addresses/${addressId}/default`)
    return response.data.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to set default address')
  }
}
