import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { IconContext  } from 'react-icons';
import { FiAlignJustify } from 'react-icons/fi';
import { LuLayoutDashboard } from "react-icons/lu";
import { MdPayments } from "react-icons/md";
import { FaUserCog } from "react-icons/fa";
import { FaCarAlt } from "react-icons/fa";
import { FaClipboardCheck } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";

const pageMeta: Record<
  string,
  { title: string; subtitle?: string }
> = {
  '/dashboard': {
    title: 'Owner Dashboard',
    subtitle: 'Track your bookings, fleet, and earnings at a glance.',
  },
  '/requests': {
    title: 'Owner Requests',
    subtitle: 'Confirm bookings and send owner requests.',
  },
  '/add-car': {
    title: 'Add Car',
    subtitle: 'Register new vehicles and assign categories.',
  },
  '/payments': {
    title: 'Payments & Settlements',
    subtitle: 'Monitor payouts, refunds, and revenue trends.',
  },
  '/profile': {
    title: 'Owner Profile',
    subtitle: 'Manage your access, preferences, and security.',
  },
  '/settings': {
    title: 'Owner Settings',
    subtitle: 'Fine-tune appearance, preferences, and account controls.',
  },
}

type CurrentUser = {
  name?: string
  email?: string
  role?: string
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

function Layout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation()
  const today = useMemo(() => new Date(), [])
  const meta = pageMeta[location.pathname] ?? pageMeta['/dashboard']
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(min-width: 901px)').matches
  })
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

  const displayName = currentUser?.name || currentUser?.email || 'Owner'
  const normalizedRole = currentUser?.role === 'driver' ? 'owner' : currentUser?.role
  const displayRole = normalizedRole
    ? normalizedRole[0].toUpperCase() + normalizedRole.slice(1)
    : 'Owner'
  const userInitials = getInitials(currentUser?.name, currentUser?.email)
  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <div className={`app ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside id="owner-sidebar" className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">CR</div>
            <div>
              <p className="brand-title">CarRental Owner</p>
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
            onClick={handleNavClick}
          >
            <span className="nav-icon"><LuLayoutDashboard /></span>
            <span>Owner Dashboard</span>
          </NavLink>
          <NavLink
            to="/requests"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><FaClipboardCheck /></span>
            <span>Requests</span>
          </NavLink>
          <NavLink
            to="/add-car"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><FaCarAlt /></span>
            <span>Add Car</span>
          </NavLink>
          <NavLink
            to="/payments"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><MdPayments /></span>
            <span>Payments</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><FaUserCog /></span>
            <span>Profile</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><FiSettings /></span>
            <span>Settings</span>
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
              aria-label="Toggle sidebar"
              aria-controls="owner-sidebar"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              <IconContext.Provider value={{ color: "currentColor", size: "2em",className: "global-class-name" }}>
                <div>
                 <FiAlignJustify />
                </div>
              </IconContext.Provider>
            </button>
            <div className="topbar-heading">
              <h1>{meta.title}</h1>
              {meta.subtitle ? <p className="page-subtitle">{meta.subtitle}</p> : null}
            </div>
          </div>
          <div className="topbar-actions">
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






