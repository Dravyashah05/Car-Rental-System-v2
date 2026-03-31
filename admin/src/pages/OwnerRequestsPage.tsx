import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../services/api'

type Driver = {
  _id: string
  isActive?: boolean
  licenseNumber?: string
  user?: {
    name?: string
    email?: string
    phone?: string
  }
}

type Ride = {
  _id: string
  rider?: { name?: string; email?: string }
  pickup?: { address?: string }
  dropoff?: { address?: string }
  status?: string
  createdAt?: string
  driver?: {
    _id?: string
    user?: { name?: string; email?: string }
  }
}

const statusLabelMap: Record<string, string> = {
  requested: 'Requested',
  assigned: 'Assigned',
  accepted: 'Confirmed',
  enroute: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusClassMap: Record<string, string> = {
  requested: 'requested',
  assigned: 'assigned',
  accepted: 'confirmed',
  enroute: 'in-progress',
  completed: 'completed',
  cancelled: 'cancelled',
}

function OwnerRequestsPage() {
  const [rides, setRides] = useState<Ride[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [ridesData, driversData] = await Promise.all([
        apiFetch<Ride[]>('/api/rides'),
        apiFetch<Driver[]>('/api/owners'),
      ])
      setRides(ridesData)
      setDrivers(driversData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load owner requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const counts = useMemo(() => {
    const total = rides.length
    const pending = rides.filter((ride) => (ride.status ?? 'requested') === 'requested').length
    const confirmed = rides.filter((ride) =>
      ['accepted', 'assigned'].includes((ride.status ?? '').toLowerCase())
    ).length
    const inProgress = rides.filter((ride) => (ride.status ?? '') === 'enroute').length
    const completed = rides.filter((ride) => (ride.status ?? '') === 'completed').length
    return { total, pending, confirmed, inProgress, completed }
  }, [rides])

  const pendingRides = useMemo(
    () => rides.filter((ride) => (ride.status ?? 'requested') === 'requested'),
    [rides]
  )

  const activeDrivers = useMemo(
    () => drivers.filter((driver) => driver.isActive !== false),
    [drivers]
  )

  const openRideModal = (ride: Ride) => {
    setSelectedRide(ride)
    setSelectedDriverId('')
  }

  const closeRideModal = () => {
    setSelectedRide(null)
    setSelectedDriverId('')
  }

  const updateRideStatus = async (status: 'accepted' | 'cancelled') => {
    if (!selectedRide) return
    setError('')
    setIsUpdating(true)
    try {
      const updated = await apiFetch<Ride>(`/api/rides/${selectedRide._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setRides((prev) =>
        prev.map((ride) => (ride._id === updated._id ? { ...ride, ...updated } : ride))
      )
      setSelectedRide((prev) => (prev ? { ...prev, ...updated } : prev))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update booking status')
    } finally {
      setIsUpdating(false)
    }
  }

  const assignDriver = async () => {
    if (!selectedRide || !selectedDriverId) return
    setError('')
    setIsUpdating(true)
    try {
      const updated = await apiFetch<Ride>(`/api/rides/${selectedRide._id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ ownerId: selectedDriverId }),
      })
      const driver = drivers.find((item) => item._id === selectedDriverId)
      setRides((prev) =>
        prev.map((ride) =>
          ride._id === updated._id
            ? { ...ride, ...updated, driver: driver ? { _id: driver._id, user: driver.user } : ride.driver }
            : ride
        )
      )
      setSelectedRide((prev) =>
        prev
          ? { ...prev, ...updated, driver: driver ? { _id: driver._id, user: driver.user } : prev.driver }
          : prev
      )
      setSelectedDriverId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to assign owner')
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDateTime = (value?: string) => {
    if (!value) return '--'
    return new Date(value).toLocaleString()
  }

  return (
    <div className="page">
      <section className="page-grid">
        <div className="info-card" data-animate data-delay="0">
          <p>Total requests</p>
          <h3>{counts.total}</h3>
          <span className="muted">All rental inquiries</span>
        </div>
        <div className="info-card" data-animate data-delay="90">
          <p>Pending confirmation</p>
          <h3>{counts.pending}</h3>
          <span className="muted">Waiting for owner response</span>
        </div>
        <div className="info-card" data-animate data-delay="180">
          <p>Confirmed</p>
          <h3>{counts.confirmed}</h3>
          <span className="muted">Approved or assigned</span>
        </div>
        <div className="info-card" data-animate data-delay="270">
          <p>In progress</p>
          <h3>{counts.inProgress}</h3>
          <span className="muted">Currently running</span>
        </div>
      </section>

      <section className="panel" data-animate data-delay="0">
        <div className="panel-header">
          <div>
            <h3>Owner confirmation queue</h3>
            <p>Confirm bookings and send owner requests.</p>
          </div>
          <button className="ghost" type="button" onClick={loadData}>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <p className="muted">Loading requests...</p>
        ) : error ? (
          <p className="muted">{error}</p>
        ) : pendingRides.length === 0 ? (
          <p className="muted">No pending rental requests right now.</p>
        ) : (
          <div className="table">
            <div className="table-row table-head">
              <span>Request</span>
              <span>Customer</span>
              <span>Route</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {pendingRides.map((ride) => {
              const statusKey = (ride.status ?? 'requested').toLowerCase()
              const route = `${ride.pickup?.address ?? 'Unknown'} -> ${ride.dropoff?.address ?? 'Unknown'}`
              const riderName = ride.rider?.name ?? ride.rider?.email ?? 'Unknown'
              return (
                <div key={ride._id} className="table-row clickable-row" onClick={() => openRideModal(ride)}>
                  <span className="mono">{ride._id.slice(-8).toUpperCase()}</span>
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
                    Review
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {selectedRide ? (
        <div className="modal-backdrop" onClick={closeRideModal}>
          <div className="modal trip-details-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Rental request</h3>
                <p className="muted">Confirm availability and send owner request.</p>
              </div>
              <span className="tag">Request {selectedRide._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="detail-hero">
              <div className="detail-hero-media">CR</div>
              <div>
                <h4>{selectedRide.rider?.name ?? 'Customer'}</h4>
                <p className="muted">{selectedRide.rider?.email ?? 'No email provided'}</p>
              </div>
            </div>
            <div className="modal-body detail-grid">
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">PU</span>Pickup</span>
                <strong>{selectedRide.pickup?.address ?? 'Unknown pickup'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">DO</span>Dropoff</span>
                <strong>{selectedRide.dropoff?.address ?? 'Unknown dropoff'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">ST</span>Status</span>
                <strong>
                  {statusLabelMap[(selectedRide.status ?? 'requested').toLowerCase()] ?? 'Requested'}
                </strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">TM</span>Created</span>
                <strong>{formatDateTime(selectedRide.createdAt)}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">OW</span>Owner</span>
                <strong>
                  {selectedRide.driver?.user?.name ??
                    selectedRide.driver?.user?.email ??
                    'Not assigned'}
                </strong>
              </div>
            </div>

            <div className="modal-body form-grid">
              <label className="field">
                <span>Assign owner (send request)</span>
                <select
                  value={selectedDriverId}
                  onChange={(event) => setSelectedDriverId(event.target.value)}
                  disabled={activeDrivers.length === 0 || isUpdating}
                >
                  <option value="">Select an owner</option>
                  {activeDrivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.user?.name ?? driver.user?.email ?? `Owner ${driver._id.slice(-4).toUpperCase()}`}
                      {driver.licenseNumber ? ` - ${driver.licenseNumber}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button className="ghost" type="button" onClick={closeRideModal} disabled={isUpdating}>
                Close
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => updateRideStatus('cancelled')}
                disabled={isUpdating}
                style={{ color: '#ef4444' }}
              >
                {isUpdating ? 'Updating...' : 'Reject request'}
              </button>
              <button
                className="ghost"
                type="button"
                onClick={assignDriver}
                disabled={!selectedDriverId || isUpdating}
              >
                {isUpdating ? 'Sending...' : 'Send to owner'}
              </button>
              <button
                className="primary"
                type="button"
                onClick={() => updateRideStatus('accepted')}
                disabled={isUpdating}
              >
                {isUpdating ? 'Confirming...' : 'Confirm booking'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default OwnerRequestsPage
