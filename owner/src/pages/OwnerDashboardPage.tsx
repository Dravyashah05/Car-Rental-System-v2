import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../services/api'

type RideStatus =
  | 'requested'
  | 'assigned'
  | 'accepted'
  | 'enroute'
  | 'completed'
  | 'cancelled'

type Ride = {
  _id: string
  pickup?: { address?: string }
  dropoff?: { address?: string }
  status?: RideStatus
  createdAt?: string
  fare?: number
  rider?: { name?: string; email?: string }
}

type Vehicle = {
  _id: string
  make?: string
  model?: string
  plateNumber?: string
  seats?: number
}

const statusLabelMap: Record<RideStatus, string> = {
  requested: 'Requested',
  assigned: 'Assigned',
  accepted: 'Confirmed',
  enroute: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusClassMap: Record<RideStatus, string> = {
  requested: 'requested',
  assigned: 'assigned',
  accepted: 'confirmed',
  enroute: 'in-progress',
  completed: 'completed',
  cancelled: 'cancelled',
}

function OwnerDashboardPage() {
  const [rides, setRides] = useState<Ride[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true
    const loadData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [ridesData, vehiclesData] = await Promise.all([
          apiFetch<Ride[]>('/api/rides'),
          apiFetch<Vehicle[]>('/api/vehicles'),
        ])
        if (isActive) {
          setRides(ridesData)
          setVehicles(vehiclesData)
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Unable to load owner dashboard')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }
    loadData()
    return () => {
      isActive = false
    }
  }, [])

  const pendingCount = rides.filter((ride) => (ride.status ?? 'requested') === 'requested').length
  const activeCount = rides.filter((ride) =>
    ['assigned', 'accepted', 'enroute'].includes(ride.status ?? 'requested')
  ).length
  const completedCount = rides.filter((ride) => ride.status === 'completed').length
  const cancelledCount = rides.filter((ride) => ride.status === 'cancelled').length

  const revenue = rides.reduce((sum, ride) => {
    if (ride.status !== 'completed') return sum
    return sum + (ride.fare ?? 0)
  }, 0)

  const recentRides = useMemo(() => {
    return [...rides]
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      })
      .slice(0, 6)
  }, [rides])

  return (
    <div className="page">
      <section className="hero" data-animate>
        <div>
          <p className="hero-label">Owner overview</p>
          <div className="hero-value">{pendingCount}</div>
          <p className="hero-note">
            {error ? error : 'Pending booking requests awaiting your confirmation.'}
          </p>
          <div className="hero-actions">
            <Link to="/requests" className="primary">
              Review requests
            </Link>
            <Link to="/add-car" className="ghost">
              Add vehicle
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card" data-animate data-delay="0">
            <p>Active rentals</p>
            <h3>{activeCount}</h3>
            <span className="trend up">{rides.length} total bookings</span>
          </div>
          <div className="stat-card" data-animate data-delay="90">
            <p>Completed</p>
            <h3>{completedCount}</h3>
            <span className="trend up">Rs. {revenue.toFixed(2)} earned</span>
          </div>
          <div className="stat-card" data-animate data-delay="180">
            <p>Fleet size</p>
            <h3>{vehicles.length}</h3>
            <span className="trend down">{cancelledCount} cancelled rides</span>
          </div>
        </div>
      </section>

      {isLoading ? <p className="muted">Loading dashboard data...</p> : null}

      <section className="kpi-grid">
        <div className="kpi" data-animate data-delay="0">
          <p>Pending requests</p>
          <h2>{pendingCount}</h2>
          <span className="badge">Needs confirmation</span>
        </div>
        <div className="kpi" data-animate data-delay="90">
          <p>Active rentals</p>
          <h2>{activeCount}</h2>
          <span className="badge">On the road</span>
        </div>
        <div className="kpi" data-animate data-delay="180">
          <p>Completed rides</p>
          <h2>{completedCount}</h2>
          <span className="badge">Finished bookings</span>
        </div>
        <div className="kpi" data-animate data-delay="270">
          <p>Fleet vehicles</p>
          <h2>{vehicles.length}</h2>
          <span className="badge">Owner inventory</span>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel" data-animate data-delay="0">
          <div className="panel-header">
            <div>
              <h3>Recent activity</h3>
              <p>Latest booking activity across your fleet.</p>
            </div>
          </div>
          {recentRides.length === 0 ? (
            <p className="muted">No bookings yet.</p>
          ) : (
            <div className="table">
              <div className="table-row table-head">
                <span>Booking</span>
                <span>Customer</span>
                <span>Route</span>
                <span>Status</span>
                <span>Time</span>
              </div>
              {recentRides.map((ride) => {
                const pickup = ride.pickup?.address ?? 'Unknown pickup'
                const dropoff = ride.dropoff?.address ?? 'Unknown dropoff'
                const status = ride.status ?? 'requested'
                const rider = ride.rider?.name ?? ride.rider?.email ?? 'Customer'
                const time = ride.createdAt
                  ? new Date(ride.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--'
                return (
                  <div key={ride._id} className="table-row">
                    <span className="mono">{ride._id.slice(-8).toUpperCase()}</span>
                    <span>{rider}</span>
                    <span>{pickup} {'->'} {dropoff}</span>
                    <span className={`status ${statusClassMap[status] ?? 'requested'}`}>
                      {statusLabelMap[status] ?? 'Requested'}
                    </span>
                    <span>{time}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="panel" data-animate data-delay="120">
          <div className="panel-header">
            <div>
              <h3>Fleet snapshot</h3>
              <p>Quick look at your listed vehicles.</p>
            </div>
            <Link to="/add-car" className="ghost">
              Add car
            </Link>
          </div>
          {vehicles.length === 0 ? (
            <p className="muted">No vehicles added yet.</p>
          ) : (
            <div className="stack">
              {vehicles.slice(0, 4).map((vehicle) => (
                <div key={vehicle._id} className="row-card">
                  <div>
                    <p className="row-title">
                      {vehicle.make ?? 'Vehicle'} {vehicle.model ?? ''}
                    </p>
                    <p className="muted">{vehicle.plateNumber ?? 'Plate pending'}</p>
                  </div>
                  <span className="pill">{vehicle.seats ? `${vehicle.seats} seats` : 'Seats N/A'}</span>
                  <span className="pill success">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default OwnerDashboardPage
