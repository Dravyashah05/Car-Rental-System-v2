import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CabsPage from './pages/CabsPage';
import BookingPage from './pages/BookingPage';
import BookingsPage from './pages/BookingsPage';
import PaymentsPage from './pages/PaymentsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import SsoCallbackPage from './pages/SsoCallbackPage';
import ScrollReveal from './components/ScrollReveal';
import './styles/GlobalLoader.css';
import './styles/animations.css';
import './App.css';

function RouteChangeLoader() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [location]);

  if (!isLoading) return null;

  return (
    <div className="route-loader" role="status" aria-live="polite" aria-label="Loading">
      <div className="route-loader__backdrop" />
      <div className="route-loader__spinner" />
    </div>
  );
}

function PhoneRequirementGuard() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    const needsPhone = !currentUser.phone || !currentUser.phone.trim();
    if (!needsPhone) return;
    const path = location.pathname;
    if (path === '/profile') return;
    if (path.startsWith('/login') || path.startsWith('/signup')) return;

    navigate('/profile', { replace: true, state: { requirePhone: true, from: location } });
  }, [currentUser, location, navigate]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const needsPhone = !currentUser.phone || !currentUser.phone.trim();
  if (needsPhone && location.pathname !== '/profile') {
    return <Navigate to="/profile" state={{ requirePhone: true, from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <ScrollReveal />
            <RouteChangeLoader />
            <PhoneRequirementGuard />
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 140px)' }} className="app-main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cabs" element={<CabsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/sso-callback" element={<SsoCallbackPage />} />
                <Route path="/login/sso-callback" element={<SsoCallbackPage />} />
                <Route path="/signup/sso-callback" element={<SsoCallbackPage />} />
                
                <Route
                  path="/book/:cabId"
                  element={
                    <ProtectedRoute>
                      <BookingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <BookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <PaymentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/support"
                  element={
                    <ProtectedRoute>
                      <SupportPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </Router>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
