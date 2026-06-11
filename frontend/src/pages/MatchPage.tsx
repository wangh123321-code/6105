import { useState, useEffect, useRef, useCallback } from 'react'
import { getVenues } from '../api/venues'
import { createMatchRequest, getRecommendations, confirmMatch } from '../api/match'
import type { Venue, MatchRecommendation, SkillLevel } from '../types'

const SKILL_LABELS: Record<SkillLevel, string> = { beginner: '初级', intermediate: '中级', advanced: '高级' }
const REFRESH_INTERVAL = 5000

export default function MatchPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [venueId, setVenueId] = useState<number>(0)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [hourSlot, setHourSlot] = useState(8)
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([])
  const [myRequestId, setMyRequestId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    getVenues().then(setVenues).catch(() => {})
  }, [])

  const fetchRecommendations = useCallback(async (requestId: number, showError = false) => {
    try {
      const recs = await getRecommendations(requestId)
      setRecommendations(recs)
    } catch (err: any) {
      if (showError) {
        setMessage({ type: 'error', text: err.response?.data?.message || '获取推荐失败' })
      }
    }
  }, [])

  useEffect(() => {
    if (myRequestId) {
      fetchRecommendations(myRequestId)
      timerRef.current = window.setInterval(() => {
        fetchRecommendations(myRequestId)
      }, REFRESH_INTERVAL)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [myRequestId, fetchRecommendations])

  const handleRefresh = async () => {
    if (!myRequestId) return
    setRefreshing(true)
    try {
      await fetchRecommendations(myRequestId, true)
    } finally {
      setRefreshing(false)
    }
  }

  const handlePublish = async () => {
    if (!venueId) {
      setMessage({ type: 'error', text: '请选择球馆' })
      return
    }
    setLoading(true)
    try {
      const req = await createMatchRequest({ venue_id: venueId, date, hour_slot: hourSlot })
      setMyRequestId(req.id)
      setMessage({ type: 'success', text: '发布成功，正在查找匹配对手...' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || '发布失败' })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (matchRequestId: number) => {
    try {
      await confirmMatch(matchRequestId)
      setMessage({ type: 'success', text: '匹配成功！已自动预约球台' })
      setRecommendations([])
      setMyRequestId(null)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || '匹配失败' })
    }
  }

  const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00-${String(h + 1).padStart(2, '0')}:00`

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🏓 找球友</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">发布约球请求</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择球馆</label>
            <select value={venueId} onChange={(e) => setVenueId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none">
              <option value={0}>请选择</option>
              {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">时段</label>
            <select value={hourSlot} onChange={(e) => setHourSlot(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none">
              {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => (
                <option key={h} value={h}>{formatHour(h)}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={handlePublish} disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition">
          {loading ? '发布中...' : '发布请求'}
        </button>
      </div>

      {myRequestId && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">推荐对手</h2>
            <button onClick={handleRefresh} disabled={refreshing}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg transition flex items-center gap-1">
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? '刷新中...' : '刷新'}
            </button>
          </div>
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.match_request_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-800">{rec.nickname || `用户${rec.user_id}`}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                      rec.skill_level === 'beginner' ? 'bg-green-100 text-green-700' :
                      rec.skill_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {SKILL_LABELS[rec.skill_level]}
                    </span>
                  </div>
                  <button onClick={() => handleConfirm(rec.match_request_id)}
                    className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition">
                    确认约球
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>暂无匹配对手</p>
              <p className="text-sm mt-1 text-gray-400">系统每 5 秒自动刷新，也可点击手动刷新</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
