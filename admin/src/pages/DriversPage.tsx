import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
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
  const source = name?.trim() || email?.trim() || 'Owner'
  const words = source
    .replace(/[@._-]/g, ' ')
    .split(' ')
    .filter(Boolean)

  if (words.length === 0) return 'OW'
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

function OwnersPage() {
  const location = useLocation()
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
      const data = await apiFetch<Driver[]>('/api/owners')
      setDrivers(data)
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load owners',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDrivers()
  }, [])

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return (params.get('q') ?? '').trim().toLowerCase()
  }, [location.search])

  const filteredDrivers = useMemo(() => {
    if (!searchQuery) return drivers
    return drivers.filter((driver) => {
      const haystack = [
        driver.user?.name,
        driver.user?.email,
        driver.user?.phone,
        driver.licenseNumber,
        driver._id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(searchQuery)
    })
  }, [drivers, searchQuery])

  const visibleDrivers = searchQuery ? filteredDrivers : drivers

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    if (!name || !email || !password || !licenseNumber) {
      setStatus({ type: 'error', message: 'Name, email, password, and license are required.' })
      return
    }

    setIsSubmitting(true)
    try {
      await apiFetch<Driver>('/api/owners/register', {
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
      setStatus({ type: 'success', message: 'Owner added successfully.' })
      resetAddForm()
      setIsAddDriverOpen(false)
      await loadDrivers()
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to add owner',
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
      setStatus({ type: 'error', message: 'Owner account is missing linked user record.' })
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
        apiFetch(`/api/owners/${editingDriver._id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            licenseNumber: editLicenseNumber,
            isActive: editIsActive,
          }),
        }),
      ])

      setStatus({ type: 'success', message: 'Owner information updated successfully.' })
      closeEditModal()
      await loadDrivers()
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update owner info',
      })
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleDeleteDriver = async () => {
    if (!editingDriver) return
    if (!window.confirm('Are you sure you want to delete this owner?')) return
    setStatus(null)
    setIsEditSubmitting(true)
    try {
      await apiFetch(`/api/owners/${editingDriver._id}`, {
        method: 'DELETE',
      })

      setStatus({ type: 'success', message: 'Owner deleted successfully.' })
      closeEditModal()
      await loadDrivers()
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete owner',
      })
    } finally {
      setIsEditSubmitting(false)
    }
  }

  return (
    <div className="page">
      <section className="panel" data-animate>
        <div className="panel-header">
          <div>
            <h3>Owner roster</h3>
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
              Add owner
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
          {drivers.length === 0 && !isLoading ? <p className="muted">No owners yet.</p> : null}
          {drivers.length > 0 && visibleDrivers.length === 0 ? (
            <p className="muted">No owners match your search.</p>
          ) : null}
          {visibleDrivers.map((driver) => {
            const label = driver.user?.name || driver.user?.email || `Owner ${(driver._id || '').slice(-6)}`
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
                <h3>Add new owner</h3>
                <p className="muted">Create owner profile, contact, and account credentials.</p>
              </div>
              <div className="tag">Owner intake</div>
            </div>

            <div className="form-banner">
              <div>
                <h4>Owner profile</h4>
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
                          alt="Owner avatar preview"
                        />
                      ) : (
                        <div className="driver-avatar driver-avatar-large driver-avatar-fallback">
                          {getInitials(name, email)}
                        </div>
                      )}
                      <div>
                        <p className="row-title">Upload owner avatar</p>
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
                  placeholder="owner@carrental.com"
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
                  {isSubmitting ? 'Saving...' : 'Add owner'}
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
                <h3>Owner details</h3>
                <p className="muted">Complete profile and operational information.</p>
              </div>
              <span className="tag">Owner ID {(selectedDriver._id || '').slice(-6).toUpperCase()}</span>
            </div>
            <div className="detail-hero">
              {selectedDriver.user?.avatar ? (
                <img className="detail-hero-media" src={selectedDriver.user.avatar} alt={selectedDriver.user?.name ?? 'Owner'} />
              ) : (
                <div className="detail-hero-media">
                  {getInitials(selectedDriver.user?.name, selectedDriver.user?.email)}
                </div>
              )}
              <div>
                <h4>{selectedDriver.user?.name ?? 'Unknown owner'}</h4>
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
          <div className="modal add-driver-modal owner-edit-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Edit owner info</h3>
                <p className="muted">Update profile, contact, and status information.</p>
              </div>
              <span className="tag">Owner ID {(editingDriver._id || '').slice(-6).toUpperCase()}</span>
            </div>

            <div className="form-banner owner-edit-banner">
              <div>
                <h4>Owner snapshot</h4>
                <p className="muted">Confirm identity, compliance, and activity signals.</p>
              </div>
              <div className="owner-banner-meta">
                <span className={`pill ${editIsActive ? 'success' : 'warning'}`}>
                  {editIsActive ? 'Active' : 'Inactive'}
                </span>
                <span className="badge">Rating {editingDriver.rating ?? 5}/5</span>
              </div>
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
                          alt="Owner avatar preview"
                        />
                      ) : (
                        <div className="driver-avatar driver-avatar-large driver-avatar-fallback">
                          {getInitials(editName, editEmail)}
                        </div>
                      )}
                      <div>
                        <p className="row-title">Update owner avatar</p>
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
                <button
                  className="ghost danger-btn"
                  type="button"
                  onClick={handleDeleteDriver}
                  disabled={isEditSubmitting}
                >
                                 Delete owner
                </button>
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

export default OwnersPage
