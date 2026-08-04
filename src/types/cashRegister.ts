export interface CashRegister {
  id: number
  tenant_id: number
  opened_by: number
  closed_by: number | null
  opening_amount: number
  closing_amount: number | null
  expected_cash: number | null
  discrepancy: number | null
  notes: string | null
  opened_at: string
  closed_at: string | null
  created_at: string
}

export interface OpenCashRegisterPayload {
  opening_amount: number
}

export interface CloseCashRegisterPayload {
  closing_amount: number
  notes?: string
}
