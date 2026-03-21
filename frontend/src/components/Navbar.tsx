import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiSun, HiMoon } from 'react-icons/hi2';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const roleLabel = currentUser?.role ? currentUser.role.toUpperCase() : 'USER';

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="CarRental home">
          <img src="/logo.png" alt="CarRental logo" className="logo-image" />
          CarRental
        </Link>

        <button
          type="button"
          className={`nav-toggle ${isMenuOpen ? 'open' : ''}`}
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-right ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/cabs" className={`nav-link ${isActive('/cabs') ? 'active' : ''}`}>
                Browse Cars
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
                My Bookings
              </Link>
            </li>
          </ul>

          <div className="nav-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <HiSun size={20} /> : <HiMoon size={20} />}
            </button>
            {currentUser ? (
              <>
                <Link to="/profile" className={`nav-profile ${isActive('/profile') ? 'active' : ''}`}>
                  <span className="nav-avatar">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={`${currentUser.name} avatar`} />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span>Profile</span>
                </Link>
                <span className={`nav-role nav-role--${roleLabel.toLowerCase()}`}>{roleLabel}</span>
              </>
            ) : (
              <>
                <Link to="/login" className={`nav-button ghost ${isActive('/login') ? 'active' : ''}`}>
                  Login
                </Link>
                <Link to="/signup" className={`nav-button ${isActive('/signup') ? 'active' : ''}`}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
