import { useEffect, useRef, useState } from 'react'
import { useAllLocations } from '../hooks/useTracking.js'

const Tracking = () => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markers = useRef({})
  const { data, isLoading } = useAllLocations()
  const [wsConnected, setWsConnected] = useState(false)
  const [liveLocations, setLiveLocations] = useState({})
  const ws = useRef(null)

  // Initialize map
  useEffect(() => {
    if (map.current) return

    import('maplibre-gl').then((maplibregl) => {
      import('maplibre-gl/dist/maplibre-gl.css')
      
      map.current = new maplibregl.default.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [-96.0, 56.0],
        zoom: 3.5
      })

      map.current.addControl(new maplibregl.default.NavigationControl())
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Connect WebSocket
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    ws.current = new WebSocket(import.meta.env.VITE_WS_URL)

    ws.current.onopen = () => {
      setWsConnected(true)
      console.log('WebSocket connected')
    }

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'location_update') {
          const { loadId, lat, lng, timestamp } = message.data
          setLiveLocations(prev => ({
            ...prev,
            [loadId]: { lat, lng, timestamp }
          }))
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    }

    ws.current.onclose = () => {
      setWsConnected(false)
      console.log('WebSocket disconnected')
    }

    return () => {
      if (ws.current) ws.current.close()
    }
  }, [])

  // Update markers on map
  useEffect(() => {
    if (!map.current) return

    import('maplibre-gl').then((maplibregl) => {
      const allLocations = { ...liveLocations }

      if (data?.locations) {
        data.locations.forEach(loc => {
          if (!allLocations[loc.loadId]) {
            allLocations[loc.loadId] = loc
          }
        })
      }

      Object.entries(allLocations).forEach(([loadId, location]) => {
        if (markers.current[loadId]) {
          markers.current[loadId].setLngLat([location.lng, location.lat])
        } else {
          const el = document.createElement('div')
          el.style.cssText = `
            width: 12px;
            height: 12px;
            background: #059669;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 3px rgba(5,150,105,0.3);
            cursor: pointer;
          `

          const popup = new maplibregl.default.Popup({ offset: 25 })
            .setHTML(`
              <div style="font-family: sans-serif; padding: 4px;">
                <div style="font-size: 12px; font-weight: 600; color: #111827;">Load ${loadId.slice(-6)}</div>
                <div style="font-size: 11px; color: #6B7280; margin-top: 2px;">
                  ${location.lat?.toFixed(4)}, ${location.lng?.toFixed(4)}
                </div>
                <div style="font-size: 11px; color: #6B7280;">
                  Speed: ${location.speed || 0} km/h
                </div>
              </div>
            `)

          markers.current[loadId] = new maplibregl.default.Marker({ element: el })
            .setLngLat([location.lng, location.lat])
            .setPopup(popup)
            .addTo(map.current)
        }
      })
    })
  }, [liveLocations, data])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <div>
          <h2 className="text-base font-medium text-gray-900">Live tracking</h2>
          <p className="text-sm text-gray-400">Real-time carrier positions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
          <span className="text-xs text-gray-500">
            {wsConnected ? 'Live' : 'Connecting...'}
          </span>
          <span className="text-xs text-gray-400 ml-2">
            {Object.keys(liveLocations).length + (data?.locations?.length || 0)} trucks tracked
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div ref={mapContainer} className="flex-1" />

        <div className="w-64 bg-white border-l border-gray-100 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase">Active trucks</span>
          </div>

          {isLoading ? (
            <div className="p-4 text-xs text-gray-400">Loading...</div>
          ) : (
            <div>
              {Object.entries({ ...liveLocations, ...(data?.locations?.reduce((acc, loc) => ({...acc, [loc.loadId]: loc}), {}) || {}) })
                .map(([loadId, location]) => (
                  <div key={loadId}
                    className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (map.current && location.lat && location.lng) {
                        map.current.flyTo({
                          center: [location.lng, location.lat],
                          zoom: 8
                        })
                        if (markers.current[loadId]) {
                          markers.current[loadId].togglePopup()
                        }
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-medium text-gray-900">
                        Load ...{loadId.slice(-6)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 pl-4">
                      {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-400 pl-4">
                      Speed: {location.speed || 0} km/h
                    </div>
                  </div>
                ))
              }
              {Object.keys({ ...liveLocations, ...(data?.locations || []) }).length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-400">No active trucks</p>
                  <p className="text-xs text-gray-300 mt-1">Run simulate-truck.js to see live tracking</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Tracking