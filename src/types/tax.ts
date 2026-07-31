export interface Tax {
  id: number
  tenant_id: number
  name: string
  rate: number
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TaxForm {
  name: string
  rate: number
  description: string
}

export function createEmptyTax(): TaxForm {
  return {
    name: '',
    rate: 0,
    description: '',
  }
}
