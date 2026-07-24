export enum ProductState {
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
  create_at: string
}

export interface ProductForm {
  name: string
  description: string
  price: number
  stock: number
  state: ProductState
}

export function createEmptyProduct(): ProductForm {
  return {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    state: ProductState.ACTIVE,
  }
}
