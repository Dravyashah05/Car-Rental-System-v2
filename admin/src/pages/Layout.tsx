import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { IconContext  } from 'react-icons';
import { FiAlignJustify, FiBell } from 'react-icons/fi';
import { LuLayoutDashboard } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
import { FaUserCog } from "react-icons/fa";
import { FaCarAlt } from "react-icons/fa";
import { MdPerson } from "react-icons/md";
import { FaClipboardCheck } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";

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
    subtitle: 'Review, assign, and manage car rental bookings.',
  },
  '/owner-requests': {
    title: 'Owner Requests',
    subtitle: 'Confirm bookings and send owner requests.',
  },
  '/owners': {
    title: 'Owner Operations',
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
  '/settings': {
    title: 'Admin Settings',
    subtitle: 'Fine-tune appearance, preferences, and account controls.',
  },
}

type CurrentUser = {
  name?: string
  email?: string
  role?: string
}

type SearchUser = {
  _id: string
  name?: string
  email?: string
  phone?: string
  role?: string
}

type SearchOwner = {
  _id: string
  licenseNumber?: string
  isActive?: boolean
  user?: {
    name?: string
    email?: string
    phone?: string
  }
}

type SearchRide = {
  _id: string
  rider?: {
    name?: string
    email?: string
  }
  pickup?: {
    address?: string
  }
  dropoff?: {
    address?: string
  }
  status?: string
}

type SearchData = {
  users: SearchUser[]
  owners: SearchOwner[]
  rides: SearchRide[]
}

type RideNotification = {
  _id: string
  pickup?: { address?: string }
  dropoff?: { address?: string }
  createdAt?: string
}

const BOOKING_LAST_SEEN_KEY = 'cr_admin_last_seen_booking'
const BOOKING_POLL_INTERVAL = 15000
const NOTIFICATION_LOG_KEY = 'cr_admin_notifications_log'
const MAX_NOTIFICATIONS = 20

