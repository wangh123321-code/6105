import { Link } from 'react-router-dom'
import type { Venue } from '../types'

export default function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link to={`/venues/${venue.id}`} className="block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{venue.name}</h3>
            <p className="text-gray-500 text-sm mt-1">📍 {venue.address}</p>
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {venue.table_count} 张球台
          </div>
        </div>
        {venue.description && (
          <p className="text-gray-600 text-sm mt-3 line-clamp-2">{venue.description}</p>
        )}
        <div className="mt-4 text-blue-600 text-sm font-medium">
          查看时段 &rarr;
        </div>
      </div>
    </Link>
  )
}
