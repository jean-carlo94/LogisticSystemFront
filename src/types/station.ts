export const enum StationStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
}

export const enum SessionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export const enum SessionItemStatus {
  CREATED = 'CREATED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Station {
  id: number
  code: string
  name: string | null
  area: string | null
  capacity: number
  status: StationStatus
  created_at: string
  updated_at: string
}

export interface StationDetail extends Station {
  active_session: StationSession | null
}

export interface StationSession {
  id: number
  station_id: number
  customer_id: number | null
  customer_name: string
  total: number
  status: SessionStatus
  sale_id: number | null
  created_by: number
  opened_at: string
  closed_at: string | null
  items: SessionItem[]
}

export interface SessionItem {
  id: number
  session_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  status: SessionItemStatus
  notes: string | null
}

export interface StationForm {
  code: string
  name: string
  area: string
  capacity: number
}

export interface CreateSessionPayload {
  customer_name: string
  customer_email?: string
  customer_phone?: string
  customer_document?: string
  customer_address?: string
}

export interface AddItemsPayload {
  items: { product_id: number; quantity: number; notes?: string }[]
}

export interface UpdateItemPayload {
  quantity?: number
  notes?: string
}

export function createEmptyStation(): StationForm {
  return {
    code: '',
    name: '',
    area: '',
    capacity: 1,
  }
}
