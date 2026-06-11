import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { getVenue, getVenueSlots, getVenueTablesWithReviews } from '../api/venues'
import { createBooking, payBooking } from '../api/bookings'
import SlotGrid from '../components/SlotGrid'
import RatingStars from '../components/RatingStars'
import type { Venue, TableSlotRow, TableWithReviews } from '../types'

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [rows, setRows] = useState<TableSlotRow[]>([])
  const [tableReviews, setTableReviews] = useState<TableWithReviews[]>([])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(true)
  const [confirmModal, setConfirmModal] = useState<{ tableId: number; tableName: string; hour: number } | null>(null)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [payCountdown, setPayCountdown] = useState<string | null>(null)
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null)

  const fetchSlots = useCallback(async () => {
    if (!id) return
    try {
      const data = await getVenueSlots(Number(id), date)
      setRows(data)
    } catch {
      setMessage({ type: 'error', text: '加载时段失败' })
    }
  }, [id, date])

  useEffect(() => {
    const fetchVenue = async () => {
      if (!id) return
      try {
        const data = await getVenue(Number(id))
        setVenue(data)
      } catch {
        setMessage({ type: 'error', text: '加载球馆信息失败' })
      } finally {
        setLoading(false)
      }
    }
    fetchVenue()
  }, [id])

  useEffect(() => {
    const fetchTableReviews = async () => {
      if (!id) return
      try {
        const data = await getVenueTablesWithReviews(Number(id), 3)
        setTableReviews(data)
      } catch {}
    }
    fetchTableReviews()
  }, [id])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  const handleSlotClick = (tableId: number, tableName: string, hour: number) => {
    setConfirmModal({ tableId, tableName, hour })
  }

  const handleConfirmBooking = async () => {
    if (!confirmModal || !id) return
    setCreating(true)
    try {
      const booking = await createBooking({
        venue_id: Number(id),
        table_id: confirmModal.tableId,
        date,
        hour_slot: confirmModal.hour,
      })
      setMessage({ type: 'success', text: '预约锁定成功！请在15分钟内完成支付' })
      setConfirmModal(null)
      setPendingBookingId(booking.id)
      fetchSlots()
      startCountdown(booking.id)
    } catch (err: any) {
      const msg = err.response?.data?.message || '预约失败'
      setMessage({ type: 'error', text: msg })
      setConfirmModal(null)
    } finally {
      setCreating(false)
    }
  }

  const handlePay = async () => {
    if (!pendingBookingId) return
    try {
      await payBooking(pendingBookingId)
      setMessage({ type: 'success', text: '支付成功！预约已确认' })
      setPayCountdown(null)
      setPendingBookingId(null)
      fetchSlots()
    } catch (err: any) {
      const msg = err.response?.data?.message || '支付失败'
      setMessage({ type: 'error', text: msg })
      if (msg.includes('已被他人支付') || msg.includes('已失效')) {
        setPayCountdown(null)
        setPendingBookingId(null)
        fetchSlots()
      }
    }
  }

  const startCountdown = (bookingId: number) => {
    const endTime = Date.now() + 15 * 60 * 1000
    const timer = setInterval(() => {
      const diff = endTime - Date.now()
      if (diff <= 0) {
        setPayCountdown(null)
        setPendingBookingId(null)
        clearInterval(timer)
        fetchSlots()
        setMessage({ type: 'error', text: '支付超时，预约已自动释放' })
        return
      }
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setPayCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)
  }

  const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00-${String(h + 1).padStart(2, '0')}:00`

  if (loading) {
    return <div className="text-center py-20 text-gray-500">加载中...</div>
  }

  if (!venue) {
    return <div className="text-center py-20 text-red-500">球馆不存在</div>
  }

  const openHour = parseInt(venue.open_time.split(':')[0], 10)
  const closeHour = parseInt(venue.close_time.split(':')[0], 10)

  return (
    <div>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{venue.name}</h1>
        <div className="flex items-center gap-3 mt-2">
          <RatingStars rating={venue.avg_rating} size="md" />
          <span className="text-gray-700 font-medium">{venue.avg_rating.toFixed(1)}</span>
          <span className="text-gray-400 text-sm">({venue.review_count} 条评价)</span>
        </div>
        <p className="text-gray-500 mt-2">📍 {venue.address}</p>
        <p className="text-gray-500">📞 {venue.phone}</p>
        <p className="text-gray-500">🕐 {venue.open_time.slice(0,5)} - {venue.close_time.slice(0,5)}</p>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message.text}
          <button className="ml-2 font-bold" onClick={() => setMessage(null)}>✕</button>
        </div>
      )}

      {payCountdown && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded flex items-center justify-between">
          <span>⏰ 支付倒计时：{payCountdown}，超时将自动释放预约</span>
          <button
            onClick={handlePay}
            className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
          >
            立即支付
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">时段预约</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-xs text-gray-600">空闲</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span className="text-xs text-gray-600">已约</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mr-2">选择日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <SlotGrid
          rows={rows}
          openHour={openHour}
          closeHour={closeHour}
          onSlotClick={handleSlotClick}
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">球台评价</h2>
        {tableReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暂无评价</div>
        ) : (
          <div className="space-y-4">
            {tableReviews.map((table) => (
              <div key={table.table_id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{table.table_name}</span>
                    <RatingStars rating={table.avg_rating} size="sm" />
                    <span className="text-sm text-gray-500">{table.avg_rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({table.review_count}条)</span>
                  </div>
                </div>
                {table.latest_reviews && table.latest_reviews.length > 0 ? (
                  <div className="space-y-2 pl-2">
                    {table.latest_reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {review.user?.nickname || '匿名用户'}
                            </span>
                            <RatingStars rating={review.rating} size="sm" />
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.content && (
                          <p className="text-sm text-gray-600">{review.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 pl-2">暂无评价</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">确认预约</h3>
            <p className="text-gray-600 mb-2">球馆：<span className="font-medium">{venue.name}</span></p>
            <p className="text-gray-600 mb-2">日期：<span className="font-medium">{date}</span></p>
            <p className="text-gray-600 mb-2">球台：<span className="font-medium">{confirmModal.tableName}</span></p>
            <p className="text-gray-600 mb-4">时段：<span className="font-medium">{formatHour(confirmModal.hour)}</span></p>
            <p className="text-yellow-600 text-sm mb-4">预约后需在15分钟内完成支付，超时将自动释放</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition"
              >
                {creating ? '预约中...' : '确认预约'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
