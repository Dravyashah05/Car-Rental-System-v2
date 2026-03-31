import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { resolveLocationInput } from '../utils/geo'
import '../styles/Map.css'

interface MapProps {
  pickupLocation?: string | { lat: number; lng: number; name: string }
  dropoffLocation?: string | { lat: number; lng: number; name: string }
  height?: string
  showRoute?: boolean
}

const MapComponent: React.FC<MapProps> = ({
  pickupLocation = 'Delhi',
  dropoffLocation = 'Mumbai',
  height = '400px',
  showRoute = true,
}) => {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const seed =
      resolveLocationInput(pickupLocation) ?? resolveLocationInput(dropoffLocation)
    const center = seed ?? { lat: 20.5937, lng: 78.9629, name: 'India' }

    mapRef.current = L.map(containerRef.current).setView([center.lat, center.lng], 5)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '(c) OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    mapRef.current.invalidateSize()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [pickupLocation, dropoffLocation])

  useEffect(() => {
    if (!mapRef.current) return

    const pickup = resolveLocationInput(pickupLocation)
    const dropoff = resolveLocationInput(dropoffLocation)

    if (!pickup || !dropoff) return

    mapRef.current.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapRef.current?.removeLayer(layer)
      }
    })

    const pickupIcon = L.divIcon({
      className: 'custom-marker pickup-marker',
      html: `<div class="marker-inner">PU</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    })

    L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
      .bindPopup(
        `<div class="marker-popup"><strong>Pickup</strong><br>${pickup.name ?? 'Pickup'}</div>`
      )
      .addTo(mapRef.current)

    const dropoffIcon = L.divIcon({
      className: 'custom-marker dropoff-marker',
      html: `<div class="marker-inner">DO</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    })

    L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon })
      .bindPopup(
        `<div class="marker-popup"><strong>Dropoff</strong><br>${dropoff.name ?? 'Dropoff'}</div>`
      )
      .addTo(mapRef.current)

    if (showRoute) {
      L.polyline(
        [
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ],
        {
          color: '#667eea',
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 5',
        }
      ).addTo(mapRef.current)
    }

    const group = new L.FeatureGroup([
      L.marker([pickup.lat, pickup.lng]),
      L.marker([dropoff.lat, dropoff.lng]),
    ])
    mapRef.current.fitBounds(group.getBounds().pad(0.1))
  }, [pickupLocation, dropoffLocation, showRoute])

  return (
    <div className="map-container" style={{ height }}>
      <div ref={containerRef} className="map-wrapper" />
    </div>
  )
}

export default MapComponent
