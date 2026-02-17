import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { apiFetch } from '../services/api'

type Driver = {
  _id: string
  licenseNumber?: string
  isActive?: boolean
  rating?: number
  user?: {
    _id?: string
    name?: string
    email?: string
    phone?: string
    avatar?: string
    age?: number
    gender?: string
    createdAt?: string
  }
}

type Status = { type: 'success' | 'error' | 'info'; message: string }

const formatDate = (value?: string) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getInitials = (name?: string, email?: string) => {
  const source = name?.trim() || email?.trim() || 'Driver'
  const words = source
    .replace(/[@._-]/g, ' ')
    .split(' ')
    .filter(Boolean)

  if (words.length === 0) return 'DR'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

const readAvatarFile = (
  event: ChangeEvent<HTMLInputElement>,
  onLoad: (value: string) => void,
  onError: (message: string) => void,
) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    onError('Avatar image must be less than 2MB.')
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      onLoad(reader.result)
    }
  }
  reader.readAsDataURL(file)
}

function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [avatar, setAvatar] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editLicenseNumber, setEditLicenseNumber] = useState('')
  const [editGender, setEditGender] = useState('')
  const [editAge, setEditAge] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)

  const resetAddForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setLicenseNumber('')
    setGender('')
    setAge('')
    setAvatar('')
    setIsActive(true)
  }

  const closeEditModal = () => {
    setEditingDriver(null)
    setEditName('')
    setEditEmail('')
    setEditPhone('')
    setEditLicenseNumber('')
    setEditGender('')
    setEditAge('')
    setEditAvatar('')
    setEditIsActive(true)
  }

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver)
    setEditName(driver.user?.name ?? '')
    setEditEmail(driver.user?.email ?? '')
    setEditPhone(driver.user?.phone ?? '')
    setEditLicenseNumber(driver.licenseNumber ?? '')
    setEditGender(driver.user?.gender ?? '')
    setEditAge(driver.user?.age !== undefined ? String(driver.user.age) : '')
    setEditAvatar(driver.user?.avatar ?? '')
    setEditIsActive(Boolean(driver.isActive))
  }

  const loadDrivers = async () => {
    setIsLoading(true)
    try {
      const data = await apiFetch<Driver[]>('/api/drivers')
      setDrivers(data)
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load drivers',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDrivers()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    if (!name || !email || !password || !licenseNumber) {
      setStatus({ type: 'error', message: 'Name, email, password, and license are required.' })
      return
    }

    setIsSubmitting(true)
    try {
      await apiFetch<Driver>('/api/drivers/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
          licenseNumber,
          avatar: avatar || undefined,
          age: age ? Number(age) : undefined,
          gender: gender || undefined,
          isActive,
        }),
      })
      setStatus({ type: 'success', message: 'Driver added successfully.' })
      resetAddForm()
      setIsAddDriverOpen(false)
      await loadDrivers()
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to add driver',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingDriver) return

    const userId = editingDriver.user?._id
    if (!userId) {
      setStatus({ type: 'error', message: 'Driver account is missing linked user record.' })
      return
    }

    if (!editName || !editEmail || !editLicenseNumber) {
      setStatus({ type: 'error', message: 'Name, email, and license are required.' })
      return
    }

    setStatus(null)
    setIsEditSubmitting(true)
    try {
      await Promise.all([
        apiFetch(`/api/users/${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: editName,
            email: editEmail,
            phone: editPhone || undefined,
            avatar: editAvatar || undefined,
            age: editAge ? Number(editAge) : null,
            gender: editGender || null,
          }),
        }),
        apiFetch(`/api/drivers/${editingDriver._id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            licenseNumber: editLicenseNumber,
            isActive: editIsActive,
          }),
        }),
      ])

      setStatus({ type: 'success', message: 'Driver information updated successfully.' })
      closeEditModal()
      await loadDrivers()
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update driver info',
      })
    } finally {
      setIsEditSubmitting(false)
    }
  }

  return (
    <div className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Driver roster</h3>
            <p>Availability, profile details, and compliance</p>
          </div>
          <div className="row">
            <button
              className="primary"
              type="button"
              onClick={() => {
                setStatus(null)
                setIsAddDriverOpen(true)
              }}
            >
              Add driver
            </button>
            <button className="ghost" type="button" onClick={loadDrivers}>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        {status ? (
          <p className="muted">
            {status.type === 'error' ? `Error: ${status.message}` : status.message}
          </p>
        ) : null}
        <div className="stack">
          {drivers.length === 0 && !isLoading ? <p className="muted">No drivers yet.</p> : null}
          {drivers.map((driver) => {
            const label = driver.user?.name || driver.user?.email || `Driver ${driver._id.slice(-6)}`
            const driverInitials = getInitials(driver.user?.name, driver.user?.email)
            return (
              <div
                key={driver._id}
                className="row-card clickable-row"
                onClick={() => setSelectedDriver(driver)}
              >
                <div>
                  <div className="driver-row-head">
                    {driver.user?.avatar ? (
                      <img className="driver-avatar" src={driver.user.avatar} alt={label} />
                    ) : (
                      <div className="driver-avatar driver-avatar-fallback">{driverInitials}</div>
                    )}
                    <div>
                      <p className="row-title">{label}</p>
                      <span className="muted">{driver.user?.email || 'No email'}</span>
                    </div>
                  </div>
                  <div className="driver-meta-row">
                    <span className="muted">License: {driver.licenseNumber || 'N/A'}</span>
                    <span className="muted">Phone: {driver.user?.phone || 'N/A'}</span>
                    <span className="muted">Joined: {formatDate(driver.user?.createdAt)}</span>
                  </div>
                </div>
                <span className={`pill ${driver.isActive ? 'success' : 'warning'}`}>
                  {driver.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="driver-side-actions">
                  <div className="driver-side-meta">
                    <span className="muted">Rating: {driver.rating ?? 5}/5</span>
                    <span className="muted">
                      {driver.user?.gender ? `Gender: ${driver.user.gender}` : 'Gender: N/A'}
                    </span>
                  </div>
                  <button
                    className="ghost small"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      openEditModal(driver)
                    }}
                  >
                    Edit info
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {isAddDriverOpen ? (
        <div className="modal-backdrop" onClick={() => setIsAddDriverOpen(false)}>
          <div className="modal add-driver-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Add new driver</h3>
                <p className="muted">Create driver profile, contact, and account credentials.</p>
              </div>
              <div className="tag">Driver intake</div>
            </div>

            <div className="form-banner">
              <div>
                <h4>Driver profile</h4>
                <p className="muted">Upload avatar and complete key information before onboarding.</p>
              </div>
              <span className={`pill ${isActive ? 'success' : 'warning'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <form className="modal-body form-grid" onSubmit={handleSubmit}>
              <label className="field full-row">
                <span>Avatar image</span>
                <div className="upload">
                  <input
                    id="driver-avatar"
                    className="upload-input"
                    type="file"
                    accept="image/*"
                    onChange={(event) => readAvatarFile(event, setAvatar, (message) => setStatus({ type: 'error', message }))}
                  />
                  <label htmlFor="driver-avatar" className="upload-card">
                    <div className="driver-upload-content">
                      {avatar ? (
                        <img
                          className="driver-avatar driver-avatar-large"
                          src={avatar}
                          alt="Driver avatar preview"
                        />
                      ) : (
                        <div className="driver-avatar driver-avatar-large driver-avatar-fallback">
                          {getInitials(name, email)}
                        </div>
                      )}
                      <div>
                        <p className="row-title">Upload driver avatar</p>
                        <p className="muted">PNG/JPG, max 2MB</p>
                      </div>
                    </div>
                    <span className="ghost small">Choose file</span>
                  </label>
                </div>
              </label>

              <label className="field">
                <span>Full name</span>
                <input
                  placeholder="e.g. Kiran Das"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  placeholder="driver@cityride.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  placeholder="+91XXXXXXXXXX"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Temporary password</span>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>License number</span>
                <input
                  placeholder="DL-0420112345678"
                  value={licenseNumber}
                  onChange={(event) => setLicenseNumber(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Gender</span>
                <select value={gender} onChange={(event) => setGender(event.target.value)}>
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="field">
                <span>Age</span>
                <input
                  type="number"
                  min="18"
                  max="80"
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(event) => setIsActive(event.target.value === 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              {status ? (
                <p className="muted">
                  {status.type === 'error' ? `Error: ${status.message}` : status.message}
                </p>
              ) : null}

              <div className="modal-actions">
                <button className="ghost" type="button" onClick={() => setIsAddDriverOpen(false)}>
                  Cancel
                </button>
                <button className="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Add driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedDriver ? (
        <div className="modal-backdrop" onClick={() => setSelectedDriver(null)}>
          <div className="modal add-driver-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Driver details</h3>
                <p className="muted">Complete profile and operational information.</p>
              </div>
              <span className="tag">Driver ID {selectedDriver._id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="detail-hero">
              {selectedDriver.user?.avatar ? (
                <img className="detail-hero-media" src={selectedDriver.user.avatar} alt={selectedDriver.user?.name ?? 'Driver'} />
              ) : (
                <div className="detail-hero-media">
                  {getInitials(selectedDriver.user?.name, selectedDriver.user?.email)}
                </div>
              )}
              <div>
                <h4>{selectedDriver.user?.name ?? 'Unknown driver'}</h4>
                <p className="muted">{selectedDriver.user?.email ?? 'No email'}</p>
              </div>
            </div>
            <div className="modal-body detail-grid">
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">NM</span>Name</span>
                <strong>{selectedDriver.user?.name ?? 'Unknown'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">@</span>Email</span>
                <strong>{selectedDriver.user?.email ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">PH</span>Phone</span>
                <strong>{selectedDriver.user?.phone ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">LC</span>License number</span>
                <strong>{selectedDriver.licenseNumber ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">ST</span>Status</span>
                <strong>{selectedDriver.isActive ? 'Active' : 'Inactive'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">RT</span>Rating</span>
                <strong>{selectedDriver.rating ?? 5}/5</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">GN</span>Gender</span>
                <strong>{selectedDriver.user?.gender ?? 'Not specified'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">AG</span>Age</span>
                <strong>{selectedDriver.user?.age ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">DT</span>Joined</span>
                <strong>{formatDate(selectedDriver.user?.createdAt)}</strong>
              </div>
            </div>
            <div className="modal-actions">
              <button className="ghost" type="button" onClick={() => setSelectedDriver(null)}>
                Close
              </button>
              <button
                className="primary"
                type="button"
                onClick={() => {
                  setSelectedDriver(null)
                  openEditModal(selectedDriver)
                }}
              >
                Edit info
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingDriver ? (
        <div className="modal-backdrop" onClick={closeEditModal}>
          <div className="modal add-driver-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Edit driver info</h3>
                <p className="muted">Update profile, contact, and status information.</p>
              </div>
              <span className="tag">Driver ID {editingDriver._id.slice(-6).toUpperCase()}</span>
            </div>

            <form className="modal-body form-grid" onSubmit={handleEditSubmit}>
              <label className="field full-row">
                <span>Avatar image</span>
                <div className="upload">
                  <input
                    id="driver-avatar-edit"
                    className="upload-input"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      readAvatarFile(event, setEditAvatar, (message) =>
                        setStatus({ type: 'error', message }),
                      )
                    }
                  />
                  <label htmlFor="driver-avatar-edit" className="upload-card">
                    <div className="driver-upload-content">
                      {editAvatar ? (
                        <img
                          className="driver-avatar driver-avatar-large"
                          src={editAvatar}
                          alt="Driver avatar preview"
                        />
                      ) : (
                        <div className="driver-avatar driver-avatar-large driver-avatar-fallback">
                          {getInitials(editName, editEmail)}
                        </div>
                      )}
                      <div>
                        <p className="row-title">Update driver avatar</p>
                        <p className="muted">PNG/JPG, max 2MB</p>
                      </div>
                    </div>
                    <span className="ghost small">Choose file</span>
                  </label>
                </div>
              </label>

              <label className="field">
                <span>Full name</span>
                <input value={editName} onChange={(event) => setEditName(event.target.value)} required />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input value={editPhone} onChange={(event) => setEditPhone(event.target.value)} />
              </label>
              <label className="field">
                <span>License number</span>
                <input
                  value={editLicenseNumber}
                  onChange={(event) => setEditLicenseNumber(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Gender</span>
                <select value={editGender} onChange={(event) => setEditGender(event.target.value)}>
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="field">
                <span>Age</span>
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={editAge}
                  onChange={(event) => setEditAge(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  value={editIsActive ? 'active' : 'inactive'}
                  onChange={(event) => setEditIsActive(event.target.value === 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <div className="modal-actions">
                <button className="ghost" type="button" onClick={closeEditModal}>
                  Cancel
                </button>
                <button className="primary" type="submit" disabled={isEditSubmitting}>
                  {isEditSubmitting ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DriversPage
