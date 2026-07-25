export interface Shelf {
  id: number
  name: string
  code: string
  aisle: string
  row: number
  level: number
  max_weight_kg: number
  width_cm: number
  height_cm: number
  depth_cm: number
  created_at: string
  updated_at: string
}

export interface ShelfItem {
  id: number
  shelf_id: number
  product_id: number
  product_name: string
  quantity: number
}

export interface ShelfDetail extends Shelf {
  current_weight_kg: number
  current_volume_cm3: number
  items: ShelfItem[]
}

export interface ShelfForm {
  name: string
  code: string
  aisle: string
  row: number
  level: number
  max_weight_kg: number
  width_cm: number
  height_cm: number
  depth_cm: number
}

export function createEmptyShelf(): ShelfForm {
  return {
    name: '',
    code: '',
    aisle: '',
    row: 0,
    level: 0,
    max_weight_kg: 0,
    width_cm: 0,
    height_cm: 0,
    depth_cm: 0,
  }
}
