export const enum ProductState {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  NO_STOCK = 'NO_STOCK',
  DISCONTINUED = 'DISCONTINUED',
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  state: ProductState
  barcode: string | null
  weight_kg: number
  width_cm: number
  height_cm: number
  depth_cm: number
  image_path: string | null
  image_url: string | null
  categories: { id: number; name: string }[]
  create_at: string
  update_at: string
}

export interface ProductForm {
  name: string
  description: string
  price: number
  stock: number
  state: ProductState
  barcode: string
  weight_kg: number
  width_cm: number
  height_cm: number
  depth_cm: number
}

export function createEmptyProduct(): ProductForm {
  return {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    state: ProductState.ACTIVE,
    barcode: '',
    weight_kg: 0,
    width_cm: 0,
    height_cm: 0,
    depth_cm: 0,
  }
}
