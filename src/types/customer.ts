export interface Customer {
  id: number
  tenant_id: number
  name: string
  email: string | null
  phone: string | null
  document: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface CustomerForm {
  name: string
  email: string
  phone: string
  document: string
  address: string
}

export function createEmptyCustomer(): CustomerForm {
  return {
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
  }
}
