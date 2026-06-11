import client from './client'
import type { MatchRequest, CreateMatchRequest, MatchRecommendation } from '../types'

export const createMatchRequest = async (data: CreateMatchRequest): Promise<MatchRequest> => {
  const res = await client.post<MatchRequest>('/match/requests', data)
  return res.data
}

export const getRecommendations = async (matchRequestId: number): Promise<MatchRecommendation[]> => {
  const res = await client.get<MatchRecommendation[]>(`/match/requests/${matchRequestId}/recommendations`)
  return res.data
}

export const confirmMatch = async (matchRequestId: number): Promise<any> => {
  const res = await client.post(`/match/requests/${matchRequestId}/confirm`)
  return res.data
}

export const getMyMatchRequests = async (): Promise<MatchRequest[]> => {
  const res = await client.get<MatchRequest[]>('/match/requests/mine')
  return res.data
}
