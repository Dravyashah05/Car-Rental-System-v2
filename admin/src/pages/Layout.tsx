import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { apiFetch } from '../services/api'

const pageMeta: Record<
  string,
  { title: string; subtitle?: string }
> = {
  '/dashboard': {
    title: "Today's Operations Overview",
    subtitle: 'Track demand, assignments, and fleet readiness in real time.',
  },
  '/bookings': {
    title: 'Bookings Center',
    subtitle: 'Review, assign, and manage ride bookings.',
  },
  '/drivers': {
    title: 'Driver Operations',
    subtitle: 'Track availability, compliance, and performance.',
  },
  '/add-car': {
    title: 'Add Car',
    subtitle: 'Register new vehicles and assign categories.',
  },
  '/payments': {
    title: 'Payments & Settlements',
    subtitle: 'Monitor payouts, refunds, and revenue trends.',
  },
  '/users': {
    title: 'User Management',
    subtitle: 'Review accounts and update access roles.',
  },
  '/profile': {
    title: 'Admin Profile',
    subtitle: 'Manage your access, preferences, and security.',
  },
}

type CurrentUser = {
  name?: string
  email?: string
  role?: string
}

const getInitials = (name?: string, email?: string) => {
  const source = name?.trim() || email?.trim() || 'Admin'
  const words = source
    .replace(/[@._-]/g, ' ')
    .split(' ')
    .filter(Boolean)

  if (words.length === 0) return 'AD'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

function Layout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation()
  const today = useMemo(() => new Date(), [])
  const meta = pageMeta[location.pathname] ?? pageMeta['/dashboard']
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    if (!isSidebarOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSidebarOpen])

  useEffect(() => {
    let isMounted = true

    const loadCurrentUser = async () => {
      try {
        const data = await apiFetch<{ user: CurrentUser }>('/api/auth/profile')
        if (isMounted) {
          setCurrentUser(data.user ?? null)
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null)
        }
      }
    }

    loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])

  const displayName = currentUser?.name || currentUser?.email || 'Admin user'
  const displayRole = currentUser?.role ? currentUser.role[0].toUpperCase() + currentUser.role.slice(1) : 'Administrator'
  const userInitials = getInitials(currentUser?.name, currentUser?.email)

  return (
    <div className="app">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">CR</div>
            <div>
              <p className="brand-title">CityRide Admin</p>
              <p className="brand-subtitle">Car Rental System</p>
            </div>
          </div>
          <button
            className="sidebar-close"
            type="button"
            aria-label="Close sidebar"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span />
            <span />
          </button>
        </div>
        <nav className="nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="nav-icon">D</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/bookings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="nav-icon">B</span>
            <span>Bookings</span>
          </NavLink>
          <NavLink
            to="/drivers"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="nav-icon">R</span>
            <span>Drivers</span>
          </NavLink>
          <NavLink
            to="/add-car"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="nav-icon">A</span>
            <span>Add Car</span>
          </NavLink>
          <NavLink
            to="/payments"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="nav-icon">P</span>
            <span>Payments</span>
          </NavLink>
          <NavLink
            to="/users"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="nav-icon">U</span>
            <span>Users</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="nav-icon">S</span>
            <span>Profile</span>
          </NavLink>
        </nav>
        <div className="nav-footer">
          <div className="nav-footer-meta">
            <div className="nav-avatar">{userInitials}</div>
            <div>
              <p className="nav-user">{displayName}</p>
              <p className="nav-role">{displayRole}</p>
            </div>
          </div>
          <button className="ghost nav-cta" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="sidebar-toggle"
              type="button"
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
            <div className="topbar-heading">
              <h1>{meta.title}</h1>
              {meta.subtitle ? <p className="page-subtitle">{meta.subtitle}</p> : null}
            </div>
          </div>
          <div className="topbar-actions">
            <div className="search">
              <input placeholder="Rider, booking, or vehicle" />
            </div>
            <div className="topbar-date">
              {today.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <button className="ghost topbar-btn" onClick={onLogout}>
              Log out
            </button>
            <div className="avatar">{userInitials}</div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}

export default Layout
