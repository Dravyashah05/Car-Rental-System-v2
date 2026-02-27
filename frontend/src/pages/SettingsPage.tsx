import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/SettingsPage.css';

type SettingsState = {
  bookingUpdates: boolean;
  promotions: boolean;
  shareHistory: boolean;
  showProfileToDrivers: boolean;
  rememberLocation: boolean;
  autoConfirm: boolean;
};

const STORAGE_KEY = 'cityride_settings';

const defaultSettings: SettingsState = {
  bookingUpdates: true,
  promotions: false,
  shareHistory: true,
  showProfileToDrivers: false,
  rememberLocation: false,
  autoConfirm: true,
};

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [savedAt, setSavedAt] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<SettingsState>;
      setSettings((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore invalid local storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSavedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
  }, [settings]);

  const enabledCount = useMemo(() => Object.values(settings).filter(Boolean).length, [settings]);

  const toggle = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetDefaults = () => {
    setSettings(defaultSettings);
  };

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

        <div className="settings-meta">
          <span>{enabledCount} of 6 options enabled</span>
          {savedAt ? <span>Last saved at {savedAt}</span> : null}
        </div>

        <div className="settings-grid">
          <section className="settings-section">
            <h2>Notifications</h2>
            <label className="settings-toggle">
              <input type="checkbox" checked={settings.bookingUpdates} onChange={() => toggle('bookingUpdates')} />
              <span>Booking updates</span>
            </label>
            <label className="settings-toggle">
              <input type="checkbox" checked={settings.promotions} onChange={() => toggle('promotions')} />
              <span>Promotions and offers</span>
            </label>
          </section>

          <section className="settings-section">
            <h2>Privacy</h2>
            <label className="settings-toggle">
              <input type="checkbox" checked={settings.shareHistory} onChange={() => toggle('shareHistory')} />
              <span>Share ride history with support</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.showProfileToDrivers}
                onChange={() => toggle('showProfileToDrivers')}
              />
              <span>Show profile to drivers</span>
            </label>
          </section>

          <section className="settings-section">
            <h2>Preferences</h2>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.rememberLocation}
                onChange={() => toggle('rememberLocation')}
              />
              <span>Remember last pickup location</span>
            </label>
            <label className="settings-toggle">
              <input type="checkbox" checked={settings.autoConfirm} onChange={() => toggle('autoConfirm')} />
              <span>Auto-confirm bookings</span>
            </label>
          </section>
        </div>

        <div className="settings-actions">
          <button type="button" className="settings-reset" onClick={resetDefaults}>
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
