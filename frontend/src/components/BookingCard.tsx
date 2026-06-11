import type { Booking } from '../types'
import RatingStars from './RatingStars'

interface BookingCardProps {
  booking: Booking
  onCancel?: (id: number) => void
  onReview?: (booking: Booking) => void
  review?: { rating: number; content?: string } | null
  canReview?: boolean
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: '待支付', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: '已支付', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
  expired: { label: '已过期', color: 'bg-red-100 text-red-700' },
}

export default function BookingCard({ booking, onCancel, onReview, review, canReview }: BookingCardProps) {
  const statusInfo = STATUS_LABELS[booking.status] || { label: booking.status, color: 'bg-gray-100 text-gray-500' }

  return (
    <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-gray-800">{booking.venue_name}</h4>
          <p className="text-gray-500 text-sm mt-1">
            {booking.date} | {booking.time_slot} | {booking.table_number}号台
          </p>
          <p className="text-gray-400 text-xs mt-1">
            创建时间：{new Date(booking.created_at).toLocaleString()}
          </p>
          {review && (
            <div className="mt-2 flex items-center gap-2">
              <RatingStars rating={review.rating} size="sm" />
              <span className="text-xs text-gray-500">已评价</span>
            </div>
          )}
        </div>
        <span className={`${statusInfo.color} px-3 py-1 rounded-full text-xs font-medium`}>
          {statusInfo.label}
        </span>
      </div>
      {booking.status === 'pending_payment' && booking.pay_deadline && (
        <div className="mt-3 p-2 bg-yellow-50 rounded text-yellow-700 text-sm">
          请在 {new Date(booking.pay_deadline).toLocaleString()} 前完成支付，超时将自动释放
        </div>
      )}
      {(booking.status === 'pending_payment' || booking.status === 'paid') && onCancel && (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => onCancel(booking.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            取消预约
          </button>
          <span className="text-gray-400 text-xs">
            开课前2小时免费取消，2小时内取消收取50%费用
          </span>
        </div>
      )}
      {canReview && !review && onReview && (
        <div className="mt-3">
          <button
            onClick={() => onReview(booking)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            去评价
          </button>
        </div>
      )}
    </div>
  )
}
