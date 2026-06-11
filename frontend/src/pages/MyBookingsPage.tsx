import { useState, useEffect } from 'react'
import { getMyBookings, cancelBooking } from '../api/bookings'
import type { Booking } from '../types'

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
                </div>
                {(b.status === 'paid' || b.status === 'pending_payment') && (
                  <button onClick={() => handleCancel(b.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm transition">
                    取消预约
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
