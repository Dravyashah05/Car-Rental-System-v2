import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaPaperPlane,
} from 'react-icons/fa6';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    alert('Subscribed successfully. You will receive weekly ride offers.');
    setEmail('');
  };

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

          <div className="footer-section footer-feature">
            <h4>Weekly Offers</h4>
            <p>Get promo codes and city ride updates directly in your inbox.</p>
            <form className="footer-subscribe" onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
              />
              <button type="submit" aria-label="Subscribe">
                <FaPaperPlane />
              </button>
            </form>
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

