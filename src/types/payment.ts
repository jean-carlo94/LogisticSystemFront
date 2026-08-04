export const enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  WALLET = 'WALLET',
  OTHER = 'OTHER',
}

export interface Payment {
  id: number
  sale_id: number
  method: PaymentMethod
  amount: number
  reference: string | null
  created_at: string
}

export interface CreatePaymentPayload {
  sale_id: number
  method: PaymentMethod
  amount: number
  reference?: string
}

export interface SaleReceipt {
  sale_id: number
  store_name: string
  store_slug: string
  customer_name: string
  items: {
    product_name: string
    quantity: number
    unit_price: number
    subtotal: number
    tax_amount: number
    taxes: { name: string; rate: number; amount: number }[]
  }[]
  subtotal: number
  tax_total: number
  total: number
  payments: { id: number; method: string; amount: number }[]
  status: string
  payment_status: string
  created_at: string
}
