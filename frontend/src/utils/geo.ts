export type GeoPoint = {
  lat: number
  lng: number
  name?: string
}

export const BASE_LOCATIONS: GeoPoint[] = [
  { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
]

const normalize = (value: string) => value.trim().toLowerCase()

export const formatCoords = (lat: number, lng: number) =>
  `${lat.toFixed(4)}, ${lng.toFixed(4)}`

export const parseCoordinates = (value: string): GeoPoint | null => {
  const matches = value.match(/-?\d+(\.\d+)?/g)
  if (!matches || matches.length < 2) return null
  const lat = Number(matches[0])
  const lng = Number(matches[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng, name: formatCoords(lat, lng) }
}

export const findLocationByName = (value: string): GeoPoint | null => {
  const needle = normalize(value)
  if (!needle) return null
  const match = BASE_LOCATIONS.find((loc) => {
    const name = normalize(loc.name ?? '')
    return name === needle || name.includes(needle) || needle.includes(name)
  })
  return match ? { lat: match.lat, lng: match.lng, name: match.name } : null
}

const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

const seededOffset = (seed: number, scale: number) => {
  const x = Math.sin(seed) * 10000
  return (x - Math.floor(x) - 0.5) * scale
}

export const getFallbackLocation = (label: string): GeoPoint => {
  const safeLabel = label.trim() || 'location'
  const seed = hashString(safeLabel)
  const base = BASE_LOCATIONS[seed % BASE_LOCATIONS.length]
  return {
    lat: base.lat + seededOffset(seed + 1, 0.28),
    lng: base.lng + seededOffset(seed + 2, 0.28),
    name: safeLabel,
  }
}

export const resolveLocationInput = (
  value: string | GeoPoint | undefined | null
): GeoPoint | null => {
  if (!value) return null
  if (typeof value !== 'string') return value
  const parsed = parseCoordinates(value)
  if (parsed) return parsed
  const matched = findLocationByName(value)
  if (matched) return matched
  return getFallbackLocation(value)
}

export const getDistanceKm = (a: GeoPoint, b: GeoPoint) => {
  const rad = (value: number) => (value * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const lat1 = rad(a.lat)
  const lat2 = rad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return 6371 * c
}

export const getNearestLocationName = (lat: number, lng: number) => {
  const point = { lat, lng }
  const closest = BASE_LOCATIONS.map((loc) => ({
    loc,
    distance: getDistanceKm(point, loc),
  })).sort((a, b) => a.distance - b.distance)[0]

  if (closest && closest.distance <= 35) {
    return closest.loc.name ?? formatCoords(lat, lng)
  }

  return formatCoords(lat, lng)
}

export const getCabMockLocation = (cabId: string) => {
  const seed = hashString(cabId)
  const base = BASE_LOCATIONS[seed % BASE_LOCATIONS.length]
  return {
    lat: base.lat + seededOffset(seed + 7, 0.18),
    lng: base.lng + seededOffset(seed + 11, 0.18),
    baseName: base.name ?? 'Near city center',
  }
}
