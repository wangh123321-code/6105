import client from './client'
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types'

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await client.post<LoginResponse>('/auth/login', data)
  return res.data
}

export const register = async (data: RegisterRequest): Promise<{ message: string }> => {
  const res = await client.post<{ message: string }>('/auth/register', data)
  return res.data
}

export const getProfile = async (): Promise<User> => {
  const res = await client.get<User>('/auth/profile')
  return res.data
}
