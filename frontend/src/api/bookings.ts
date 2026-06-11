import client from './client'
import type { Booking, CreateBookingRequest } from '../types'

export const createBooking = async (data: CreateBookingRequest): Promise<Booking> => {
  const res = await client.post<Booking>('/bookings', data)
  return res.data
}

export const payBooking = async (id: number): Promise<Booking> => {
  const res = await client.post<Booking>(`/bookings/${id}/pay`)
  return res.data
}

export const cancelBooking = async (id: number): Promise<Booking> => {
  const res = await client.post<Booking>(`/bookings/${id}/cancel`)
  return res.data
}

export const getMyBookings = async (): Promise<Booking[]> => {
  const res = await client.get<Booking[]>('/bookings/mine')
  return res.data
}
