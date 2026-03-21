import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { cabService } from '../services/cabService';
import type { Booking } from '../types';
import '../styles/BookingsPage.css';

const BookingsPage: React.FC = () => {
  const { bookings: contextBookings } = useBooking();
  const { currentUser } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setBookings(contextBookings);
  }, [contextBookings]);

  useEffect(() => {
    let isMounted = true;

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
        if (isMounted) setBookings(latest);
      } catch {
        if (isMounted) setError('Could not load bookings. Please try again.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadBookings();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const counts = useMemo(
    () => ({
      all: bookings.length,
      upcoming: bookings.filter((booking) => booking.status === 'confirmed').length,
      completed: bookings.filter((booking) => booking.status === 'completed').length,
      cancelled: bookings.filter((booking) => booking.status === 'cancelled').length,
    }),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    let list = bookings;

    if (activeTab === 'upcoming') list = bookings.filter((booking) => booking.status === 'confirmed');
    if (activeTab === 'completed') list = bookings.filter((booking) => booking.status === 'completed');
    if (activeTab === 'cancelled') list = bookings.filter((booking) => booking.status === 'cancelled');

    if (!searchTerm.trim()) return list;

    const q = searchTerm.toLowerCase();
    return list.filter((booking) => {
      const route = `${booking.pickupLocation} ${booking.dropoffLocation}`.toLowerCase();
      return route.includes(q) || booking.id.toLowerCase().includes(q);
    });
  }, [activeTab, bookings, searchTerm]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '--';
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
            <p>Track your rentals, drivers, and payments in one place.</p>
          </div>
          <div className="bookings-count">
            <span>Total</span>
            <strong>{counts.all}</strong>
          </div>
        </div>

        {!currentUser ? (
          <div className="empty-state">
            <p>Log in to view your bookings.</p>
            <Link to="/login" className="browse-btn">
              Go to Login
            </Link>
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
        ) : counts.all === 0 ? (
          <div className="empty-state">
            <p>No bookings yet</p>
            <p>Start booking your rental cars now.</p>
            <Link to="/cabs" className="browse-btn">
              Browse Cars
            </Link>
          </div>
        ) : (
          <>
            <div className="booking-controls">
              <div className="booking-tabs">
                <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                  All <span className="tab-count">{counts.all}</span>
                </button>
                <button
                  className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming <span className="tab-count">{counts.upcoming}</span>
                </button>
                <button
                  className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed <span className="tab-count">{counts.completed}</span>
                </button>
                <button
                  className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cancelled')}
                >
                  Cancelled <span className="tab-count">{counts.cancelled}</span>
                </button>
              </div>

              <input
                className="booking-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by route or booking id"
                aria-label="Search bookings"
              />
            </div>

            <div className="bookings-list">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-card-top">
                      <div>
                        <div className="booking-id">Booking #{(booking.id || '').slice(-8)}</div>
                        <div className="booking-route">
                          {booking.pickupLocation}
                          {' -> '}
                          {booking.dropoffLocation}
                        </div>
                      </div>
                      <span className={`status-pill status-${booking.status}`}>
                        {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                      </span>
                    </div>

                    <div className="booking-meta">
                      <div className="meta-item">
                        <span className="meta-label">Pickup</span>
                        <span className="meta-value">
                          {formatDate(booking.pickupDate)} | {booking.pickupTime || '--'}
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
                        <span className="meta-value">Rs. {booking.totalPrice.toFixed(2)}</span>
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
                  <p>No matching bookings found.</p>
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


