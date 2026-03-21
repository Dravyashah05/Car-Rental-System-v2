import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { apiFetch } from '../services/api'
import '../styles/UsersPage.css'

type User = {
  _id: string
  name?: string
  email?: string
  phone?: string
  avatar?: string
  role?: 'user' | 'driver' | 'admin'
  createdAt?: string
}

const formatDate = (value?: string) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function UsersPage() {
  const location = useLocation()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formState, setFormState] = useState({ name: '', email: '', phone: '' })

  const loadUsers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await apiFetch<User[]>('/api/users')
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return (params.get('q') ?? '').trim().toLowerCase()
  }, [location.search])

  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter((user) => user.role === 'admin').length
    const drivers = users.filter((user) => user.role === 'driver').length
    const riders = users.filter((user) => user.role === 'user').length
    return { total, admins, drivers, riders }
  }, [users])

  const handleRoleChange = async (userId: string, nextRole: User['role']) => {
    if (!nextRole) return
    setUpdatingId(userId)
    try {
      const updated = await apiFetch<User>(`/api/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nextRole }),
      })
      setUsers((prev) => prev.map((user) => (user._id === userId ? updated : user)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update user role')
    } finally {
      setUpdatingId(null)
    }
  }

  const startEdit = (user: User) => {
    setEditingUser(user)
    setFormState({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
    })
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setFormState({ name: '', email: '', phone: '' })
  }

  const handleSave = async () => {
    if (!editingUser) return
    setUpdatingId(editingUser._id)
    setError('')
    try {
      const updated = await apiFetch<User>(`/api/users/${editingUser._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
        }),
      })
      setUsers((prev) => prev.map((user) => (user._id === updated._id ? updated : user)))
      cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update user')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!editingUser) return
    if (!window.confirm('Are you sure you want to delete this user?')) return
    setUpdatingId(editingUser._id)
    setError('')
    try {
      await apiFetch(`/api/users/${editingUser._id}`, {
        method: 'DELETE',
      })
      setUsers((prev) => prev.filter((user) => user._id !== editingUser._id))
      cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete user')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users
    return users.filter((user) => {
      const haystack = [
        user.name,
        user.email,
        user.phone,
        user.role,
        user._id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(searchQuery)
    })
  }, [users, searchQuery])

  const visibleUsers = searchQuery ? filteredUsers : users

  return (
    <div className="page users-page">
      <section className="page-grid">
        <div className="info-card users-info-card" data-animate data-delay="0">
          <p>Total users</p>
          <h3>{stats.total}</h3>
          <span className="muted">All registered accounts</span>
        </div>
        <div className="info-card users-info-card" data-animate data-delay="90">
          <p>Admins</p>
          <h3>{stats.admins}</h3>
          <span className="muted">Platform operators</span>
        </div>
        <div className="info-card users-info-card" data-animate data-delay="180">
          <p>Drivers</p>
          <h3>{stats.drivers}</h3>
          <span className="muted">Verified partners</span>
        </div>
        <div className="info-card users-info-card" data-animate data-delay="270">
          <p>Customers</p>
          <h3>{stats.riders}</h3>
          <span className="muted">Customer accounts</span>
        </div>
      </section>

      <section className="panel" data-animate>
        <div className="panel-header">
          <div>
            <h3>User directory</h3>
            <p>View all accounts and update their access levels</p>
          </div>
          <button className="ghost" onClick={loadUsers} type="button">
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {error ? <p className="muted">{error}</p> : null}
        {isLoading ? (
          <p className="muted">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="muted">No users available yet.</p>
        ) : visibleUsers.length === 0 ? (
          <p className="muted">No users match your search.</p>
        ) : (
          <div className="table users-table">
            <div className="table-row table-head">
              <span>User</span>
              <span>Email</span>
              <span>Phone</span>
              <span>Joined</span>
              <span>Role</span>
            </div>
            {visibleUsers.map((user) => (
              <div
                key={user._id}
                className="table-row clickable-row"
                onClick={() => setSelectedUser(user)}
              >
                <span>{user.name ?? 'Unknown'}</span>
                <span>{user.email ?? 'N/A'}</span>
                <span>{user.phone ?? 'N/A'}</span>
                <span>{formatDate(user.createdAt)}</span>
                <span className="row">
                  <select
                    className="ghost"
                    value={user.role ?? 'user'}
                    onChange={(event) =>
                      handleRoleChange(user._id, event.target.value as User['role'])
                    }
                    onClick={(event) => event.stopPropagation()}
                    disabled={updatingId === user._id}
                  >
                    <option value="user">User</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    className="ghost small"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      startEdit(user)
                    }}
                  >
                    Edit
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedUser ? (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="modal users-edit-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>User details</h3>
                <p className="muted">Structured profile and access information.</p>
              </div>
              <span className="tag">User ID {selectedUser._id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="detail-hero">
              {selectedUser.avatar ? (
                <img className="detail-hero-media" src={selectedUser.avatar} alt={selectedUser.name ?? 'User'} />
              ) : (
                <div className="detail-hero-media">
                  {(selectedUser.name ?? selectedUser.email ?? 'U').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h4>{selectedUser.name ?? 'Unknown user'}</h4>
                <p className="muted">{selectedUser.email ?? 'No email'}</p>
              </div>
            </div>
            <div className="modal-body detail-grid">
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">NM</span>Name</span>
                <strong>{selectedUser.name ?? 'Unknown'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">@</span>Email</span>
                <strong>{selectedUser.email ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">PH</span>Phone</span>
                <strong>{selectedUser.phone ?? 'N/A'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">RL</span>Role</span>
                <strong>{selectedUser.role ?? 'user'}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label"><span className="detail-icon">DT</span>Joined</span>
                <strong>{formatDate(selectedUser.createdAt)}</strong>
              </div>
            </div>
            <div className="modal-actions">
              <button className="ghost" type="button" onClick={() => setSelectedUser(null)}>
                Close
              </button>
              <button
                className="primary"
                type="button"
                onClick={() => {
                  setSelectedUser(null)
                  startEdit(selectedUser)
                }}
              >
                Edit info
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingUser ? (
        <div className="modal-backdrop" onClick={cancelEdit}>
          <div className="modal users-edit-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Edit user</h3>
                <p className="muted">Update basic profile information.</p>
              </div>
              <span className="tag">User ID {editingUser._id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="modal-body form-grid">
              <label className="field">
                <span>Name</span>
                <input
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Full name"
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email address"
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  value={formState.phone}
                  onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Phone number"
                />
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="ghost"
                type="button"
                onClick={handleDeleteUser}
                style={{ color: '#ef4444', marginRight: 'auto' }}
                disabled={!!updatingId}
              >
                Delete
              </button>
              <button className="ghost" type="button" onClick={cancelEdit}>
                Cancel
              </button>
              <button className="primary" type="button" onClick={handleSave} disabled={!!updatingId}>
                {updatingId ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default UsersPage


