import api, { unwrap, buildParams } from './api'
import type { PaginatedResponse } from '@/types/pagination'
import type {
  Station,
  StationDetail,
  StationSession,
  SessionItem,
  StationForm,
  CreateSessionPayload,
  AddItemsPayload,
  UpdateItemPayload,
} from '@/types/station'

export const stationsService = {
  async getAll(page = 1, size = 20, filters: Record<string, string> = {}): Promise<PaginatedResponse<Station>> {
    return unwrap(api.get<PaginatedResponse<Station>>('/stations', { params: buildParams(page, size, filters) }))
  },

  async getDetail(id: number): Promise<StationDetail> {
    return unwrap(api.get<StationDetail>(`/stations/${id}`))
  },

  async create(data: StationForm): Promise<Station> {
    return unwrap(api.post<Station>('/stations', data))
  },

  async update(id: number, data: Partial<StationForm & { status: string }>): Promise<Station> {
    return unwrap(api.put<Station>(`/stations/${id}`, data))
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/stations/${id}`)
  },

  async open(id: number, data: CreateSessionPayload): Promise<StationSession> {
    return unwrap(api.post<StationSession>(`/stations/${id}/open`, data))
  },

  async close(id: number): Promise<StationSession> {
    return unwrap(api.post<StationSession>(`/stations/${id}/close`))
  },

  async cancelSession(id: number): Promise<StationSession> {
    return unwrap(api.post<StationSession>(`/stations/${id}/cancel`))
  },

  async getItems(id: number): Promise<SessionItem[]> {
    return unwrap(api.get<SessionItem[]>(`/stations/${id}/items`))
  },

  async addItems(id: number, data: AddItemsPayload): Promise<SessionItem[]> {
    return unwrap(api.post<SessionItem[]>(`/stations/${id}/items`, data))
  },

  async updateItem(stationId: number, itemId: number, data: UpdateItemPayload): Promise<SessionItem> {
    return unwrap(api.put<SessionItem>(`/stations/${stationId}/items/${itemId}`, data))
  },

  async cancelItem(stationId: number, itemId: number): Promise<SessionItem> {
    return unwrap(api.delete<SessionItem>(`/stations/${stationId}/items/${itemId}`))
  },

  async prepareItem(stationId: number, itemId: number): Promise<SessionItem> {
    return unwrap(api.post<SessionItem>(`/stations/${stationId}/items/${itemId}/prepare`))
  },

  async readyItem(stationId: number, itemId: number): Promise<SessionItem> {
    return unwrap(api.post<SessionItem>(`/stations/${stationId}/items/${itemId}/ready`))
  },

  async deliverItem(stationId: number, itemId: number): Promise<SessionItem> {
    return unwrap(api.post<SessionItem>(`/stations/${stationId}/items/${itemId}/deliver`))
  },

  async transfer(id: number, targetId: number): Promise<StationSession> {
    return unwrap(api.post<StationSession>(`/stations/${id}/transfer/${targetId}`))
  },
}
