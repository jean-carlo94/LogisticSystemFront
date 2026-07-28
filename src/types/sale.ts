export interface SaleItem {
  id: number
  product_id: number
  product_name: string
  shelf_id: number
  shelf_code: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type SaleStatus = 'pending' | 'completed' | 'cancelled'

export interface Sale {
  id: number
  customer_name: string
  total: number
  status: SaleStatus
  notes: string | null
  created_at: string
  created_by: number
  items?: SaleItem[]
}

export interface CreateSalePayload {
  customer_name: string
  notes?: string
  items: CreateSaleItemPayload[]
}

export interface CreateSaleItemPayload {
  product_id: number
  shelf_id: number
  quantity: number
  unit_price: number
}

export interface ProductLocation {
  shelf_id: number
  code: string
  aisle: string
  row: number
  level: number
  quantity: number
}

export interface CartItem {
  product_id: number
  product_name: string
  shelf_id: number
  shelf_code: string
  quantity: number
  unit_price: number
  stock: number
}
