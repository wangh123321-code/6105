import type { MatchRequest } from '../types'

interface MatchRequestCardProps {
  request: MatchRequest
  onCancel?: (id: number) => void
}

const SKILL_LABELS: Record<string, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: '等待匹配', color: 'bg-green-100 text-green-700' },
  matched: { label: '已匹配', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
}

export default function MatchRequestCard({ request, onCancel }: MatchRequestCardProps) {
  const statusInfo = STATUS_LABELS[request.status] || { label: request.status, color: 'bg-gray-100 text-gray-500' }

  return (
    <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-gray-800">{request.venue_name}</h4>
          <p className="text-gray-500 text-sm mt-1">
            {request.date} | {request.time_slot}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            技术水平：{SKILL_LABELS[request.skill_level] || request.skill_level}
          </p>
        </div>
        <span className={`${statusInfo.color} px-3 py-1 rounded-full text-xs font-medium`}>
          {statusInfo.label}
        </span>
      </div>
      {request.status === 'matched' && request.matched_with && (
        <p className="mt-2 text-blue-600 text-sm">
          已匹配球友：{request.matched_with}
        </p>
      )}
      {request.status === 'open' && onCancel && (
        <button
          onClick={() => onCancel(request.id)}
          className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          取消请求
        </button>
      )}
    </div>
  )
}
