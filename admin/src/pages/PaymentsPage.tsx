import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../services/api'

type RidePayment = {
  _id: string
  rider?: { name?: string; email?: string }
  pickup?: { address?: string }
  dropoff?: { address?: string }
  status?: string
  fare?: number
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

const formatDateTime = (value?: string) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  const dateText = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const timeText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${dateText} - ${timeText}`
}

const formatAmount = (value?: number) => {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return `Rs. ${amount.toFixed(2)}`
}

function PaymentsPage() {
  const [payments, setPayments] = useState<RidePayment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<RidePayment | null>(null)
  const [isEditingPayment, setIsEditingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('accepted')
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)

  useEffect(() => {
    let isActive = true
    const loadPayments = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await apiFetch<RidePayment[]>('/api/rides')
        if (isActive) {
          setPayments(data)
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Unable to load payments')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadPayments()
    return () => {
      isActive = false
    }
  }, [])

  const totals = useMemo(() => {
    const collected = payments
      .filter((payment) => payment.status === 'completed')
      .reduce((sum, payment) => sum + (payment.fare ?? 0), 0)
    const pending = payments
      .filter((payment) => payment.status !== 'completed' && payment.status !== 'cancelled')
      .reduce((sum, payment) => sum + (payment.fare ?? 0), 0)
    const cancelled = payments
      .filter((payment) => payment.status === 'cancelled')
      .reduce((sum, payment) => sum + (payment.fare ?? 0), 0)
    return { collected, pending, cancelled }
  }, [payments])

  const closePaymentModal = () => {
    setSelectedPayment(null)
    setIsEditingPayment(false)
    setPaymentStatus('accepted')
  }

  const openPaymentModal = (payment: RidePayment) => {
    setSelectedPayment(payment)
    const current = (payment.status ?? 'requested').toLowerCase()
    const editableStatuses = ['accepted', 'enroute', 'completed', 'cancelled']
    setPaymentStatus(editableStatuses.includes(current) ? current : 'accepted')
  }

  const savePaymentStatus = async () => {
    if (!selectedPayment) return
    setError('')
    setIsUpdatingPayment(true)
    try {
      const updated = await apiFetch<RidePayment>(`/api/rides/${selectedPayment._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: paymentStatus }),
      })
      setPayments((prev) =>
        prev.map((payment) => (payment._id === updated._id ? { ...payment, ...updated } : payment))
      )
      setSelectedPayment((prev) => (prev ? { ...prev, ...updated } : prev))
      setIsEditingPayment(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update payment status')
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  return (
    <div className="page">
      <section className="page-grid">
        <div className="info-card">
          <p>Total collected</p>
          <h3>{formatAmount(totals.collected)}</h3>
          <span className="muted">Completed rentals</span>
        </div>
        <div className="info-card">
          <p>Pending payouts</p>
          <h3>{formatAmount(totals.pending)}</h3>
          <span className="muted">Active & assigned rentals</span>
        </div>
        <div className="info-card">
          <p>Cancelled rentals</p>
          <h3>{formatAmount(totals.cancelled)}</h3>
          <span className="muted">Cancelled payments</span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>All payments</h3>
            <p>Every rental fare recorded in the system</p>
          </div>
          <button className="ghost" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
        {isLoading ? (
          <p className="muted">Loading payments...</p>
        ) : error ? (
          <p className="muted">{error}</p>
        ) : payments.length === 0 ? (
          <p className="muted">No payments available yet.</p>
        ) : (
          <div className="table">
            <div className="table-row table-head">
              <span>Booking</span>
              <span>Customer</span>
              <span>Route</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {payments.map((payment) => {
              const statusKey = (payment.status ?? 'requested').toLowerCase()
              const riderName = payment.rider?.name ?? payment.rider?.email ?? 'Unknown'
              const route = `${payment.pickup?.address ?? 'Unknown'} -> ${
                payment.dropoff?.address ?? 'Unknown'
              }`
              return (
                <div
                  key={payment._id}
                  className="table-row clickable-row"
                  onClick={() => openPaymentModal(payment)}
                >
                  <span className="mono">{payment._id.slice(-8).toUpperCase()}</span>
                  <span>{riderName}</span>
                  <span>
                    {route}
                    <span className="muted" style={{ display: 'block' }}>
                      {formatDateTime(payment.createdAt)}
                    </span>
                  </span>
                  <span>{formatAmount(payment.fare)}</span>
                  <span className={`status ${statusClassMap[statusKey] ?? 'requested'}`}>
                    {statusLabelMap[statusKey] ?? 'Requested'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {selectedPayment ? (
        <div className="modal-backdrop" onClick={closePaymentModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Payment details</h3>
                <p className="muted">Fare, route, customer, and settlement status.</p>
              </div>
              <span className="tag">Booking {selectedPayment._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="detail-hero">
              <div className="detail-hero-media">PY</div>
              <div>
                <h4>{selectedPayment.rider?.name ?? 'Unknown customer'}</h4>
                <p className="muted">{selectedPayment.rider?.email ?? 'No email'}</p>
              </div>
            </div>
            <div className="modal-body detail-grid">
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">RD</span>Customer</span>
                <strong>{selectedPayment.rider?.name ?? selectedPayment.rider?.email ?? 'Unknown'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">@</span>Email</span>
                <strong>{selectedPayment.rider?.email ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">PU</span>Pickup</span>
                <strong>{selectedPayment.pickup?.address ?? 'Unknown'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">DO</span>Dropoff</span>
                <strong>{selectedPayment.dropoff?.address ?? 'Unknown'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">AM</span>Amount</span>
                <strong>{formatAmount(selectedPayment.fare)}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">ST</span>Status</span>
                <strong>
                  {statusLabelMap[(selectedPayment.status ?? 'requested').toLowerCase()] ?? 'Requested'}
                </strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">DT</span>Created</span>
                <strong>{formatDateTime(selectedPayment.createdAt)}</strong>
              </div>
            </div>
            {isEditingPayment ? (
              <div className="modal-body form-grid">
                <label className="field">
                  <span>Update status</span>
                  <select
                    value={paymentStatus}
                    onChange={(event) => setPaymentStatus(event.target.value)}
                  >
                    <option value="accepted">Accepted</option>
                    <option value="enroute">En route</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
              </div>
            ) : null}
            <div className="modal-actions">
              <button className="ghost" type="button" onClick={closePaymentModal}>
                Close
              </button>
              {isEditingPayment ? (
                <button
                  className="primary"
                  type="button"
                  onClick={savePaymentStatus}
                  disabled={isUpdatingPayment}
                >
                  {isUpdatingPayment ? 'Saving...' : 'Save changes'}
                </button>
              ) : (
                <button className="primary" type="button" onClick={() => setIsEditingPayment(true)}>
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

export default PaymentsPage


