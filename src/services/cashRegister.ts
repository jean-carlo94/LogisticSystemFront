import api, { unwrap, buildParams } from './api'
import type { PaginatedResponse } from '@/types/pagination'
import type { CashRegister, OpenCashRegisterPayload, CloseCashRegisterPayload } from '@/types/cashRegister'

export const cashRegisterService = {
  async getCurrent(): Promise<CashRegister | null> {
    return unwrap(api.get<CashRegister | null>('/cash-register'))
  },

  async open(data: OpenCashRegisterPayload): Promise<CashRegister> {
    return unwrap(api.post<CashRegister>('/cash-register/open', data))
  },

  async close(data: CloseCashRegisterPayload): Promise<CashRegister> {
    return unwrap(api.post<CashRegister>('/cash-register/close', data))
  },

  async getHistory(page = 1, size = 20): Promise<PaginatedResponse<CashRegister>> {
    return unwrap(api.get<PaginatedResponse<CashRegister>>('/cash-register/history', { params: buildParams(page, size) }))
  },
}
