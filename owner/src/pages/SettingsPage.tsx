import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useUiPreferences } from '../context/UiPreferencesContext'
import { apiFetch } from '../services/api'

type CurrentUser = {
  name?: string
  email?: string
  role?: string
}

type NotificationPrefs = {
  email: boolean
  sms: boolean
  product: boolean
}

const NOTIFICATION_KEY = 'cr_owner_notifications'

const defaultNotifications: NotificationPrefs = {
  email: true,
  sms: false,
  product: true,
}

const loadNotifications = () => {
  if (typeof window === 'undefined') return defaultNotifications
  const stored = window.localStorage.getItem(NOTIFICATION_KEY)
  if (!stored) return defaultNotifications
  try {
    const parsed = JSON.parse(stored) as Partial<NotificationPrefs>
    return { ...defaultNotifications, ...parsed }
  } catch {
    return defaultNotifications
  }
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

function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { reduceMotion, setReduceMotion } = useUiPreferences()
  const [notifications, setNotifications] = useState<NotificationPrefs>(() => loadNotifications())
  const [profile, setProfile] = useState<CurrentUser | null>(null)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      try {
        const data = await apiFetch<{ user: CurrentUser }>('/api/auth/profile')
        if (isMounted) {
          setProfile(data.user ?? null)
        }
      } catch (err) {
        if (isMounted) {
          setProfile(null)
          setProfileError(err instanceof Error ? err.message : 'Unable to load profile')
        }
      }
    }
    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  const displayName = profile?.name || profile?.email || 'Owner'
  const displayEmail = profile?.email || 'owner@carrental.app'
  const normalizedRole = profile?.role === 'driver' ? 'owner' : profile?.role
  const displayRole = normalizedRole
    ? normalizedRole[0].toUpperCase() + normalizedRole.slice(1)
    : 'Owner'
  const initials = getInitials(profile?.name, profile?.email)

  const exportPayload = useMemo(
    () => ({
      profile: {
        name: profile?.name ?? null,
        email: profile?.email ?? null,
        role: profile?.role ?? null,
      },
      preferences: {
        theme,
        resolvedTheme,
        reduceMotion,
        notifications,
      },
      exportedAt: new Date().toISOString(),
    }),
    [notifications, profile, reduceMotion, resolvedTheme, theme],
  )

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `owner-settings-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setTheme('system')
    setReduceMotion(false)
    setNotifications(defaultNotifications)
  }

  return (
    <div className="page settings-page">
      <div className="settings-hero">
        <div>
          <p className="hero-label">Settings</p>
          <h2>Personalize your owner workspace</h2>
          <p className="muted">
            Control appearance, updates, and accessibility preferences in one place.
          </p>
        </div>
        <div className="settings-hero-actions">
          <span className="badge">Theme: {resolvedTheme}</span>
          {reduceMotion ? <span className="badge danger">Reduced motion</span> : null}
        </div>
      </div>

      <div className="settings-grid">
        <section className="panel settings-card">
          <div className="panel-header">
            <div>
              <h3>Appearance</h3>
              <p>Switch between light, dark, or system-aligned visuals.</p>
            </div>
          </div>
          <div className="segment">
            <button
              className={`segment-item ${theme === 'light' ? 'active' : ''}`}
              type="button"
              onClick={() => setTheme('light')}
            >
              Light
            </button>
            <button
              className={`segment-item ${theme === 'dark' ? 'active' : ''}`}
              type="button"
              onClick={() => setTheme('dark')}
            >
              Dark
            </button>
            <button
              className={`segment-item ${theme === 'system' ? 'active' : ''}`}
              type="button"
              onClick={() => setTheme('system')}
            >
              System
            </button>
          </div>
          <p className="settings-note">
            System mode follows your device preference while keeping brand accents intact.
          </p>
        </section>

        <section className="panel settings-card">
          <div className="panel-header">
            <div>
              <h3>Notifications</h3>
              <p>Choose how booking updates and alerts reach you.</p>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <p className="row-title">Email summaries</p>
              <p className="muted">Weekly booking and earnings recaps.</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(event) =>
                  setNotifications((prev) => ({ ...prev, email: event.target.checked }))
                }
              />
              <span className="toggle-track" />
            </label>
          </div>
          <div className="settings-row">
            <div>
              <p className="row-title">SMS alerts</p>
              <p className="muted">Instant flags for urgent booking changes.</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={(event) =>
                  setNotifications((prev) => ({ ...prev, sms: event.target.checked }))
                }
              />
              <span className="toggle-track" />
            </label>
          </div>
          <div className="settings-row">
            <div>
              <p className="row-title">Product updates</p>
              <p className="muted">New features and training resources.</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications.product}
                onChange={(event) =>
                  setNotifications((prev) => ({ ...prev, product: event.target.checked }))
                }
              />
              <span className="toggle-track" />
            </label>
          </div>
        </section>

        <section className="panel settings-card">
          <div className="panel-header">
            <div>
              <h3>Accessibility</h3>
              <p>Make the interface more comfortable for long sessions.</p>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <p className="row-title">Reduce motion</p>
              <p className="muted">Minimize animated transitions and shimmer effects.</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(event) => setReduceMotion(event.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          </div>
        </section>

        <section className="panel settings-card">
          <div className="panel-header">
            <div>
              <h3>Account snapshot</h3>
              <p>Export your settings and profile details anytime.</p>
            </div>
          </div>
          <div className="detail-hero settings-profile">
            <div className="detail-hero-media">{initials}</div>
            <div>
              <h4>{displayName}</h4>
              <p className="muted">{displayEmail}</p>
            </div>
            <span className="pill">{displayRole}</span>
          </div>
          {profileError ? <p className="muted">{profileError}</p> : null}
          <div className="settings-actions">
            <button className="primary" type="button" onClick={handleExport}>
              Download snapshot
            </button>
            <button className="ghost" type="button" onClick={handleReset}>
              Reset preferences
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SettingsPage
