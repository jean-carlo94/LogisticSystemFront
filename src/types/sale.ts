export interface SaleItem {
  id: number
  product_id: number
  product_name: string
  shelf_id: number | null
  shelf_code: string | null
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Sale {
  id: number
  customer_name: string
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  created_by: number
  items?: SaleItem[]
}

export interface CreateSalePayload {
  customer_name: string
  notes?: string
  items: { product_id: number; shelf_id?: number | null; quantity: number; unit_price: number }[]
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
  shelf_id: number | null
  shelf_code: string | null
  quantity: number
  unit_price: number
  stock: number
}
