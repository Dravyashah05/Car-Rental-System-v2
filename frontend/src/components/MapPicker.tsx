import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getNearestLocationName, resolveLocationInput, type GeoPoint } from '../utils/geo'
import '../styles/Map.css'

interface MapPickerProps {
  pickup?: GeoPoint | null
  dropoff?: GeoPoint | null
  activeType: 'pickup' | 'dropoff'
  onSelect: (type: 'pickup' | 'dropoff', point: GeoPoint) => void
  height?: string
}

const MapPicker: React.FC<MapPickerProps> = ({
  pickup,
  dropoff,
  activeType,
  onSelect,
  height = '320px',
}) => {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pickupMarkerRef = useRef<L.Marker | null>(null)
  const dropoffMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const seed = pickup ?? dropoff ?? resolveLocationInput('Delhi')
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
  }, [pickup, dropoff])

  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    const pickupIcon = L.divIcon({
      className: 'custom-marker pickup-marker',
      html: `<div class="marker-inner">PU</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    })

    const dropoffIcon = L.divIcon({
      className: 'custom-marker dropoff-marker',
      html: `<div class="marker-inner">DO</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    })

    if (pickup) {
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
          .bindPopup(
            `<div class="marker-popup"><strong>Pickup</strong><br>${pickup.name ?? 'Pickup'}</div>`
          )
          .addTo(map)
      } else {
        pickupMarkerRef.current.setLatLng([pickup.lat, pickup.lng])
      }
    } else if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current)
      pickupMarkerRef.current = null
    }

    if (dropoff) {
      if (!dropoffMarkerRef.current) {
        dropoffMarkerRef.current = L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon })
          .bindPopup(
            `<div class="marker-popup"><strong>Dropoff</strong><br>${dropoff.name ?? 'Dropoff'}</div>`
          )
          .addTo(map)
      } else {
        dropoffMarkerRef.current.setLatLng([dropoff.lat, dropoff.lng])
      }
    } else if (dropoffMarkerRef.current) {
      map.removeLayer(dropoffMarkerRef.current)
      dropoffMarkerRef.current = null
    }

    const points = [pickup, dropoff].filter(Boolean) as GeoPoint[]
    if (points.length === 2) {
      const group = new L.FeatureGroup([
        L.marker([points[0].lat, points[0].lng]),
        L.marker([points[1].lat, points[1].lng]),
      ])
      map.fitBounds(group.getBounds().pad(0.2))
    } else if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 11)
    }
  }, [pickup, dropoff])

  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current
    const handleClick = (event: L.LeafletMouseEvent) => {
      const lat = event.latlng.lat
      const lng = event.latlng.lng
      const name = getNearestLocationName(lat, lng)
      onSelect(activeType, { lat, lng, name })
    }

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [activeType, onSelect])

  return (
    <div className="map-container map-picker" style={{ height }}>
      <div ref={containerRef} className="map-wrapper" />
    </div>
  )
}

export default MapPicker
