import type { TableSlotRow, TimeSlot } from '../types'
import RatingStars from './RatingStars'

interface SlotGridProps {
  rows: TableSlotRow[]
  openHour: number
  closeHour: number
  onSlotClick: (tableId: number, tableName: string, hour: number) => void
}

export default function SlotGrid({ rows, openHour, closeHour, onSlotClick }: SlotGridProps) {
  const hours = Array.from({ length: closeHour - openHour }, (_, i) => openHour + i)

  const getSlot = (row: TableSlotRow, hour: number): TimeSlot | undefined => {
    return row.slots.find((s) => s.hour === hour)
  }

  const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00-${String(h + 1).padStart(2, '0')}:00`

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse min-w-full">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 sticky left-0 z-10">
              时段
            </th>
            {rows.map((r) => (
              <th key={r.table_id} className="border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 min-w-[120px]">
                <div>{r.table_name}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <RatingStars rating={r.avg_rating} size="sm" />
                  <span className="text-xs text-gray-500">{r.avg_rating > 0 ? r.avg_rating.toFixed(1) : '暂无'}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((h) => (
            <tr key={h}>
              <td className="border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 whitespace-nowrap font-medium sticky left-0 z-10">
                {formatHour(h)}
              </td>
              {rows.map((r) => {
                const slot = getSlot(r, h)
                const isAvailable = slot?.status === 'available'
                return (
                  <td key={`${r.table_id}-${h}`} className="border border-gray-300 p-0">
                    <div
                      className={`text-center py-2 px-1 text-xs font-medium transition-colors select-none ${
                        isAvailable
                          ? 'bg-green-100 hover:bg-green-200 cursor-pointer text-green-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                      onClick={() => {
                        if (isAvailable) {
                          onSlotClick(r.table_id, r.table_name, h)
                        }
                      }}
                    >
                      {isAvailable ? '空闲' : '已约'}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
