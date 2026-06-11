import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getVenues } from '../api/venues'
import type { Venue } from '../types'

export default function VenueListPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getVenues()
        setVenues(data)
      } catch {} finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-500">加载中...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🏓 社区乒乓球馆</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {venues.map((v) => (
          <Link key={v.id} to={`/venues/${v.id}`}
            className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-6 block">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{v.name}</h2>
            <p className="text-gray-500 text-sm">📍 {v.address}</p>
            <p className="text-gray-500 text-sm">📞 {v.phone}</p>
            <p className="text-gray-500 text-sm">🕐 {v.open_time?.slice(0,5)} - {v.close_time?.slice(0,5)}</p>
            <div className="mt-3 text-blue-600 text-sm font-medium">查看球台 →</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
