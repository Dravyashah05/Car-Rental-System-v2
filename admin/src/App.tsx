import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ScrollReveal from './components/ScrollReveal'
import './styles/animations.css'
import AddCarPage from './pages/AddCarPage'
import BookingsPage from './pages/BookingsPage'
import DashboardPage from './pages/DashboardPage'
import OwnersPage from './pages/DriversPage'
import Layout from './pages/Layout'
import LoginPage from './pages/LoginPage'
import PaymentsPage from './pages/PaymentsPage'
import ProfilePage from './pages/ProfilePage'
import UsersPage from './pages/UsersPage'
import OwnerRequestsPage from './pages/OwnerRequestsPage'
import SettingsPage from './pages/SettingsPage'
import { clearAuthToken, getAuthToken } from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAuthToken()))

  return (
    <>
      <ScrollReveal />
      <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onSignIn={() => setIsAuthenticated(true)} />
          )
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout
              onLogout={() => {
                clearAuthToken()
                setIsAuthenticated(false)
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="owners" element={<OwnersPage />} />
        <Route path="add-car" element={<AddCarPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="owner-requests" element={<OwnerRequestsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route
          path="profile"
          element={
            <ProfilePage
              onLogout={() => {
                clearAuthToken()
                setIsAuthenticated(false)
              }}
            />
          }
        />
      </Route>
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
      </Routes>
    </>
  )
}

export default App
