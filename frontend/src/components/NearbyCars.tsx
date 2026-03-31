import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cabService } from '../services/cabService'
import type { Cab } from '../types'
import { getCabMockLocation, getDistanceKm, resolveLocationInput } from '../utils/geo'

interface NearbyCarsProps {
  pickupLocation: string
  currentCabId?: string
}

type NearbyCab = {
  cab: Cab
  distanceKm: number
  etaMin: number
  baseName: string
}

const NearbyCars: React.FC<NearbyCarsProps> = ({ pickupLocation, currentCabId }) => {
  const [cabs, setCabs] = useState<Cab[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await cabService.getAllCabs()
        if (active) setCabs(data)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load nearby cars')
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const pickupPoint = useMemo(() => resolveLocationInput(pickupLocation), [pickupLocation])

  const nearby = useMemo<NearbyCab[]>(() => {
    if (!pickupPoint) return []

    return cabs
      .filter((cab) => cab.id !== currentCabId)
      .map((cab) => {
        const mock = getCabMockLocation(cab.id)
        const distanceKm = getDistanceKm(pickupPoint, mock)
        const etaMin = Math.max(6, Math.round((distanceKm / 28) * 60))
        return {
          cab,
          distanceKm,
          etaMin,
          baseName: mock.baseName,
        }
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3)
  }, [cabs, pickupPoint, currentCabId])

  const hasPickup = pickupLocation.trim().length > 0

  return (
    <div className="nearby-panel panel-card">
      <div className="nearby-header">
        <div>
          <h3>Nearby cars</h3>
          <p>Estimated availability around your pickup point.</p>
        </div>
        <span className="nearby-badge">Live estimate</span>
      </div>

      {!hasPickup ? (
        <p className="muted">Add a pickup location to see nearby options.</p>
      ) : null}

      {isLoading ? <p className="muted">Loading nearby cars...</p> : null}
      {error ? <p className="muted">Error: {error}</p> : null}

      {hasPickup && !isLoading && !error && nearby.length === 0 ? (
        <p className="muted">No nearby cars available yet.</p>
      ) : null}

      <div className="nearby-list">
        {nearby.map((item) => (
          <div key={item.cab.id} className="nearby-item">
            <div>
              <div className="nearby-title">
                {item.cab.make} {item.cab.model}
              </div>
              <div className="nearby-meta">
                <span>{item.cab.seats} seats</span>
                <span>Rs. {item.cab.pricePerKm}/km</span>
                <span>{item.baseName}</span>
              </div>
              <div className="nearby-distance">
                {item.distanceKm.toFixed(1)} km away • ETA {item.etaMin} min
              </div>
            </div>
            <Link className="nearby-action" to={`/book/${item.cab.id}`}>
              Switch
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NearbyCars
