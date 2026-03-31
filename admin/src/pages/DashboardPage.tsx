import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
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
}

type SupportMessage = {
  _id: string
  subject?: string
  message?: string
  status?: string
  createdAt?: string
  user?: {
    id?: string
    name?: string
    email?: string
    phone?: string
    role?: string
  }
  name?: string
  email?: string
  phone?: string
}

function DashboardPage() {
  type Driver = { _id: string; isActive?: boolean }
  type User = { _id: string; createdAt?: string }
  type Vehicle = { _id: string }

  const [bookings, setBookings] = useState<Ride[]>([])
  const [rides, setRides] = useState<Ride[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([])
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [isLoadingSupport, setIsLoadingSupport] = useState(false)
  const [supportError, setSupportError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<RideStatus | 'all'>('all')
  const [selectedBooking, setSelectedBooking] = useState<Ride | null>(null)
  const [isEditingBooking, setIsEditingBooking] = useState(false)
  const [bookingStatus, setBookingStatus] = useState('accepted')
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false)

  const statusLabels = useMemo(
    () => ({
      requested: 'Requested',
      assigned: 'Assigned',
      accepted: 'Confirmed',
      enroute: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }),
    []
  )

  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true)
    setSummaryError(null)
    try {
      const [ridesData, driversData, usersData, vehiclesData] = await Promise.all([
        apiFetch<Ride[]>('/api/rides'),
        apiFetch<Driver[]>('/api/owners'),
        apiFetch<User[]>('/api/users'),
        apiFetch<Vehicle[]>('/api/vehicles'),
      ])
      setRides(ridesData)
      setDrivers(driversData)
      setUsers(usersData)
      setVehicles(vehiclesData)
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoadingSummary(false)
    }
  }, [])

  const loadBookings = useCallback(async () => {
    setIsLoadingBookings(true)
    setBookingsError(null)
    try {
      const query = statusFilter === 'all' ? '' : `?status=${statusFilter}`
      const data = await apiFetch<Ride[]>(`/api/rides${query}`)
      setBookings(data)
    } catch (err) {
      setBookingsError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setIsLoadingBookings(false)
    }
  }, [statusFilter])

  const loadSupport = useCallback(async () => {
    setIsLoadingSupport(true)
    setSupportError(null)
    try {
      const data = await apiFetch<SupportMessage[]>('/api/support')
      setSupportMessages(data)
    } catch (err) {
      setSupportError(err instanceof Error ? err.message : 'Failed to load support messages')
    } finally {
      setIsLoadingSupport(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
    loadBookings()
    loadSupport()
  }, [loadSummary, loadBookings, loadSupport])

  const todayKey = new Date().toDateString()
  const activeRideStatuses: RideStatus[] = ['assigned', 'accepted', 'enroute']
  const activeRides = rides.filter((ride) => activeRideStatuses.includes(ride.status ?? 'requested'))
  const completedRides = rides.filter((ride) => ride.status === 'completed')
  const cancelledRides = rides.filter((ride) => ride.status === 'cancelled')
  const activeDrivers = drivers.filter((driver) => driver.isActive)

  const revenueToday = completedRides.reduce((sum, ride) => {
    if (!ride.createdAt || !ride.fare) return sum
    const dateKey = new Date(ride.createdAt).toDateString()
    return dateKey === todayKey ? sum + ride.fare : sum
  }, 0)

  const completedLast7Days = completedRides.filter((ride) => {
    if (!ride.createdAt) return false
    const created = new Date(ride.createdAt).getTime()
    const sevenDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000
    return created >= sevenDaysAgo
  }).length

  const cancellationRate =
    rides.length > 0 ? (cancelledRides.length / rides.length) * 100 : 0

  const avgWaitMinutes = activeRides.length
    ? Math.round(
        activeRides.reduce((sum, ride) => {
          if (!ride.createdAt) return sum
          const diff = Date.now() - new Date(ride.createdAt).getTime()
          return sum + diff / 60000
        }, 0) / activeRides.length
      )
    : 0

  const driverReadiness =
    drivers.length > 0 ? Math.round((activeDrivers.length / drivers.length) * 100) : 0

  const newUsers7Days = users.filter((user) => {
    if (!user.createdAt) return false
    return new Date(user.createdAt).getTime() >= Date.now() - 6 * 24 * 60 * 60 * 1000
  }).length

  const bars = useMemo(() => {
    const days = [...Array(7)].map((_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      return date
    })
    const totals = days.map((day) => {
      const key = day.toDateString()
      return rides.reduce((sum, ride) => {
        if (!ride.createdAt) return sum
        return new Date(ride.createdAt).toDateString() === key ? sum + 1 : sum
      }, 0)
    })
    const max = Math.max(1, ...totals)
    return totals.map((total) => Math.round((total / max) * 100))
  }, [rides])

  const barLabels = useMemo(() => {
    return [...Array(7)].map((_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    })
  }, [])

  const signals = [
    {
      label: 'Owner readiness',
      value: `${driverReadiness}%`,
      note: `${activeDrivers.length} active owners`,
      trend: `${drivers.length} total`,
      trendDirection: 'up',
    },
    {
      label: 'Avg. dispatch wait',
      value: `${avgWaitMinutes} min`,
      note: `${activeRides.length} rentals in progress`,
      trend: `${rides.length} total rentals`,
      trendDirection: 'down',
    },
    {
      label: 'New users (7d)',
      value: `${newUsers7Days}`,
      note: `${users.length} total users`,
      trend: `${vehicles.length} vehicles`,
      trendDirection: 'up',
    },
  ]

  const demandIndex =
    rides.length > 0 ? Math.min(100, Math.round((activeRides.length / rides.length) * 100)) : 0

  const openBookingModal = (booking: Ride) => {
    setSelectedBooking(booking)
    const current = (booking.status ?? 'requested').toLowerCase()
    const editableStatuses = ['accepted', 'enroute', 'completed', 'cancelled']
    setBookingStatus(editableStatuses.includes(current) ? current : 'accepted')
  }

  const closeBookingModal = () => {
    setSelectedBooking(null)
    setIsEditingBooking(false)
    setBookingStatus('accepted')
  }

  const saveBookingStatus = async () => {
    if (!selectedBooking) return
    setBookingsError(null)
    setIsUpdatingBooking(true)
    try {
      const updated = await apiFetch<Ride>(`/api/rides/${selectedBooking._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: bookingStatus }),
      })
      setBookings((prev) =>
        prev.map((booking) => (booking._id === updated._id ? { ...booking, ...updated } : booking))
      )
      setSelectedBooking((prev) => (prev ? { ...prev, ...updated } : prev))
      setIsEditingBooking(false)
    } catch (err) {
      setBookingsError(err instanceof Error ? err.message : 'Failed to update booking status')
    } finally {
      setIsUpdatingBooking(false)
    }
  }

  const formatSupportTime = (timestamp?: string) => {
    if (!timestamp) return '--'
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const resolveSupportUser = (message: SupportMessage) => {
    if (message.user) return message.user
    return { name: message.name, email: message.email, phone: message.phone }
  }

  return (
    <div className="page">
      <section className="hero" data-animate>
        <div>
          <p className="hero-label">Operations pulse</p>
          <div className="hero-value">{demandIndex}%</div>
          <p className="hero-note">
            {summaryError
              ? summaryError
              : `Tracking ${rides.length} rentals and ${drivers.length} owners today.`}
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card" data-animate data-delay="0">
            <p>Active rentals</p>
            <h3>{activeRides.length}</h3>
            <span className="trend up">{rides.length} total rentals</span>
          </div>
          <div className="stat-card" data-animate data-delay="90">
            <p>Avg. wait time</p>
            <h3>{avgWaitMinutes}m</h3>
            <span className="trend down">Based on active rentals</span>
          </div>
          <div className="stat-card" data-animate data-delay="180">
            <p>Owner availability</p>
            <h3>{activeDrivers.length}</h3>
            <span className="trend up">{drivers.length} total owners</span>
          </div>
        </div>
      </section>

      {isLoadingSummary ? <p className="muted">Loading dashboard data...</p> : null}

      <section className="signal-grid">
        {signals.map((signal, index) => (
          <div
            key={signal.label}
            className="signal-card"
            data-animate
            data-delay={index * 90}
          >
            <span className="signal-label">{signal.label}</span>
            <div className="signal-value">{signal.value}</div>
            <p className="signal-note">{signal.note}</p>
            <span className={`signal-trend ${signal.trendDirection === 'down' ? 'down' : ''}`}>
              {signal.trend}
            </span>
          </div>
        ))}
      </section>

      <section className="kpi-grid">
        <div className="kpi" data-animate data-delay="0">
          <p>Revenue today</p>
          <h2>Rs. {revenueToday.toFixed(2)}</h2>
          <span className="badge">{completedRides.length} completed rentals</span>
        </div>
        <div className="kpi" data-animate data-delay="90">
          <p>Completed (7d)</p>
          <h2>{completedLast7Days}</h2>
          <span className="badge">{completedRides.length} total completed</span>
        </div>
        <div className="kpi" data-animate data-delay="180">
          <p>Cancellation rate</p>
          <h2>{cancellationRate.toFixed(1)}%</h2>
          <span className="badge danger">{cancelledRides.length} cancelled rentals</span>
        </div>
        <div className="kpi" data-animate data-delay="270">
          <p>Total users</p>
          <h2>{users.length}</h2>
          <span className="badge">{newUsers7Days} new this week</span>
        </div>
      </section>

      <section className="content-grid">
          <div className="panel" data-animate data-delay="0">
            <div className="panel-header">
              <div>
                <h3>Weekly bookings</h3>
                <p>Across all zones and vehicle types</p>
              </div>
            </div>
            <div className="chart">
              {bars.map((value, index) => (
              <div
                key={`${value}-${index}`}
                className="bar"
                style={{ '--h': `${value}%` } as CSSProperties}
              />
            ))}
          </div>
          <div className="chart-labels">
            {barLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>

        <div className="panel" data-animate data-delay="120">
          <div className="panel-header">
            <div>
              <h3>Recent bookings</h3>
              <p>{isLoadingBookings ? 'Updating...' : 'Updated moments ago'}</p>
            </div>
            <div className="row">
              <select
                className="ghost"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as RideStatus | 'all')}
              >
                <option value="all">All</option>
                <option value="requested">Requested</option>
                <option value="assigned">Assigned</option>
                <option value="accepted">Confirmed</option>
                <option value="enroute">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="ghost" type="button" onClick={loadBookings}>
                {isLoadingBookings ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          {bookingsError ? <p className="muted">Error: {bookingsError}</p> : null}
          <div className="table recent-bookings-table">
            <div className="table-row table-head">
              <span>Booking</span>
              <span>Pickup</span>
              <span>Dropoff</span>
              <span>Time</span>
              <span>Status</span>
            </div>
            {bookings.length === 0 && !isLoadingBookings ? (
              <div className="table-row">
                <span className="muted">No recent bookings.</span>
                <span />
                <span />
                <span />
                <span />
              </div>
            ) : null}
            {bookings.map((booking) => {
              const bookingId = `BK-${booking._id.slice(-4).toUpperCase()}`
              const pickup = booking.pickup?.address ?? 'Unknown pickup'
              const dropoff = booking.dropoff?.address ?? 'Unknown dropoff'
              const label = booking.status ? statusLabels[booking.status] : 'Requested'
              const statusClass = label.toLowerCase().replace(' ', '-')
              const time = booking.createdAt
                ? new Date(booking.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--'

              return (
                <div
                  key={booking._id}
                  className="table-row clickable-row"
                  onClick={() => openBookingModal(booking)}
                >
                  <span className="mono">{bookingId}</span>
                  <span>{pickup}</span>
                  <span>{dropoff}</span>
                  <span>{time}</span>
                  <span className={`status ${statusClass}`}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="panel support-panel" data-animate data-delay="0">
        <div className="panel-header">
          <div>
            <h3>Support inbox</h3>
            <p>{isLoadingSupport ? 'Loading messages...' : 'Latest user messages'}</p>
          </div>
          <button className="ghost" type="button" onClick={loadSupport} disabled={isLoadingSupport}>
            {isLoadingSupport ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {supportError ? <p className="muted">Error: {supportError}</p> : null}
        <div className="support-list">
          {supportMessages.length === 0 && !isLoadingSupport ? (
            <div className="support-item support-empty">
              <div>
                <p className="support-message">No support requests yet.</p>
              </div>
            </div>
          ) : null}
          {supportMessages.map((item) => {
            const contact = resolveSupportUser(item)
            const statusKey = (item.status ?? 'open').replace('_', '-')
            const statusLabel =
              statusKey === 'in-progress'
                ? 'In progress'
                : statusKey.charAt(0).toUpperCase() + statusKey.slice(1)

            return (
              <div key={item._id} className="support-item">
                <div>
                  <div className="support-title">
                    <span>{item.subject ?? 'Support request'}</span>
                    <span className={`status ${statusKey}`}>{statusLabel}</span>
                  </div>
                  <p className="support-message">{item.message ?? 'No message provided.'}</p>
                  <div className="support-meta">
                    <span>{contact?.name ?? 'Unknown user'}</span>
                    {contact?.email ? <span>{contact.email}</span> : null}
                    {contact?.phone ? <span>{contact.phone}</span> : null}
                  </div>
                </div>
                <div className="support-time">{formatSupportTime(item.createdAt)}</div>
              </div>
            )
          })}
        </div>
      </section>

      {selectedBooking ? (
        <div className="modal-backdrop" onClick={closeBookingModal}>
          <div className="modal trip-details-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Booking details</h3>
                <p className="muted">Recent booking information from dashboard.</p>
              </div>
              <span className="tag">Booking {selectedBooking._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="detail-hero">
              <div className="detail-hero-media">BK</div>
              <div>
                <h4>{selectedBooking.pickup?.address ?? 'Unknown pickup'}</h4>
                <p className="muted">{selectedBooking.dropoff?.address ?? 'Unknown dropoff'}</p>
              </div>
            </div>
            <div className="modal-body detail-grid">
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">PU</span>Pickup</span>
                <strong>{selectedBooking.pickup?.address ?? 'Unknown pickup'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">DO</span>Dropoff</span>
                <strong>{selectedBooking.dropoff?.address ?? 'Unknown dropoff'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">ST</span>Status</span>
                <strong>{selectedBooking.status ? statusLabels[selectedBooking.status] : 'Requested'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">TM</span>Time</span>
                <strong>
                  {selectedBooking.createdAt
                    ? new Date(selectedBooking.createdAt).toLocaleString()
                    : '--'}
                </strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">AM</span>Fare</span>
                <strong>
                  {typeof selectedBooking.fare === 'number'
                    ? `Rs. ${selectedBooking.fare.toFixed(2)}`
                    : 'N/A'}
                </strong>
              </div>
            </div>
            {isEditingBooking ? (
              <div className="modal-body form-grid">
                <label className="field">
                  <span>Update status</span>
                  <select
                    value={bookingStatus}
                    onChange={(event) => setBookingStatus(event.target.value)}
                  >
                    <option value="accepted">Accepted</option>
                    <option value="enroute">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
              </div>
            ) : null}
            <div className="modal-actions">
              <button className="ghost" type="button" onClick={closeBookingModal}>
                Close
              </button>
              {isEditingBooking ? (
                <button
                  className="primary"
                  type="button"
                  onClick={saveBookingStatus}
                  disabled={isUpdatingBooking}
                >
                  {isUpdatingBooking ? 'Saving...' : 'Save changes'}
                </button>
              ) : (
                <button className="primary" type="button" onClick={() => setIsEditingBooking(true)}>
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

export default DashboardPage


