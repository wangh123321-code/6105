export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

export interface User {
  id: number
  username: string
  nickname: string
  phone: string
  skill_level: SkillLevel
  credit_score: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface RegisterRequest {
  username: string
  password: string
  phone: string
  nickname: string
  skill_level: SkillLevel
}

export interface Venue {
  id: number
  name: string
  address: string
  phone: string
  open_time: string
  close_time: string
  table_count: number
  description: string
}

export interface TableInfo {
  id: number
  venue_id: number
  name: string
}

export type SlotStatus = 'available' | 'booked' | 'mine'

export interface TimeSlot {
  hour: number
  status: SlotStatus
}

export type Slot = TimeSlot

export interface TableSlotRow {
  table_id: number
  table_name: string
  slots: TimeSlot[]
}

export interface Booking {
  id: number
  user_id: number
  table_id: number
  venue_id: number
  date: string
  hour_slot: number
  status: 'pending_payment' | 'paid' | 'cancelled' | 'expired'
  booking_type: 'solo' | 'match'
  paid_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  venue_name: string
  time_slot: string
  table_number: number
  pay_deadline: string | null
}

export interface CreateBookingRequest {
  table_id: number
  venue_id: number
  date: string
  hour_slot: number
}

export interface MatchRequest {
  id: number
  user_id: number
  venue_id: number
  skill_level: SkillLevel
  preferred_date: string
  hour_slot: number
  status: 'open' | 'matched' | 'expired' | 'cancelled'
  matched_user_id: number | null
  matched_booking_id: number | null
  created_at: string
  venue_name: string
  date: string
  time_slot: string
  matched_with: string | null
}

export interface CreateMatchRequest {
  venue_id: number
  date: string
  hour_slot: number
}

export interface MatchRecommendation {
  match_request_id: number
  user_id: number
  nickname: string
  skill_level: SkillLevel
}
