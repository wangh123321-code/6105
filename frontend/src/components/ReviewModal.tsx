import { useState } from 'react'
import RatingStars from './RatingStars'

interface ReviewModalProps {
  bookingId: number
  tableName: string
  date: string
  timeSlot: string
  onClose: () => void
  onSubmit: (rating: number, content: string) => Promise<void>
}

export default function ReviewModal({ bookingId, tableName, date, timeSlot, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError('请选择评分')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(rating, content)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || '提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">评价球台</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">球台：<span className="font-medium">{tableName}</span></p>
          <p className="text-sm text-gray-600">日期：<span className="font-medium">{date}</span></p>
          <p className="text-sm text-gray-600">时段：<span className="font-medium">{timeSlot}</span></p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
          <div className="flex items-center gap-3">
            <RatingStars rating={rating} size="lg" readonly={false} onChange={setRating} />
            <span className="text-lg font-bold text-gray-800">{rating} 星</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">评价内容（选填）</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享您的使用体验..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/500</p>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition"
          >
            {submitting ? '提交中...' : '提交评价'}
          </button>
        </div>
      </div>
    </div>
  )
}
