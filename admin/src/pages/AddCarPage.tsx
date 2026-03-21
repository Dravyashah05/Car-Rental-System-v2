import { useEffect, useState, type FormEvent } from 'react'
import { apiFetch } from '../services/api'

type Driver = {
  _id: string
  user?: { name?: string; email?: string }
  licenseNumber?: string
  isActive?: boolean
}

type Status = { type: 'success' | 'error' | 'info'; message: string }

type VehicleResponse = {
  _id: string
}

type Vehicle = {
  _id: string
  make?: string
  model?: string
  plateNumber?: string
  color?: string
  seats?: number
  imageUrl?: string
  driver?: { _id?: string; user?: { name?: string; email?: string } }
}

const seatOptions = [2, 4, 6]

function AddCarPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [editVehicleForm, setEditVehicleForm] = useState({
    make: '',
    model: '',
    plateNumber: '',
    color: '',
    seats: 4,
    imageUrl: '',
    driverId: '',
  })

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
  const [color, setColor] = useState('')
  const [seats, setSeats] = useState(4)
  const [driverId, setDriverId] = useState('')
  const [category, setCategory] = useState('')
  const [fuelType, setFuelType] = useState('')
  const [depot, setDepot] = useState('')
  const [notes, setNotes] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const loadDrivers = async () => {
    setIsLoadingDrivers(true)
    try {
      const data = await apiFetch<Driver[]>('/api/owners')
      setDrivers(data)
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load owners',
      })
    } finally {
      setIsLoadingDrivers(false)
    }
  }

  const loadVehicles = async () => {
    setIsLoadingVehicles(true)
    try {
      const data = await apiFetch<Vehicle[]>('/api/vehicles')
      setVehicles(data)
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load vehicles',
      })
    } finally {
      setIsLoadingVehicles(false)
    }
  }

  useEffect(() => {
    loadDrivers()
    loadVehicles()
  }, [])

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    if (!driverId) {
      setStatus({ type: 'error', message: 'Please select an owner before saving.' })
      return
    }

    setIsSubmitting(true)
    try {
      await apiFetch<VehicleResponse>('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          ownerId: driverId,
          make,
          model,
          plateNumber,
          color,
          seats,
          imageUrl: imageUrl.trim() || undefined,
        }),
      })

      setStatus({ type: 'success', message: 'Vehicle added to fleet successfully.' })
      setMake('')
      setModel('')
      setPlateNumber('')
      setColor('')
      setSeats(4)
      setDriverId('')
      setCategory('')
      setFuelType('')
      setDepot('')
      setNotes('')
      setImageUrl('')
      setIsAddVehicleOpen(false)
      await loadVehicles()
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to add vehicle',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setEditVehicleForm({
      make: vehicle.make ?? '',
      model: vehicle.model ?? '',
      plateNumber: vehicle.plateNumber ?? '',
      color: vehicle.color ?? '',
      seats: vehicle.seats ?? 4,
      imageUrl: vehicle.imageUrl ?? '',
      driverId: vehicle.driver?._id ?? '',
    })
  }

  const closeEditVehicle = () => {
    setEditingVehicle(null)
    setEditVehicleForm({
      make: '',
      model: '',
      plateNumber: '',
      color: '',
      seats: 4,
      imageUrl: '',
      driverId: '',
    })
  }

  const submitEditVehicle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingVehicle) return
    setStatus(null)
    setIsSubmitting(true)
    try {
      await apiFetch(`/api/vehicles/${editingVehicle._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          make: editVehicleForm.make,
          model: editVehicleForm.model,
          plateNumber: editVehicleForm.plateNumber,
          color: editVehicleForm.color,
          seats: editVehicleForm.seats,
          imageUrl: editVehicleForm.imageUrl.trim() || undefined,
          ownerId: editVehicleForm.driverId || undefined,
        }),
      })
      setStatus({ type: 'success', message: 'Vehicle updated successfully.' })
      closeEditVehicle()
      await loadVehicles()
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update vehicle',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteVehicle = async () => {
    if (!editingVehicle) return
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return
    setStatus(null)
    setIsSubmitting(true)
    try {
      await apiFetch(`/api/vehicles/${editingVehicle._id}`, {
        method: 'DELETE',
      })
      setStatus({ type: 'success', message: 'Vehicle deleted successfully.' })
      closeEditVehicle()
      await loadVehicles()
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete vehicle',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page">
      <section className="panel" data-animate>
        <div className="panel-header">
          <div>
            <h3>Fleet vehicles</h3>
            <p>Latest vehicles registered in the system</p>
          </div>
          <div className="row">
            <button
              className="primary"
              type="button"
              onClick={() => {
                setStatus(null)
                setIsAddVehicleOpen(true)
              }}
            >
              Add vehicle
            </button>
            <button className="ghost" type="button" onClick={loadVehicles}>
              {isLoadingVehicles ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        {status ? (
          <p className="muted">
            {status.type === 'error' ? `Error: ${status.message}` : status.message}
          </p>
        ) : null}
        <div className="table">
          <div className="table-row table-head">
            <span>Image</span>
            <span>Vehicle</span>
            <span>Plate</span>
            <span>Owner</span>
            <span>Seats</span>
          </div>
          {vehicles.length === 0 && !isLoadingVehicles ? (
            <div className="table-row">
              <span className="muted">No vehicles yet.</span>
              <span />
              <span />
              <span />
              <span />
            </div>
          ) : null}
          {vehicles.map((vehicle) => {
            const driverLabel =
              vehicle.driver?.user?.name || vehicle.driver?.user?.email || 'Unassigned'
            const vehicleLabel = `${vehicle.make ?? ''} ${vehicle.model ?? ''}`.trim()
            return (
              <div
                key={vehicle._id}
                className="table-row clickable-row"
                onClick={() => setSelectedVehicle(vehicle)}
              >
                {vehicle.imageUrl ? (
                  <img
                    src={vehicle.imageUrl}
                    alt={vehicleLabel || 'Vehicle'}
                    style={{
                      width: 72,
                      height: 44,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                    }}
                  />
                ) : (
                  <span className="muted">No image</span>
                )}
                <span>{vehicleLabel || 'Unknown model'}</span>
                <span className="mono">{vehicle.plateNumber || 'N/A'}</span>
                <span>{driverLabel}</span>
                <span>{vehicle.seats ?? 'N/A'}</span>
              </div>
            )
          })}
        </div>
      </section>

      {isAddVehicleOpen ? (
        <div className="modal-backdrop" onClick={() => setIsAddVehicleOpen(false)}>
          <div className="modal add-vehicle-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Register new vehicle</h3>
                <p className="muted">Fill in specs to add the car to the fleet</p>
              </div>
              <button
                className="ghost small"
                type="button"
                onClick={() => setIsAddVehicleOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="form-banner">
              <div>
                <h4>Vehicle details</h4>
                <p className="muted">Use the registration number to avoid duplicates in the fleet.</p>
              </div>
              <button className="ghost" type="button">
                Scan RC
              </button>
            </div>

            <form className="modal-body form-grid" onSubmit={submitForm}>
              <label className="field span-2">
                <span>Car photo URL</span>
                <input
                  placeholder="https://example.com/car.jpg"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Make</span>
                <input
                  placeholder="e.g. Toyota"
                  value={make}
                  onChange={(event) => setMake(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Model</span>
                <input
                  placeholder="e.g. Camry"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Registration number</span>
                <input
                  placeholder="KA-01-AB-1234"
                  value={plateNumber}
                  onChange={(event) => setPlateNumber(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Color</span>
                <input
                  placeholder="e.g. Midnight Blue"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Category</span>
                <input
                  placeholder="City Mini / EV Premium"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Fuel type</span>
                <select value={fuelType} onChange={(event) => setFuelType(event.target.value)}>
                  <option value="">Select fuel type</option>
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>CNG</option>
                  <option>Hybrid</option>
                  <option>EV</option>
                </select>
              </label>
              <label className="field">
                <span>Seating capacity</span>
                <div className="segment">
                  {seatOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`segment-item ${seats === value ? 'active' : ''}`}
                      onClick={() => setSeats(value)}
                    >
                      {value} seater
                    </button>
                  ))}
                </div>
              </label>
              <label className="field">
                <span>Assigned owner</span>
                <select value={driverId} onChange={(event) => setDriverId(event.target.value)} required>
                  <option value="" disabled>
                    {isLoadingDrivers ? 'Loading owners...' : 'Select owner'}
                  </option>
                  {drivers.map((driver) => {
                    const label =
                      driver.user?.name || driver.user?.email || `Owner ${driver._id.slice(-6)}`
                    return (
                      <option key={driver._id} value={driver._id}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              </label>
              <label className="field">
                <span>Assigned depot</span>
                <input
                  placeholder="Central Hub"
                  value={depot}
                  onChange={(event) => setDepot(event.target.value)}
                />
              </label>
              <label className="field full-row">
                <span>Notes (optional)</span>
                <textarea
                  placeholder="Add any special instructions or condition notes."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
              {status ? (
                <p className="muted">
                  {status.type === 'error' ? `Error: ${status.message}` : status.message}
                </p>
              ) : null}
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={() => setIsAddVehicleOpen(false)}>
                  Cancel
                </button>
                <button className="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Add vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedVehicle ? (
        <div className="modal-backdrop" onClick={() => setSelectedVehicle(null)}>
          <div className="modal add-vehicle-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Vehicle details</h3>
                <p className="muted">Structured vehicle and assignment information.</p>
              </div>
              <span className="tag">Vehicle ID {selectedVehicle._id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="detail-hero">
              {selectedVehicle.imageUrl ? (
                <img
                  className="detail-hero-media"
                  src={selectedVehicle.imageUrl}
                  alt={`${selectedVehicle.make ?? ''} ${selectedVehicle.model ?? ''}`.trim() || 'Vehicle'}
                />
              ) : (
                <div className="detail-hero-media">VH</div>
              )}
              <div>
                <h4>{`${selectedVehicle.make ?? ''} ${selectedVehicle.model ?? ''}`.trim() || 'Unknown vehicle'}</h4>
                <p className="muted">{selectedVehicle.plateNumber ?? 'No registration number'}</p>
              </div>
            </div>
            <div className="modal-body detail-grid">
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">MK</span>Make</span>
                <strong>{selectedVehicle.make ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">MD</span>Model</span>
                <strong>{selectedVehicle.model ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">PL</span>Plate number</span>
                <strong>{selectedVehicle.plateNumber ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">CL</span>Color</span>
                <strong>{selectedVehicle.color ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">ST</span>Seats</span>
                <strong>{selectedVehicle.seats ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">OW</span>Assigned owner</span>
                <strong>
                  {selectedVehicle.driver?.user?.name ||
                    selectedVehicle.driver?.user?.email ||
                    'Unassigned'}
                </strong>
              </div>
            </div>
            <div className="modal-actions">
              <button className="ghost" type="button" onClick={() => setSelectedVehicle(null)}>
                Close
              </button>
              <button
                className="primary"
                type="button"
                onClick={() => {
                  setSelectedVehicle(null)
                  openEditVehicle(selectedVehicle)
                }}
              >
                Edit info
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingVehicle ? (
        <div className="modal-backdrop" onClick={closeEditVehicle}>
          <div className="modal add-vehicle-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Edit vehicle info</h3>
                <p className="muted">Update vehicle and assignment details.</p>
              </div>
              <span className="tag">Vehicle ID {editingVehicle._id.slice(-6).toUpperCase()}</span>
            </div>
            <form className="modal-body form-grid" onSubmit={submitEditVehicle}>
              <label className="field">
                <span>Car photo URL</span>
                <input
                  value={editVehicleForm.imageUrl}
                  onChange={(event) =>
                    setEditVehicleForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                  }
                  placeholder="https://example.com/car.jpg"
                />
              </label>
              <label className="field">
                <span>Make</span>
                <input
                  value={editVehicleForm.make}
                  onChange={(event) =>
                    setEditVehicleForm((prev) => ({ ...prev, make: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Model</span>
                <input
                  value={editVehicleForm.model}
                  onChange={(event) =>
                    setEditVehicleForm((prev) => ({ ...prev, model: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Registration number</span>
                <input
                  value={editVehicleForm.plateNumber}
                  onChange={(event) =>
                    setEditVehicleForm((prev) => ({ ...prev, plateNumber: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Color</span>
                <input
                  value={editVehicleForm.color}
                  onChange={(event) =>
                    setEditVehicleForm((prev) => ({ ...prev, color: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Seating capacity</span>
                <div className="segment">
                  {seatOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`segment-item ${editVehicleForm.seats === value ? 'active' : ''}`}
                      onClick={() => setEditVehicleForm((prev) => ({ ...prev, seats: value }))}
                    >
                      {value} seater
                    </button>
                  ))}
                </div>
              </label>
              <label className="field">
                <span>Assigned owner</span>
                <select
                  value={editVehicleForm.driverId}
                  onChange={(event) =>
                    setEditVehicleForm((prev) => ({ ...prev, driverId: event.target.value }))
                  }
                >
                  <option value="">Unassigned</option>
                  {drivers.map((driver) => {
                    const label =
                      driver.user?.name || driver.user?.email || `Owner ${driver._id.slice(-6)}`
                    return (
                      <option key={driver._id} value={driver._id}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              </label>
              <div className="modal-actions">
                <button
                  className="ghost"
                  type="button"
                  onClick={handleDeleteVehicle}
                  style={{ color: '#ef4444', marginRight: 'auto' }}
                  disabled={isSubmitting}
                >
                  Delete
                </button>
                <button className="ghost" type="button" onClick={closeEditVehicle}>
                  Cancel
                </button>
                <button className="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AddCarPage
