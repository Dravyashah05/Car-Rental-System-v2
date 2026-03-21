import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { apiFetch } from '../services/api'

type Ride = {
  _id: string
  rider?: { name?: string; email?: string }
  pickup?: { address?: string }
  dropoff?: { address?: string }
  status?: string
  createdAt?: string
}

const statusLabelMap: Record<string, string> = {
  requested: 'Requested',
  assigned: 'Assigned',
  accepted: 'Accepted',
  enroute: 'En route',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusClassMap: Record<string, string> = {
  requested: 'requested',
  assigned: 'assigned',
  accepted: 'in-progress',
  enroute: 'in-progress',
  completed: 'completed',
  cancelled: 'cancelled',
}

function BookingsPage() {
  const location = useLocation()
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [isEditingRide, setIsEditingRide] = useState(false)
  const [rideStatus, setRideStatus] = useState('accepted')
  const [isUpdatingRide, setIsUpdatingRide] = useState(false)

  useEffect(() => {
    let isActive = true
    const loadRides = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await apiFetch<Ride[]>('/api/rides')
        if (isActive) {
          setRides(data)
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Unable to load bookings')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadRides()
    return () => {
      isActive = false
    }
  }, [])

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return (params.get('q') ?? '').trim().toLowerCase()
  }, [location.search])

  const stats = useMemo(() => {
    const total = rides.length
    const pending = rides.filter((ride) => ride.status === 'requested').length
    const active = rides.filter((ride) =>
      ['assigned', 'accepted', 'enroute'].includes(ride.status ?? '')
    ).length
    const completed = rides.filter((ride) => ride.status === 'completed').length
    return { total, pending, active, completed }
  }, [rides])

  const closeRideModal = () => {
    setSelectedRide(null)
    setIsEditingRide(false)
    setRideStatus('accepted')
  }

  const openRideModal = (ride: Ride) => {
    setSelectedRide(ride)
    const current = (ride.status ?? 'requested').toLowerCase()
    const editableStatuses = ['accepted', 'enroute', 'completed', 'cancelled']
    setRideStatus(editableStatuses.includes(current) ? current : 'accepted')
  }

  const saveRideStatus = async () => {
    if (!selectedRide) return
    setError('')
    setIsUpdatingRide(true)
    try {
      const updated = await apiFetch<Ride>(`/api/rides/${selectedRide._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: rideStatus }),
      })
      setRides((prev) => prev.map((ride) => (ride._id === updated._id ? { ...ride, ...updated } : ride)))
      setSelectedRide((prev) => (prev ? { ...prev, ...updated } : prev))
      setIsEditingRide(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update booking status')
    } finally {
      setIsUpdatingRide(false)
    }
  }

  const handleDeleteRide = async () => {
    if (!selectedRide) return
    if (!window.confirm('Are you sure you want to delete this booking?')) return
    setError('')
    setIsUpdatingRide(true)
    try {
      await apiFetch(`/api/rides/${selectedRide._id}`, {
        method: 'DELETE',
      })
      setRides((prev) => prev.filter((ride) => ride._id !== selectedRide._id))
      closeRideModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete booking')
    } finally {
      setIsUpdatingRide(false)
    }
  }

  const filteredRides = useMemo(() => {
    if (!searchQuery) return rides
    return rides.filter((ride) => {
      const route = `${ride.pickup?.address ?? ''} ${ride.dropoff?.address ?? ''}`
      const rider = `${ride.rider?.name ?? ''} ${ride.rider?.email ?? ''}`
      const haystack = [
        ride._id,
        rider,
        route,
        ride.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(searchQuery)
    })
  }, [rides, searchQuery])

  const visibleRides = searchQuery ? filteredRides : rides

  return (
    <div className="page">
      <section className="page-grid">
        <div className="info-card" data-animate data-delay="0">
          <p>Total bookings</p>
          <h3>{stats.total}</h3>
          <span className="muted">All rental requests</span>
        </div>
        <div className="info-card" data-animate data-delay="90">
          <p>Pending assignment</p>
          <h3>{stats.pending}</h3>
          <span className="muted">Waiting for owner</span>
        </div>
        <div className="info-card" data-animate data-delay="180">
          <p>Active rentals</p>
          <h3>{stats.active}</h3>
          <span className="muted">Assigned or in progress</span>
        </div>
        <div className="info-card" data-animate data-delay="270">
          <p>Completed rentals</p>
          <h3>{stats.completed}</h3>
          <span className="muted">Finished bookings</span>
        </div>
      </section>

      <section className="panel" data-animate data-delay="0">
        <div className="panel-header">
          <div>
            <h3>Bookings</h3>
            <p>Monitor rentals and manage status updates</p>
          </div>
          <button className="ghost">Assign owner</button>
        </div>
        {isLoading ? (
          <p className="muted">Loading bookings...</p>
        ) : error ? (
          <p className="muted">{error}</p>
        ) : rides.length === 0 ? (
          <p className="muted">No bookings available yet.</p>
        ) : visibleRides.length === 0 ? (
          <p className="muted">No bookings match your search.</p>
        ) : (
          <div className="table">
            <div className="table-row table-head">
              <span>Booking</span>
              <span>Customer</span>
              <span>Route</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {visibleRides.map((ride) => {
              const statusKey = (ride.status ?? 'requested').toLowerCase()
              const route = `${ride.pickup?.address ?? 'Unknown'} -> ${ride.dropoff?.address ?? 'Unknown'}`
              const riderName = ride.rider?.name ?? ride.rider?.email ?? 'Unknown'
              return (
                <div key={ride._id} className="table-row clickable-row" onClick={() => openRideModal(ride)}>
                  <span className="mono">{(ride._id || '').slice(-8).toUpperCase()}</span>
                  <span>{riderName}</span>
                  <span>{route}</span>
                  <span className={`status ${statusClassMap[statusKey] ?? 'requested'}`}>
                    {statusLabelMap[statusKey] ?? 'Requested'}
                  </span>
                  <button
                    className="ghost"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      openRideModal(ride)
                    }}
                  >
                    Open
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {selectedRide ? (
        <div className="modal-backdrop" onClick={closeRideModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Booking details</h3>
                <p className="muted">Trip, customer, and status information.</p>
              </div>
              <span className="tag">Booking {(selectedRide._id || '').slice(-8).toUpperCase()}</span>
            </div>
            <div className="detail-hero">
              <div className="detail-hero-media">BK</div>
              <div>
                <h4>{selectedRide.rider?.name ?? 'Unknown customer'}</h4>
                <p className="muted">{selectedRide.rider?.email ?? 'No email'}</p>
              </div>
            </div>
            <div className="modal-body detail-grid">
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">RD</span>Customer</span>
                <strong>{selectedRide.rider?.name ?? selectedRide.rider?.email ?? 'Unknown'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">@</span>Customer email</span>
                <strong>{selectedRide.rider?.email ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">PU</span>Pickup</span>
                <strong>{selectedRide.pickup?.address ?? 'Unknown'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">DO</span>Dropoff</span>
                <strong>{selectedRide.dropoff?.address ?? 'Unknown'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">ST</span>Status</span>
                <strong>{statusLabelMap[(selectedRide.status ?? 'requested').toLowerCase()] ?? 'Requested'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">DT</span>Created</span>
                <strong>
                  {selectedRide.createdAt
                    ? new Date(selectedRide.createdAt).toLocaleString()
                    : '--'}
                </strong>
              </div>
            </div>
            {isEditingRide ? (
              <div className="modal-body form-grid">
                <label className="field">
                  <span>Update status</span>
                  <select value={rideStatus} onChange={(event) => setRideStatus(event.target.value)}>
                    <option value="accepted">Accepted</option>
                    <option value="enroute">En route</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
              </div>
            ) : null}
            <div className="modal-actions">
              <button
                className="ghost"
                type="button"
                onClick={handleDeleteRide}
                style={{ color: '#ef4444', marginRight: 'auto' }}
                disabled={isUpdatingRide}
              >
                Delete
              </button>
              <button className="ghost" type="button" onClick={closeRideModal}>
                Close
              </button>
              {isEditingRide ? (
                <button className="primary" type="button" onClick={saveRideStatus} disabled={isUpdatingRide}>
                  {isUpdatingRide ? 'Saving...' : 'Save changes'}
                </button>
              ) : (
                <button className="primary" type="button" onClick={() => setIsEditingRide(true)}>
                  Edit info
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default BookingsPage
