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
