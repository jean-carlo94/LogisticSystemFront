export const enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  STATUS_CHANGED = 'STATUS_CHANGED',
}

export const enum EntityType {
  Product = 'Product',
  User = 'User',
}

export interface Event {
  id: number
  entity_type: EntityType
  entity_id: number
  action: AuditAction
  user_id: number
  description: string
  create_at: string
}
