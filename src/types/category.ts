export interface Category {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface CategoryForm {
  name: string
  description: string
}

export function createEmptyCategory(): CategoryForm {
  return {
    name: '',
    description: '',
  }
}
