import { useEffect, useState } from 'react'
import { apiFetch } from '../services/api'

type ProfileUser = {
  id: string
  name?: string
  email?: string
  phone?: string
  avatar?: string
  age?: number
  gender?: string
  role?: string
}

type ProfilePageProps = {
  onLogout: () => void
}

function ProfilePage({ onLogout }: ProfilePageProps) {
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    age: '',
    gender: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [status, setStatus] = useState('')

  const loadProfile = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ user: ProfileUser }>('/api/auth/profile')
      setUser(data.user)
      setProfileForm({
        name: data.user.name ?? '',
        email: data.user.email ?? '',
        phone: data.user.phone ?? '',
        avatar: data.user.avatar ?? '',
        age: data.user.age !== undefined ? String(data.user.age) : '',
        gender: data.user.gender ?? '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleProfileSave = async () => {
    setStatus('')
    try {
      const payload = {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        avatar: profileForm.avatar,
        age: profileForm.age ? Number(profileForm.age) : undefined,
        gender: profileForm.gender || undefined,
      }
      const data = await apiFetch<{ user: ProfileUser }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      setUser(data.user)
      setIsEditOpen(false)
      setStatus('Profile updated successfully')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Unable to update profile')
    }
  }

  const handlePasswordSave = async () => {
    setStatus('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatus('New password and confirmation do not match')
      return
    }
    try {
      await apiFetch('/api/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsPasswordOpen(false)
      setStatus('Password updated successfully')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Unable to update password')
    }
  }

  return (
    <div className="page">
      <section className="page-grid">
        <div className="info-card" data-animate data-delay="0">
          <p>Name</p>
          <h3>{user?.name ?? 'Admin user'}</h3>
          <span className="muted">Profile owner</span>
        </div>
        <div className="info-card" data-animate data-delay="90">
          <p>Role</p>
          <h3>{user?.role ?? 'Admin'}</h3>
          <span className="muted">Access level</span>
        </div>
        <div className="info-card" data-animate data-delay="180">
          <p>Email</p>
          <h3>{user?.email ?? 'admin@cityride.com'}</h3>
          <span className="muted">Primary contact</span>
        </div>
      </section>

      <section className="panel" data-animate>
        <div className="panel-header">
          <div>
            <h3>Profile</h3>
            <p>Manage your admin account and security settings.</p>
          </div>
          <div className="row">
            <button className="ghost" type="button" onClick={() => setIsEditOpen(true)}>
              Edit info
            </button>
            <button className="ghost" type="button" onClick={() => setIsPasswordOpen(true)}>
              Change password
            </button>
          </div>
        </div>

        {isLoading ? <p className="muted">Loading profile...</p> : null}
        {error ? <p className="muted">{error}</p> : null}
        {status ? <p className="muted">{status}</p> : null}

        <div className="stack">
          <div className="row-card" data-animate data-delay="0">
            <div>
              <p className="row-title">Contact details</p>
              <span className="muted">{user?.phone ?? 'No phone set'}</span>
            </div>
            <span className="pill">{user?.gender ?? 'Not specified'}</span>
            <button className="ghost" type="button" onClick={() => setIsEditOpen(true)}>
              Update details
            </button>
          </div>

          <div className="row-card" data-animate data-delay="90">
            <div>
              <p className="row-title">Security</p>
              <span className="muted">Keep your account secure.</span>
            </div>
            <span className="pill warning">Sensitive</span>
            <button className="ghost" type="button" onClick={() => setIsPasswordOpen(true)}>
              Change password
            </button>
          </div>

          <div className="row-card" data-animate data-delay="180">
            <div>
              <p className="row-title">Session</p>
              <span className="muted">Signed in on this device</span>
            </div>
            <span className="pill success">Active</span>
            <button className="primary" type="button" onClick={onLogout}>
              Log out
            </button>
          </div>
        </div>
      </section>

      {isEditOpen ? (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>Edit profile</h3>
                <p className="muted">Update your account information.</p>
              </div>
              <button className="ghost small" type="button" onClick={() => setIsEditOpen(false)}>
                Close
              </button>
            </div>
            <div className="modal-body form-grid">
              <label className="field">
                <span>Name</span>
                <input
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Avatar URL</span>
                <input
                  value={profileForm.avatar}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, avatar: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Age</span>
                <input
                  type="number"
                  min="0"
                  value={profileForm.age}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, age: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Gender</span>
                <select
                  value={profileForm.gender}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, gender: event.target.value }))
                  }
                >
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button className="ghost" type="button" onClick={() => setIsEditOpen(false)}>
                Cancel
              </button>
              <button className="primary" type="button" onClick={handleProfileSave}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isPasswordOpen ? (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>Change password</h3>
                <p className="muted">Choose a strong password you can remember.</p>
              </div>
              <button
                className="ghost small"
                type="button"
                onClick={() => setIsPasswordOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="modal-body form-grid">
              <label className="field">
                <span>Current password</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>New password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="modal-actions">
              <button className="ghost" type="button" onClick={() => setIsPasswordOpen(false)}>
                Cancel
              </button>
              <button className="primary" type="button" onClick={handlePasswordSave}>
                Update password
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ProfilePage
