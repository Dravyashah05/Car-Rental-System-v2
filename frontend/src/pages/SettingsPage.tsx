import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SettingsPage.css';

const SettingsPage: React.FC = () => {
  return (
    <div className="settings-page">
      <div className="settings-card">
        <div className="settings-header">
          <div>
            <h1>Settings</h1>
            <p>Manage preferences, privacy, and notifications.</p>
          </div>
          <Link to="/profile" className="settings-link">
            Back to Profile
          </Link>
        </div>

        <div className="settings-grid">
          <section className="settings-section">
            <h2>Notifications</h2>
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span>Booking updates</span>
            </label>
            <label className="settings-toggle">
              <input type="checkbox" />
              <span>Promotions and offers</span>
            </label>
          </section>

          <section className="settings-section">
            <h2>Privacy</h2>
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span>Share ride history with support</span>
            </label>
            <label className="settings-toggle">
              <input type="checkbox" />
              <span>Show profile to drivers</span>
            </label>
          </section>

          <section className="settings-section">
            <h2>Preferences</h2>
            <label className="settings-toggle">
              <input type="checkbox" />
              <span>Remember last pickup location</span>
            </label>
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span>Auto-confirm bookings</span>
            </label>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