type NotificationItem = {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
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
  const navigate = useNavigate()
  const today = useMemo(() => new Date(), [])
  const meta = pageMeta[location.pathname] ?? pageMeta['/dashboard']
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [searchText, setSearchText] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchData, setSearchData] = useState<SearchData>({
    users: [],
    owners: [],
    rides: [],
  })
  const [hasLoadedSearchData, setHasLoadedSearchData] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement | null>(null)
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const lastSeenBookingRef = useRef<number | null>(null)
  const primedBookingRef = useRef(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const notificationsPanelRef = useRef<HTMLDivElement | null>(null)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

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

  useEffect(() => {
    if (!isSearchOpen) return
    const handleClick = (event: MouseEvent) => {
      if (!searchContainerRef.current) return
      if (!searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen])

  useEffect(() => {
    setIsSearchOpen(false)
  }, [location.pathname])

  const showToast = (title: string, message: string, duration = 6000) => {
    setToast({ title, message })
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), duration)
  }

  const playRing = () => {
    if (typeof window === 'undefined') return
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
    if (!AudioCtx) return
    try {
      const context = new AudioCtx()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = 880
      gain.gain.value = 0.06
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.25)
      window.setTimeout(() => {
        context.close().catch(() => undefined)
      }, 400)
    } catch {
      // Ignore sound errors (browser autoplay restrictions).
    }
  }

  const addNotification = (title: string, message: string) => {
    const entry: NotificationItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [entry, ...prev].slice(0, MAX_NOTIFICATIONS))
    playRing()
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(NOTIFICATION_LOG_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as NotificationItem[]
      if (Array.isArray(parsed)) {
        setNotifications(parsed)
      }
    } catch {
      // Ignore malformed storage.
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    if (!isNotificationsOpen) return
    const handleClick = (event: MouseEvent) => {
      if (!notificationsPanelRef.current) return
      if (!notificationsPanelRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('mousedown', handleClick)
    }
  }, [isNotificationsOpen])

  useEffect(() => {
    if (!isNotificationsOpen) return
    setNotifications((prev) =>
      prev.map((item) => (item.read ? item : { ...item, read: true }))
    )
  }, [isNotificationsOpen])

  useEffect(() => {
    showToast('Notifications ready', 'We will alert you for new bookings.', 3500)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = Number(window.localStorage.getItem(BOOKING_LAST_SEEN_KEY))
    lastSeenBookingRef.current = Number.isFinite(stored) ? stored : null

    const getCreatedAt = (ride: RideNotification) => {
      if (!ride.createdAt) return 0
      const parsed = new Date(ride.createdAt).getTime()
      return Number.isFinite(parsed) ? parsed : 0
    }

    const showNotification = async (title: string, message: string, tag: string) => {
      if (!('Notification' in window)) return
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission()
        } catch {
          // Ignore permission errors.
        }
      }
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message, tag })
      }
    }

    const notifyNewBooking = async (newRides: RideNotification[]) => {
      const latest = [...newRides].sort((a, b) => getCreatedAt(b) - getCreatedAt(a))[0]
      const count = newRides.length
      const title = count === 1 ? 'New booking received' : `${count} new bookings received`
      const pickup = latest?.pickup?.address ?? 'Unknown pickup'
      const dropoff = latest?.dropoff?.address ?? 'Unknown dropoff'
      const message = `${pickup} -> ${dropoff}`
      addNotification(title, message)
      showToast(title, message)
      await showNotification(title, message, `booking-${latest?._id ?? 'new'}`)
    }

    const pollBookings = async () => {
      try {
        const rides = await apiFetch<RideNotification[]>('/api/rides')
        if (!Array.isArray(rides) || rides.length === 0) {
          primedBookingRef.current = true
          return
        }

        const latestCreated = rides.reduce((max, ride) => Math.max(max, getCreatedAt(ride)), 0)

        if (!primedBookingRef.current) {
          primedBookingRef.current = true
          if (latestCreated > 0) {
            lastSeenBookingRef.current = latestCreated
            window.localStorage.setItem(BOOKING_LAST_SEEN_KEY, String(latestCreated))
          }
          return
        }

        const lastSeen = lastSeenBookingRef.current ?? 0
        const newRides = rides.filter((ride) => getCreatedAt(ride) > lastSeen)
        if (newRides.length > 0) {
          await notifyNewBooking(newRides)
        }
        if (latestCreated > lastSeen) {
          lastSeenBookingRef.current = latestCreated
          window.localStorage.setItem(BOOKING_LAST_SEEN_KEY, String(latestCreated))
        }
      } catch {
        // Ignore polling errors.
      }
    }

    pollBookings()
    const intervalId = window.setInterval(pollBookings, BOOKING_POLL_INTERVAL)
    return () => {
      window.clearInterval(intervalId)
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const loadSearchData = async () => {
    setIsSearchLoading(true)
    setSearchError('')
    try {
      const [users, owners, rides] = await Promise.all([
        apiFetch<SearchUser[]>('/api/users'),
        apiFetch<SearchOwner[]>('/api/owners'),
        apiFetch<SearchRide[]>('/api/rides'),
      ])
      setSearchData({ users, owners, rides })
      setHasLoadedSearchData(true)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Unable to load search data')
    } finally {
      setIsSearchLoading(false)
    }
  }

  useEffect(() => {
    const trimmed = searchText.trim()
    if (!trimmed) {
      setIsSearchOpen(false)
      return
    }
    setIsSearchOpen(true)
    if (!hasLoadedSearchData && !isSearchLoading) {
      loadSearchData()
    }
  }, [searchText, hasLoadedSearchData, isSearchLoading])

  const normalizedQuery = searchText.trim().toLowerCase()

  const userMatches = useMemo(() => {
    if (!normalizedQuery) return []
    return searchData.users.filter((user) => {
      const haystack = [user.name, user.email, user.phone, user.role, user._id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [searchData.users, normalizedQuery])

  const ownerMatches = useMemo(() => {
    if (!normalizedQuery) return []
    return searchData.owners.filter((owner) => {
      const haystack = [
        owner.user?.name,
        owner.user?.email,
        owner.user?.phone,
        owner.licenseNumber,
        owner._id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [searchData.owners, normalizedQuery])

  const bookingMatches = useMemo(() => {
    if (!normalizedQuery) return []
    return searchData.rides.filter((ride) => {
      const rider = `${ride.rider?.name ?? ''} ${ride.rider?.email ?? ''}`
      const route = `${ride.pickup?.address ?? ''} ${ride.dropoff?.address ?? ''}`
      const haystack = [ride._id, ride.status, rider, route]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [searchData.rides, normalizedQuery])

  const buildSearchTarget = (path: string) => {
    const params = new URLSearchParams()
    const trimmed = searchText.trim()
    if (trimmed) {
      params.set('q', trimmed)
    }
    return {
      pathname: path,
      search: params.toString() ? `?${params.toString()}` : '',
    }
  }

  const displayName = currentUser?.name || currentUser?.email || 'Admin user'
  const displayRole = currentUser?.role ? currentUser.role[0].toUpperCase() + currentUser.role.slice(1) : 'Administrator'
  const userInitials = getInitials(currentUser?.name, currentUser?.email)
  const unreadCount = notifications.filter((item) => !item.read).length
  const visibleNotifications = (() => {
    const filtered = showUnreadOnly ? notifications.filter((item) => !item.read) : notifications
    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime()
      const bTime = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime
    })
  })()
  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <div className={`app ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside id="admin-sidebar" className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">CR</div>
            <div>
              <p className="brand-title">CityRide Admin</p>
              <p className="brand-subtitle">CityRide Platform</p>
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
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/bookings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><FaWpforms /></span>
            <span>Bookings</span>
          </NavLink>
          <NavLink
            to="/owner-requests"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><FaClipboardCheck /></span>
            <span>Owner Requests</span>
          </NavLink>
          <NavLink
            to="/owners"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><img src="https://img.icons8.com/?size=100&id=63392&format=png&color=64748B" alt="" style={{ width: "20px" }}/></span>
            <span>Owners</span>
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
            to="/users"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><MdPerson /></span>
            <span>Users</span>
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
              aria-controls="admin-sidebar"
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
            <div className="search" ref={searchContainerRef}>
              <input
                placeholder="Search users, bookings, or owners"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onFocus={() => {
                  if (searchText.trim()) {
                    setIsSearchOpen(true)
                  }
                }}
              />
              {isSearchOpen ? (
                <div className="search-results">
                  {isSearchLoading ? (
                    <div className="search-empty">Loading search data...</div>
                  ) : searchError ? (
                    <div className="search-empty">{searchError}</div>
                  ) : (
                    <>
                      <div className="search-group">
                        <div className="search-group-title">Users</div>
                        {userMatches.length === 0 ? (
                          <div className="search-empty">No users found.</div>
                        ) : (
                          userMatches.map((user) => {
                            const title = user.name ?? user.email ?? `User ${user._id.slice(-6).toUpperCase()}`
                            const subtitle = user.email ?? user.phone ?? 'No contact'
                            return (
                              <button
                                key={user._id}
                                type="button"
                                className="search-item"
                                onClick={() => {
                                  navigate(buildSearchTarget('/users'))
                                  setIsSearchOpen(false)
                                }}
                              >
                                <span className="search-item-title">{title}</span>
                                <span className="search-item-subtitle">{subtitle}</span>
                              </button>
                            )
                          })
                        )}
                      </div>
                      <div className="search-group">
                        <div className="search-group-title">Bookings</div>
                        {bookingMatches.length === 0 ? (
                          <div className="search-empty">No bookings found.</div>
                        ) : (
                          bookingMatches.map((ride) => {
                            const riderName = ride.rider?.name ?? ride.rider?.email ?? 'Unknown customer'
                            const pickup = ride.pickup?.address ?? 'Unknown pickup'
                            const dropoff = ride.dropoff?.address ?? 'Unknown dropoff'
                            return (
                              <button
                                key={ride._id}
                                type="button"
                                className="search-item"
                                onClick={() => {
                                  navigate(buildSearchTarget('/bookings'))
                                  setIsSearchOpen(false)
                                }}
                              >
                                <span className="search-item-title">Booking {ride._id.slice(-8).toUpperCase()}</span>
                                <span className="search-item-subtitle">
                                  {riderName} | {pickup} {'->'} {dropoff}
                                </span>
                              </button>
                            )
                          })
                        )}
                      </div>
                      <div className="search-group">
                        <div className="search-group-title">Owners</div>
                        {ownerMatches.length === 0 ? (
                          <div className="search-empty">No owners found.</div>
                        ) : (
                          ownerMatches.map((owner) => {
                            const title =
                              owner.user?.name ?? owner.user?.email ?? `Owner ${owner._id.slice(-6).toUpperCase()}`
                            const subtitle =
                              owner.user?.email ?? owner.user?.phone ?? owner.licenseNumber ?? 'No contact'
                            return (
                              <button
                                key={owner._id}
                                type="button"
                                className="search-item"
                                onClick={() => {
                                  navigate(buildSearchTarget('/owners'))
                                  setIsSearchOpen(false)
                                }}
                              >
                                <span className="search-item-title">{title}</span>
                                <span className="search-item-subtitle">{subtitle}</span>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>
            <div className="notification-wrapper" ref={notificationsPanelRef}>
              <button
                className="notification-button"
                type="button"
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                aria-haspopup="dialog"
                aria-expanded={isNotificationsOpen}
              >
                <FiBell />
                <span>Notifications</span>
                {unreadCount > 0 ? <span className="notification-badge">{unreadCount}</span> : null}
              </button>
              {isNotificationsOpen ? (
                <div className="notification-panel" role="dialog" aria-label="Notifications">
                <div className="notification-panel-header">
                  <div>
                    <strong>Notifications</strong>
                    <span className="muted">{notifications.length} total</span>
                  </div>
                    <div className="notification-actions">
                      <button
                        className={`notification-filter ${showUnreadOnly ? 'active' : ''}`}
                        type="button"
                        onClick={() => setShowUnreadOnly((prev) => !prev)}
                      >
                        {showUnreadOnly ? 'Unread only' : 'All'}
                      </button>
                      <button
                        className="notification-sort"
                        type="button"
                        onClick={() =>
                          setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))
                        }
                      >
                        {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                      </button>
                      <button
                        className="notification-clear"
                        type="button"
                        onClick={clearNotifications}
                        disabled={notifications.length === 0}
                      >
                      Clear all
                    </button>
                  </div>
                </div>
                <div className="notification-list">
                  {visibleNotifications.length === 0 ? (
                    <p className="muted">No notifications yet.</p>
                  ) : (
                    visibleNotifications.map((item) => (
                      <div key={item.id} className={`notification-item ${item.read ? 'read' : 'unread'}`}>
                        <div>
                          <p className="notification-title">{item.title}</p>
                          <p className="notification-message">{item.message}</p>
                        </div>
                        <span className="notification-time">
                          {new Date(item.createdAt).toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                    )}
                  </div>
                </div>
              ) : null}
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
        {toast ? (
          <div className="notification-toast" role="status" aria-live="polite">
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>
        ) : null}

        <Outlet />
      </main>
    </div>
  )
}

export default Layout






