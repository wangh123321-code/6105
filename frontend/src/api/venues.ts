import client from './client'
import type { Venue, TableInfo, TableSlotRow } from '../types'

export const getVenues = async (): Promise<Venue[]> => {
  const res = await client.get<Venue[]>('/venues')
  return res.data
}

export const getVenue = async (id: number): Promise<Venue> => {
  const res = await client.get<Venue>(`/venues/${id}`)
  return res.data
}

export const getVenueTables = async (venueId: number): Promise<TableInfo[]> => {
  const res = await client.get<TableInfo[]>(`/venues/${venueId}/tables`)
  return res.data
}

export const getVenueSlots = async (venueId: number, date: string): Promise<TableSlotRow[]> => {
  const res = await client.get<TableSlotRow[]>(`/venues/${venueId}/slots`, { params: { date } })
  return res.data
}
