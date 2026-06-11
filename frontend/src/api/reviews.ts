import client from './client'
import type { Review, ReviewListResponse, CreateReviewRequest } from '../types'

export const createReview = async (data: CreateReviewRequest): Promise<Review> => {
  const res = await client.post<Review>('/reviews', data)
  return res.data
}

export const getReviewByBooking = async (bookingId: number): Promise<Review | null> => {
  const res = await client.get<Review | null>(`/reviews/by-booking/${bookingId}`)
  return res.data
}

export const getTableReviews = async (
  venueId: number,
  tableId: number,
  page = 1,
  pageSize = 10,
): Promise<ReviewListResponse> => {
  const res = await client.get<ReviewListResponse>(
    `/venues/${venueId}/tables/${tableId}/reviews`,
    { params: { page, pageSize } },
  )
  return res.data
}
