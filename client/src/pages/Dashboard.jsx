import { useLoads } from '../hooks/useLoads'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { data, isLoading } = useLoads()
  const navigate = useNavigate()
  const loads = data?.loads || []

  const stats = {
    total: loads.length,
    inTransit: loads.filter(l => l.status === 'in_transit').length,
    delivered: loads.filter(l => l.status === 'delivered').length,
    created: loads.filter(l => l.status === 'created').length,
  }

  const statusColors = {
    created: 'bg-gray-100 text-gray-600',
    assigned: 'bg-blue-50 text-blue-600',
    in_transit: 'bg-amber-50 text-amber-600',
    delivered: 'bg-emerald-50 text-emerald-600',
    cancelled: 'bg-red-50 text-red-600'
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-sm text-gray-400">Loading...</div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-medium text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-400">Welcome back</p>
        </div>
        <button
          onClick={() => navigate('/loads')}
          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-md hover:bg-emerald-700"
        >
          + New load
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Total loads</div>
          <div className="text-2xl font-medium text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">In transit</div>
          <div className="text-2xl font-medium text-amber-600">{stats.inTransit}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Delivered</div>
          <div className="text-2xl font-medium text-emerald-600">{stats.delivered}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Pending</div>
          <div className="text-2xl font-medium text-blue-600">{stats.created}</div>
        </div>
      </div>

      {/* Recent loads */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Recent loads</span>
          <button
            onClick={() => navigate('/loads')}
            className="text-xs text-emerald-600 hover:underline"
          >
            View all
          </button>
        </div>

        {loads.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No loads yet</p>
            <button
              onClick={() => navigate('/loads')}
              className="mt-2 text-sm text-emerald-600 hover:underline"
            >
              Create your first load
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left px-4 py-2 font-medium">Load #</th>
                <th className="text-left px-4 py-2 font-medium">Route</th>
                <th className="text-left px-4 py-2 font-medium">Carrier</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody>
              {loads.slice(0, 10).map((load) => (
                <tr
                  key={load._id}
                  onClick={() => navigate(`/loads/${load._id}`)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-xs font-medium text-blue-600">
                    {load.loadNumber}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-900">
                    {load.pickup?.city} → {load.delivery?.city}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {load.carrier?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[load.status]}`}>
                      {load.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-900">
                    ${load.rate?.amount} {load.rate?.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Dashboard