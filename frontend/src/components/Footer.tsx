import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
} from 'react-icons/fa6';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-shell">
        <div className="footer-content">
          <div className="footer-section brand">
            <h4>CityRide</h4>
            <p>Premium rides for every trip. Book faster, ride safer.</p>
            <div className="footer-contact">
              <span><FaPhone /> +91 1234 567 890</span>
              <span><FaEnvelope /> support@cabrental.com</span>
              <span><FaLocationDot /> 24/7 Service - Citywide</span>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/cabs">Browse Cabs</Link></li>
              <li><Link to="/bookings">My Bookings</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/settings">Settings</Link></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Terms & Policies</a></li>
              <li><a href="#">Safety Guidelines</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Follow Us</h4>
            <p>Get the latest updates and offers.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="X"><FaXTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>(c) {new Date().getFullYear()} CityRide Service. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
