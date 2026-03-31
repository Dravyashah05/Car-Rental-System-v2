import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCar,
  FaCalendarCheck,
  FaLifeRing,
  FaSlidersH,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaBirthdayCake,
  FaVenusMars,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const phoneMissing = !currentUser.phone || !currentUser.phone.trim();
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        age: currentUser.age ? String(currentUser.age) : '',
        gender: currentUser.gender ?? '',
      });
      setAvatarPreview(currentUser.avatar);
      if (phoneMissing) {
        setIsEditing(true);
        setNotice('Phone number is required to continue.');
      } else {
        setNotice('');
      }
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender ? (formData.gender as 'male' | 'female' | 'other') : undefined,
        avatar: avatarPreview,
      });
      setSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      let message = 'Failed to update profile';
      if (err && typeof err === 'object') {
        if ('details' in err && typeof (err as { details?: unknown }).details === 'object') {
          const details = (err as { details?: { message?: unknown } }).details;
          if (details && typeof details.message === 'string') {
            message = details.message;
          }
        }
        if (message === 'Failed to update profile' && 'message' in err) {
          const errMessage = (err as { message?: unknown }).message;
          if (typeof errMessage === 'string') {
            message = errMessage;
          }
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="profile-card profile-guest">
          <h1>Profile</h1>
          <p>Please log in to view and edit your profile.</p>
          <div className="profile-guest-actions">
            <Link to="/login" className="profile-primary">
              Log in
            </Link>
            <Link to="/signup" className="profile-secondary">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-layout">
        <section className="profile-card">
          <div className="profile-header">
            <div>
              <h1>Profile</h1>
              <p>Manage your account details and quick actions.</p>
            </div>
            <div className="profile-badge">Active account</div>
          </div>

          <div className="profile-avatar">
            <div className="profile-avatar__image">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" />
              ) : (
                <span>{currentUser.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {isEditing && (
              <>
                <label className="profile-avatar__upload">
                  Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
                <p className="profile-avatar__note">JPG or PNG, up to 2MB.</p>
              </>
            )}
          </div>

          {error && <div className="profile-alert error">{error}</div>}
          {notice && <div className="profile-alert notice">{notice}</div>}
          {success && <div className="profile-alert success">{success}</div>}

          {!isEditing ? (
            <div className="profile-details">
              <div className="profile-detail">
                <span className="profile-label">
                  <FaUser /> Full Name
                </span>
                <span className="profile-value">{currentUser.name}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-label">
                  <FaEnvelope /> Email
                </span>
                <span className="profile-value">{currentUser.email}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-label">
                  <FaPhoneAlt /> Phone
                </span>
                <span className="profile-value">{currentUser.phone || 'Not set'}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-label">
                  <FaBirthdayCake /> Age
                </span>
                <span className="profile-value">{currentUser.age ?? 'Not set'}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-label">
                  <FaVenusMars /> Gender
                </span>
                <span className="profile-value">
                  {currentUser.gender ? currentUser.gender.charAt(0).toUpperCase() + currentUser.gender.slice(1) : 'Not set'}
                </span>
              </div>
              <button className="profile-primary" type="button" onClick={() => setIsEditing(true)}>
                Edit profile
              </button>
              <button className="profile-secondary" type="button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <form className="profile-form" onSubmit={handleSubmit}>
              <label className="profile-field">
                <span className="profile-field__label">
                  <FaUser /> Full Name
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="profile-field">
                <span className="profile-field__label">
                  <FaEnvelope /> Email
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="profile-field">
                <span className="profile-field__label">
                  <FaPhoneAlt /> Phone
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </label>

              <div className="profile-field-row">
                <label className="profile-field">
                  <span className="profile-field__label">
                    <FaBirthdayCake /> Age
                  </span>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                  />
                </label>

                <label className="profile-field">
                  <span className="profile-field__label">
                    <FaVenusMars /> Gender
                  </span>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, gender: e.target.value }))
                    }
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <div className="profile-form__actions">
                <button className="profile-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  className="profile-secondary"
                  type="button"
                  onClick={() => {
                    const phoneMissing = !currentUser.phone || !currentUser.phone.trim();
                    if (phoneMissing) {
                      setIsEditing(true);
                      setNotice('Phone number is required to continue.');
                      return;
                    }
                    setIsEditing(false);
                    setError('');
                    setSuccess('');
                    setFormData({
                      name: currentUser.name,
                      email: currentUser.email,
                      phone: currentUser.phone,
                      age: currentUser.age ? String(currentUser.age) : '',
                      gender: currentUser.gender ?? '',
                    });
                    setAvatarPreview(currentUser.avatar);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="profile-side">
          <div className="profile-card profile-actions">
            <h2>Quick access</h2>
            <div className="profile-action-grid">
              <Link to="/bookings" className="profile-action">
                <span className="profile-action__icon"><FaCalendarCheck /></span>
                View bookings
                <span>Track upcoming rentals</span>
              </Link>
              <Link to="/cabs" className="profile-action">
                <span className="profile-action__icon"><FaCar /></span>
                Browse cabs
                <span>Find your next rental car</span>
              </Link>
              <Link to="/settings" className="profile-action">
                <span className="profile-action__icon"><FaSlidersH /></span>
                Settings
                <span>Preferences and privacy</span>
              </Link>
              <Link to="/support" className="profile-action">
                <span className="profile-action__icon"><FaLifeRing /></span>
                Support center
                <span>Get help fast</span>
              </Link>
            </div>
          </div>

          <div className="profile-card profile-feature">
            <h2>Upcoming features</h2>
            <ul className="profile-feature-list">
              <li>Saved locations and favorites</li>
              <li>Payment methods</li>
              <li>Rental preferences</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProfilePage;


