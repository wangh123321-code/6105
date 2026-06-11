import { useState, useEffect } from 'react'
import { getMyBookings, cancelBooking } from '../api/bookings'
import { createReview, getReviewByBooking } from '../api/reviews'
import type { Booking, Review } from '../types'
import ReviewModal from '../components/ReviewModal'
import RatingStars from '../components/RatingStars'

const STATUS_MAP: Record<Booking['status'], { label: string; color: string }> = {
  pending_payment: { label: '待支付', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: '已支付', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
  expired: { label: '已过期', color: 'bg-red-100 text-red-500' },
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [reviewModal, setReviewModal] = useState<Booking | null>(null)
  const [bookingReviews, setBookingReviews] = useState<Record<number, Review | null>>({})

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings()
      setBookings(data)
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [])

  const handleCancel = async (id: number) => {
    if (!confirm('确认取消预约？距开始不足2小时将扣除5分信用分。')) return
    try {
      await cancelBooking(id)
      setMessage({ type: 'success', text: '取消成功' })
      fetchBookings()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || '取消失败' })
    }
  }

  const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00-${String(h + 1).padStart(2, '0')}:00`

  const canReview = (booking: Booking): boolean => {
    if (booking.status !== 'paid') return false
    const slotEnd = new Date(`${booking.date}T${String(booking.hour_slot + 1).padStart(2, '0')}:00:00`)
    const now = new Date()
    if (now < slotEnd) return false
    const bookingDate = new Date(booking.date)
    const sevenDaysLater = new Date(bookingDate)
    sevenDaysLater.setDate(bookingDate.getDate() + 7)
    sevenDaysLater.setHours(23, 59, 59, 999)
    if (now > sevenDaysLater) return false
    return true
  }

  const isReviewed = (bookingId: number): boolean => {
    return bookingReviews[bookingId] !== undefined && bookingReviews[bookingId] !== null
  }

  const loadBookingReview = async (bookingId: number) => {
    if (bookingReviews[bookingId] !== undefined) return
    try {
      const review = await getReviewByBooking(bookingId)
      setBookingReviews((prev) => ({ ...prev, [bookingId]: review }))
    } catch {}
  }

  useEffect(() => {
    bookings.forEach((b) => {
      if (b.status === 'paid') {
        loadBookingReview(b.id)
      }
    })
  }, [bookings])

  const handleReviewClick = (booking: Booking) => {
    setReviewModal(booking)
  }

  const handleSubmitReview = async (rating: number, content: string) => {
    if (!reviewModal) return
    await createReview({
      booking_id: reviewModal.id,
      rating,
      content,
    })
    setMessage({ type: 'success', text: '评价提交成功！' })
    setReviewModal(null)
    fetchBookings()
  }

  if (loading) return <div className="text-center py-20 text-gray-500">加载中...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">我的预约</h1>
      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}
      {bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-500">暂无预约记录</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const st = STATUS_MAP[b.status]
            return (
              <div key={b.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">球台#{b.table_id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${st.color}`}>{st.label}</span>
                    {b.booking_type === 'match' && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">约球</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{b.date} {formatHour(b.hour_slot)}</p>
                  <p className="text-xs text-gray-400">创建于 {new Date(b.created_at).toLocaleString()}</p>
                  {isReviewed(b.id) && bookingReviews[b.id] && (
                    <div className="mt-2 flex items-center gap-2">
                      <RatingStars rating={bookingReviews[b.id]!.rating} size="sm" />
                      <span className="text-xs text-gray-500">已评价</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {(b.status === 'paid' || b.status === 'pending_payment') && (
                    <button onClick={() => handleCancel(b.id)}
                      className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm transition">
                      取消预约
                    </button>
                  )}
                  {canReview(b) && !isReviewed(b.id) && (
                    <button onClick={() => handleReviewClick(b)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
                      评价
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {reviewModal && (
        <ReviewModal
          bookingId={reviewModal.id}
          tableName={`球台#${reviewModal.table_id}`}
          date={reviewModal.date}
          timeSlot={formatHour(reviewModal.hour_slot)}
          onClose={() => setReviewModal(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  )
}
