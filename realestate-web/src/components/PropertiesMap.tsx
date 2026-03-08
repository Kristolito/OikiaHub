import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { divIcon } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import type { PropertyListItemResponse } from '../services/propertyService'

export type MapBoundsFilter = {
  minLatitude: number
  maxLatitude: number
  minLongitude: number
  maxLongitude: number
}

type PropertiesMapProps = {
  items: PropertyListItemResponse[]
  selectedId?: number | null
  onSelect?: (id: number) => void
  onBoundsChange?: (bounds: MapBoundsFilter) => void
  onSearchArea?: () => void
  onClearArea?: () => void
  hasAreaFilter?: boolean
}

type MapPoint = {
  id: number
  lat: number
  lng: number
  item: PropertyListItemResponse
}

const markerIcon = divIcon({
  className: 'oikia-map-marker',
  html: '<span></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function BoundsWatcher({ onBoundsChange }: { onBoundsChange?: (bounds: MapBoundsFilter) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds()
      onBoundsChange?.({
        minLatitude: bounds.getSouth(),
        maxLatitude: bounds.getNorth(),
        minLongitude: bounds.getWest(),
        maxLongitude: bounds.getEast(),
      })
    },
  })

  useEffect(() => {
    const bounds = map.getBounds()
    onBoundsChange?.({
      minLatitude: bounds.getSouth(),
      maxLatitude: bounds.getNorth(),
      minLongitude: bounds.getWest(),
      maxLongitude: bounds.getEast(),
    })
  }, [map, onBoundsChange])

  return null
}

function PropertiesMap({ items, selectedId, onSelect, onBoundsChange, onSearchArea, onClearArea, hasAreaFilter }: PropertiesMapProps) {
  const points = useMemo<MapPoint[]>(
    () =>
      items
        .filter(
          (x) =>
            typeof x.latitude === 'number' &&
            typeof x.longitude === 'number' &&
            Number.isFinite(x.latitude) &&
            Number.isFinite(x.longitude),
        )
        .map((x) => ({
          id: x.id,
          lat: Number(x.latitude),
          lng: Number(x.longitude),
          item: x,
        })),
    [items],
  )

  const center = useMemo<[number, number]>(() => {
    if (points.length === 0) {
      return [37.9838, 23.7275]
    }

    const latSum = points.reduce((acc, p) => acc + p.lat, 0)
    const lngSum = points.reduce((acc, p) => acc + p.lng, 0)
    return [latSum / points.length, lngSum / points.length]
  }, [points])

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
        No map data available for current results.
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-[420px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsWatcher onBoundsChange={onBoundsChange} />
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={markerIcon}
            eventHandlers={{
              click: () => onSelect?.(point.id),
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{point.item.title}</p>
                <p className="text-xs text-slate-600">
                  {point.item.city}, {point.item.area}
                </p>
                <p className="text-xs font-semibold">${point.item.price.toLocaleString()}</p>
                <Link to={`/properties/${point.id}`} className="text-xs font-semibold text-sky-700">
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute right-3 top-3 z-[500] flex gap-2">
        <button
          type="button"
          onClick={onSearchArea}
          className="rounded-lg border border-slate-700 bg-black/85 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
        >
          Search this area
        </button>
        {hasAreaFilter && (
          <button
            type="button"
            onClick={onClearArea}
            className="rounded-lg border border-slate-700 bg-black/85 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
          >
            Clear area
          </button>
        )}
      </div>
      {selectedId && (
        <div className="border-t border-slate-800 bg-black px-3 py-2 text-xs text-slate-300">
          Selected listing ID: {selectedId}
        </div>
      )}
    </div>
  )
}

export default PropertiesMap
