import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLoads, useCreateLoad } from '../hooks/useLoads.js'

const LoadBoard = () => {
  const navigate = useNavigate()
  const { data, isLoading } = useLoads()
  const { mutate: createLoad, isPending } = useCreateLoad()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    shipper: { name: '', email: '', phone: '' },
    pickup: { address: '', city: '', province: '', scheduledAt: '' },
    delivery: { address: '', city: '', province: '', scheduledAt: '' },
    commodity: { description: '', weight: '', unit: 'lbs' },
    rate: { amount: '', currency: 'CAD' }
  })

  const loads = data?.loads || []

  const statusColors = {
    created: 'bg-gray-100 text-gray-600',
    assigned: 'bg-blue-50 text-blue-600',
    in_transit: 'bg-amber-50 text-amber-600',
    delivered: 'bg-emerald-50 text-emerald-600',
    cancelled: 'bg-red-50 text-red-600'
  }

  const handleChange = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    createLoad(form, {
      onSuccess: () => {
        setShowForm(false)
        setForm({
          shipper: { name: '', email: '', phone: '' },
          pickup: { address: '', city: '', province: '', scheduledAt: '' },
          delivery: { address: '', city: '', province: '', scheduledAt: '' },
          commodity: { description: '', weight: '', unit: 'lbs' },
          rate: { amount: '', currency: 'CAD' }
        })
      }
    })
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
          <h2 className="text-base font-medium text-gray-900">Load board</h2>
          <p className="text-sm text-gray-400">{loads.length} loads total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-md hover:bg-emerald-700"
        >
          {showForm ? 'Cancel' : '+ New load'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Create new load</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase mb-2">Shipper</div>
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Company name" required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('shipper', 'name', e.target.value)} />
                <input placeholder="Email" type="email"
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('shipper', 'email', e.target.value)} />
                <input placeholder="Phone"
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('shipper', 'phone', e.target.value)} />
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500 uppercase mb-2">Pickup</div>
              <div className="grid grid-cols-4 gap-3">
                <input placeholder="Address" required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('pickup', 'address', e.target.value)} />
                <input placeholder="City" required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('pickup', 'city', e.target.value)} />
                <input placeholder="Province" required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('pickup', 'province', e.target.value)} />
                <input type="datetime-local" required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('pickup', 'scheduledAt', e.target.value)} />
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500 uppercase mb-2">Delivery</div>
              <div className="grid grid-cols-4 gap-3">
                <input placeholder="Address" required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('delivery', 'address', e.target.value)} />
                <input placeholder="City" required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('delivery', 'city', e.target.value)} />
                <input placeholder="Province" required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('delivery', 'province', e.target.value)} />
                <input type="datetime-local" required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('delivery', 'scheduledAt', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase mb-2">Commodity</div>
                <input placeholder="Description" required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('commodity', 'description', e.target.value)} />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase mb-2">Weight (lbs)</div>
                <input placeholder="18400" type="number" required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('commodity', 'weight', e.target.value)} />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase mb-2">Rate (CAD)</div>
                <input placeholder="4200" type="number" required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  onChange={e => handleChange('rate', 'amount', e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 px-4 py-2 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={isPending}
                className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50">
                {isPending ? 'Creating...' : 'Create load'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        {loads.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No loads yet</p>
            <button onClick={() => setShowForm(true)}
              className="mt-2 text-sm text-emerald-600 hover:underline">
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
                <th className="text-left px-4 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load) => (
                <tr key={load._id}
                  onClick={() => navigate(`/loads/${load._id}`)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 text-xs font-medium text-blue-600">{load.loadNumber}</td>
                  <td className="px-4 py-3 text-xs text-gray-900">{load.pickup?.city} → {load.delivery?.city}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{load.carrier?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[load.status]}`}>
                      {load.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-900">${load.rate?.amount} {load.rate?.currency}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(load.createdAt).toLocaleDateString()}
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

export default LoadBoard