import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CabsPage from './pages/CabsPage';
import BookingPage from './pages/BookingPage';
import BookingsPage from './pages/BookingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import './styles/GlobalLoader.css';

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

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <RouteChangeLoader />
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 140px)' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cabs" element={<CabsPage />} />
              <Route path="/book/:cabId" element={<BookingPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
