import { useParams, useNavigate } from 'react-router-dom'
import { useLoad, useUpdateLoadStatus, useAssignCarrier } from '../hooks/useLoads.js'
import { useState } from 'react'

const statusColors = {
  created: 'bg-gray-100 text-gray-600',
  assigned: 'bg-blue-50 text-blue-600',
  in_transit: 'bg-amber-50 text-amber-600',
  delivered: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600'
}

const validTransitions = {
  created: ['assigned', 'cancelled'],
  assigned: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
}

const LoadDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useLoad(id)
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateLoadStatus()
  const { mutate: assignCarrier, isPending: isAssigning } = useAssignCarrier()
  const [showCarrierForm, setShowCarrierForm] = useState(false)
  const [carrier, setCarrier] = useState({ name: '', email: '', phone: '' })

  const load = data?.load

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-sm text-gray-400">Loading...</div>
    </div>
  )

  if (!load) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-sm text-gray-400">Load not found</div>
    </div>
  )

  const handleStatusUpdate = (status) => {
    updateStatus({ id, status })
  }

  const handleAssignCarrier = (e) => {
    e.preventDefault()
    assignCarrier({ id, ...carrier }, {
      onSuccess: () => setShowCarrierForm(false)
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/loads')}
          className="text-sm text-gray-400 hover:text-gray-600">
          ← Load board
        </button>
        <span className="text-gray-200">/</span>
        <span className="text-sm font-medium text-gray-900">{load.loadNumber}</span>
        <span className={`text-xs px-2 py-1 rounded-full ml-auto ${statusColors[load.status]}`}>
          {load.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">

        {/* Left column */}
        <div className="col-span-2 space-y-4">

          {/* Route */}
          <div className="bg-white border border-gray-100 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-400 uppercase mb-3">Route</div>
            <div className="flex items-center gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-900">{load.pickup?.city}, {load.pickup?.province}</div>
                <div className="text-xs text-gray-400">{load.pickup?.address}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(load.pickup?.scheduledAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex-1 border-t border-dashed border-gray-200 mx-2"></div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{load.delivery?.city}, {load.delivery?.province}</div>
                <div className="text-xs text-gray-400">{load.delivery?.address}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(load.delivery?.scheduledAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-xs text-gray-400 mb-1">Commodity</div>
                <div className="text-sm font-medium">{load.commodity?.description}</div>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-xs text-gray-400 mb-1">Weight</div>
                <div className="text-sm font-medium">{load.commodity?.weight} {load.commodity?.unit}</div>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-xs text-gray-400 mb-1">Rate</div>
                <div className="text-sm font-medium">${load.rate?.amount} {load.rate?.currency}</div>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-xs text-gray-400 mb-1">Shipper</div>
                <div className="text-sm font-medium">{load.shipper?.name}</div>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          <div className="bg-white border border-gray-100 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-400 uppercase mb-3">Status history</div>
            <div className="space-y-3">
              {load.statusHistory?.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {item.status.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-400">{item.note}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(item.changedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Update status */}
          {validTransitions[load.status]?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-400 uppercase mb-3">Update status</div>
              <div className="flex gap-2">
                {validTransitions[load.status].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={isUpdating}
                    className="text-sm px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 capitalize disabled:opacity-50"
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Carrier */}
          <div className="bg-white border border-gray-100 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-400 uppercase mb-3">Carrier</div>
            {load.carrier?.name ? (
              <div>
                <div className="text-sm font-medium text-gray-900">{load.carrier.name}</div>
                <div className="text-xs text-gray-400 mt-1">{load.carrier.email}</div>
                <div className="text-xs text-gray-400">{load.carrier.phone}</div>
                <div className="text-xs text-gray-400 mt-2">
                  Assigned {new Date(load.carrier.assignedAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-400 mb-3">No carrier assigned</p>
                {!showCarrierForm ? (
                  <button
                    onClick={() => setShowCarrierForm(true)}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    + Assign carrier
                  </button>
                ) : (
                  <form onSubmit={handleAssignCarrier} className="space-y-2">
                    <input placeholder="Carrier name" required
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                      onChange={e => setCarrier({...carrier, name: e.target.value})} />
                    <input placeholder="Email"
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                      onChange={e => setCarrier({...carrier, email: e.target.value})} />
                    <input placeholder="Phone"
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                      onChange={e => setCarrier({...carrier, phone: e.target.value})} />
                    <div className="flex gap-2">
                      <button type="submit" disabled={isAssigning}
                        className="flex-1 bg-emerald-600 text-white text-sm py-2 rounded-md disabled:opacity-50">
                        Assign
                      </button>
                      <button type="button" onClick={() => setShowCarrierForm(false)}
                        className="text-sm text-gray-400 px-3">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Shipper info */}
          <div className="bg-white border border-gray-100 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-400 uppercase mb-3">Shipper</div>
            <div className="text-sm font-medium text-gray-900">{load.shipper?.name}</div>
            <div className="text-xs text-gray-400 mt-1">{load.shipper?.email}</div>
            <div className="text-xs text-gray-400">{load.shipper?.phone}</div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default LoadDetail