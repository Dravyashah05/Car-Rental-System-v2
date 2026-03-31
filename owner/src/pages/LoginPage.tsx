import { useState } from 'react'
import { apiFetch, setAuthToken } from '../services/api'

type LoginResponse = {
  user: { role?: string }
  token: string
}

function LoginPage({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="login">
      <div className="login-card" data-animate>
        <div className="login-brand">
          <div className="brand-mark">CR</div>
          <div>
            <p className="brand-title">CarRental Owner</p>
            <p className="brand-subtitle">Car Rental System</p>
          </div>
        </div>

        <div className="login-header">
          <h1>Welcome back</h1>
          <p>Sign in to confirm rentals, manage your fleet, and track earnings.</p>
        </div>

        <form
          className="login-form"
          onSubmit={async (event) => {
            event.preventDefault()
            setError('')
            setIsSubmitting(true)
            try {
              const data = await apiFetch<LoginResponse>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
              })
              const role = data.user?.role ?? ''
              if (!['admin', 'owner'].includes(role)) {
                throw new Error('Owner access required')
              }
              setAuthToken(data.token)
              onSignIn()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Login failed')
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          <label className="field">
            <span>Work email</span>
            <input
              type="email"
              placeholder="owner@carrental.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="muted">{error}</p> : null}
          <div className="login-actions">
            <label className="checkbox">
              <input type="checkbox" defaultChecked />
              <span>Keep me signed in</span>
            </label>
            <button className="link" type="button">
              Forgot password?
            </button>
          </div>
          <button className="primary full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Need access? <button className="link">Request an invite</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
