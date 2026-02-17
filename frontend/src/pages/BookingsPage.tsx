import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { cabService } from '../services/cabService';
import type { Booking } from '../types';
import '../styles/BookingsPage.css';

const BookingsPage: React.FC = () => {
  const { bookings: userBookings } = useBooking();
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>(
    'all'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setBookings(userBookings);
  }, [userBookings]);

  useEffect(() => {
    let isActive = true;

    const loadBookings = async () => {
      if (!currentUser) {
        setBookings([]);
        setError('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const latest = await cabService.getBookings();
        if (isActive) {
          setBookings(latest);
        }
      } catch {
        if (isActive) {
          setError('Could not load bookings. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      isActive = false;
    };
  }, [currentUser]);

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter((b) => b.status === 'confirmed');
      case 'completed':
        return bookings.filter((b) => b.status === 'completed');
      case 'cancelled':
        return bookings.filter((b) => b.status === 'cancelled');
      case 'all':
      default:
        return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <div>
            <h1>My Bookings</h1>
            <p>Track your rides, drivers, and payments in one place.</p>
          </div>
          <div className="bookings-count">
            <span>Total</span>
            <strong>{bookings.length}</strong>
          </div>
        </div>

        {!currentUser ? (
          <div className="empty-state">
            <p>Log in to view your bookings.</p>
            <a href="/login" className="browse-btn">
              Go to Login
            </a>
          </div>
        ) : isLoading ? (
          <div className="empty-state">
            <p>Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>{error}</p>
            <button className="browse-btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings yet</p>
            <p>Start booking your rides now!</p>
            <a href="/cabs" className="browse-btn">
              Browse Cabs
            </a>
          </div>
        ) : (
          <>
            <div className="booking-tabs">
              <button
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Bookings <span className="tab-count">{bookings.length}</span>
              </button>
              <button
                className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming{' '}
                <span className="tab-count">
                  {bookings.filter((b) => b.status === 'confirmed').length}
                </span>
              </button>
              <button
                className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed{' '}
                <span className="tab-count">
                  {bookings.filter((b) => b.status === 'completed').length}
                </span>
              </button>
              <button
                className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                onClick={() => setActiveTab('cancelled')}
              >
                Cancelled{' '}
                <span className="tab-count">
                  {bookings.filter((b) => b.status === 'cancelled').length}
                </span>
              </button>
            </div>

            <div className="bookings-list">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-card-top">
                      <div>
                        <div className="booking-id">Booking #{booking.id.slice(-8)}</div>
                        <div className="booking-route">
                          {booking.pickupLocation} → {booking.dropoffLocation}
                        </div>
                      </div>
                      <span className={`status-pill status-${booking.status}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="booking-meta">
                      <div className="meta-item">
                        <span className="meta-label">Pickup</span>
                        <span className="meta-value">
                          {formatDate(booking.pickupDate)} • {booking.pickupTime}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Distance</span>
                        <span className="meta-value">{booking.estimatedDistance} km</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Duration</span>
                        <span className="meta-value">{booking.estimatedDuration} minutes</span>
                      </div>

                      {booking.driverName && (
                        <>
                          <div className="meta-item">
                            <span className="meta-label">Driver</span>
                            <span className="meta-value">{booking.driverName}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Driver Phone</span>
                            <span className="meta-value">{booking.driverPhone}</span>
                          </div>
                        </>
                      )}

                      <div className="meta-item total">
                        <span className="meta-label">Total Amount</span>
                        <span className="meta-value">₹{booking.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="booking-actions">
                      {booking.status === 'confirmed' && (
                        <>
                          <button className="action-btn cancel">Cancel Booking</button>
                          <button className="action-btn contact">Contact Driver</button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <button className="action-btn review">Leave Review</button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-bookings">
                  <p>No {activeTab} bookings</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
