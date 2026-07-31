export const enum OrderStatus {
  CREATED = 'CREATED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  shelf_id: number | null
  shelf_code: string | null
  quantity: number
  unit_price: number
  subtotal: number
  tax_amount: number
}

export interface Order {
  id: number
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  customer_document: string | null
  customer_address: string | null
  customer_id: number | null
  total: number
  status: OrderStatus
  notes: string | null
  created_at: string
  updated_at: string
  created_by: number
  items?: OrderItem[]
}

export interface CreateOrderItem {
  product_id: number
  shelf_id?: number | null
  quantity: number
  unit_price: number
}

export interface CreateOrderPayload {
  customer_name: string
  customer_email?: string
  customer_phone?: string
  customer_document?: string
  customer_address?: string
  notes?: string
  items: CreateOrderItem[]
}

export interface OrderFormItem {
  product_id: number
  product_name: string
  shelf_id: number | null
  shelf_code: string | null
  quantity: number
  unit_price: number
  taxes: { id: number; name: string; rate: number }[]
}
