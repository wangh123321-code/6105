import { useState, useEffect } from 'react'
import { getMyMatchRequests } from '../api/match'
import type { MatchRequest, SkillLevel } from '../types'

const SKILL_LABELS: Record<SkillLevel, string> = { beginner: '初级', intermediate: '中级', advanced: '高级' }
const STATUS_MAP: Record<MatchRequest['status'], { label: string; color: string }> = {
  open: { label: '等待匹配', color: 'bg-yellow-100 text-yellow-700' },
  matched: { label: '已匹配', color: 'bg-green-100 text-green-700' },
  expired: { label: '已过期', color: 'bg-gray-100 text-gray-500' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-500' },
}

export default function MyMatchRequestsPage() {
  const [requests, setRequests] = useState<MatchRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyMatchRequests().then(setRequests).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00-${String(h + 1).padStart(2, '0')}:00`

  if (loading) return <div className="text-center py-20 text-gray-500">加载中...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">我的约球请求</h1>
      {requests.length === 0 ? (
        <div className="text-center py-20 text-gray-500">暂无约球请求</div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const st = STATUS_MAP[r.status]
            return (
              <div key={r.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">球馆#{r.venue_id}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${st.color}`}>{st.label}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                    {SKILL_LABELS[r.skill_level]}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{r.preferred_date} {formatHour(r.hour_slot)}</p>
                <p className="text-xs text-gray-400">创建于 {new Date(r.created_at).toLocaleString()}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
