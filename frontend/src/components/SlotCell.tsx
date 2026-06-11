import type { Slot, SlotStatus } from '../types'

interface SlotCellProps {
  slot: Slot | undefined
  tableNumber: number
  timeSlot: string
  onClick: (tableNumber: number, timeSlot: string) => void
}

const STATUS_CONFIG: Record<SlotStatus, { bg: string; text: string; label: string }> = {
  available: { bg: 'bg-green-100 hover:bg-green-200 cursor-pointer', text: 'text-green-700', label: '空闲' },
  booked: { bg: 'bg-gray-200', text: 'text-gray-500', label: '已约' },
  mine: { bg: 'bg-blue-100', text: 'text-blue-700', label: '我的' },
}

export default function SlotCell({ slot, tableNumber, timeSlot, onClick }: SlotCellProps) {
  const status: SlotStatus = slot?.status || 'available'
  const config = STATUS_CONFIG[status]

  return (
    <div
      className={`${config.bg} ${config.text} text-center py-2 px-1 text-xs font-medium transition-colors select-none`}
      onClick={() => {
        if (status === 'available') {
          onClick(tableNumber, timeSlot)
        }
      }}
    >
      {config.label}
    </div>
  )
}
