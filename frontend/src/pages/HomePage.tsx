import React, { useMemo, useState } from 'react';
import {
  FaBolt,
  FaRupeeSign,
  FaStar,
  FaShieldAlt,
  FaCar,
  FaUserTie,
  FaTags,
  FaHeadset,
  FaLock,
  FaMapMarkedAlt,
  FaCalendarCheck,
  FaRoute,
  FaCalculator,
  FaClock,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import '../styles/HomePage.css';

const stats = [
  { label: 'Happy Customers', value: '25K+' },
  { label: 'Daily Rentals', value: '4.8K+' },
  { label: 'Active Cars', value: '500+' },
  { label: 'Average Rating', value: '4.9/5' },
];

const howItWorks = [
  {
    title: 'Set Pickup & Drop',
    description: 'Choose your starting point and destination in seconds.',
    icon: FaMapMarkedAlt,
  },
  {
    title: 'Select Date & Car',
    description: 'Pick your schedule and find the car that matches your budget.',
    icon: FaCalendarCheck,
  },
  {
    title: 'Confirm & Rent',
    description: 'Book instantly and track your rental with reliable updates.',
    icon: FaRoute,
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Daily Commuter',
    quote: 'The booking process is super fast and drivers are always on time.',
  },
  {
    name: 'Aman Mehta',
    role: 'Business Traveler',
    quote: 'Transparent pricing and clean cars every time. Exactly what I needed.',
  },
  {
    name: 'Riya Verma',
    role: 'Student',
    quote: 'Safe rentals at student-friendly prices. Support team is genuinely helpful.',
  },
];

const HomePage: React.FC = () => {
  const [estimator, setEstimator] = useState({
    distanceKm: 12,
    durationMinutes: 35,
    farePerKm: 14,
    farePerHour: 240,
  });

  const handleSearch = () => {
    // Handle search here
  };

  const estimatedFare = useMemo(() => {
    const distanceCost = estimator.distanceKm * estimator.farePerKm;
    const timeCost = (estimator.durationMinutes / 60) * estimator.farePerHour;
    return Math.round(distanceCost + timeCost);
  }, [estimator]);

  const today = new Date();
  const currentHour = today.getHours();
  const etaLabel = currentHour >= 8 && currentHour <= 11 ? 'Busy traffic window' : 'Smooth traffic window';

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content section-container">
          <span className="hero-chip">Smart City Mobility</span>
          <h1>Book smart. Rent right. Reach faster.</h1>
          <p>Plan car rentals in seconds with transparent fares and verified drivers.</p>

          <div className="hero-actions">
            <Link to="/cabs" className="hero-btn primary">Explore Cars</Link>
            <Link to="/bookings" className="hero-btn ghost">Track Bookings</Link>
          </div>

          <div className="hero-features">
            <div className="feature">
              <FaBolt className="feature-icon" />
              <span>Fast Booking</span>
            </div>
            <div className="feature">
              <FaRupeeSign className="feature-icon" />
              <span>Best Prices</span>
            </div>
            <div className="feature">
              <FaStar className="feature-icon" />
              <span>Professional Drivers</span>
            </div>
            <div className="feature">
              <FaShieldAlt className="feature-icon" />
              <span>Safe & Secure</span>
            </div>
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="section-container">
          <h2>Find Your Perfect Rental Car</h2>
          <SearchForm onSearch={handleSearch} />
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid section-container">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="estimator-section">
        <div className="section-container estimator-grid">
          <div className="estimator-panel">
            <h2><FaCalculator /> Quick Fare Estimator</h2>
            <p>Adjust trip values to preview expected rental fare before booking.</p>

            <label>
              Distance: {estimator.distanceKm} km
              <input
                type="range"
                min="2"
                max="60"
                value={estimator.distanceKm}
                onChange={(event) =>
                  setEstimator((prev) => ({ ...prev, distanceKm: Number(event.target.value) }))
                }
              />
            </label>

            <label>
              Duration: {estimator.durationMinutes} min
              <input
                type="range"
                min="10"
                max="180"
                value={estimator.durationMinutes}
                onChange={(event) =>
                  setEstimator((prev) => ({ ...prev, durationMinutes: Number(event.target.value) }))
                }
              />
            </label>

            <label>
              Per km: Rs. {estimator.farePerKm}
              <input
                type="range"
                min="8"
                max="30"
                value={estimator.farePerKm}
                onChange={(event) =>
                  setEstimator((prev) => ({ ...prev, farePerKm: Number(event.target.value) }))
                }
              />
            </label>
          </div>

          <aside className="estimator-result">
            <p className="eyebrow">Estimated Trip Fare</p>
            <h3>Rs. {estimatedFare}</h3>
            <p className="meta"><FaClock /> {etaLabel}</p>
            <ul>
              <li>Distance charge: Rs. {estimator.distanceKm * estimator.farePerKm}</li>
              <li>Time charge: Rs. {Math.round((estimator.durationMinutes / 60) * estimator.farePerHour)}</li>
              <li>No hidden booking fee</li>
            </ul>
            <Link to="/cabs" className="hero-btn primary full">Book This Car</Link>
          </aside>
        </div>
      </section>

      <section className="steps-section">
        <div className="section-container">
          <h2>How CarRental Works</h2>
          <div className="steps-grid">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="step-card" key={step.title}>
                  <div className="step-header">
                    <span className="step-number">0{index + 1}</span>
                    <Icon className="step-icon" />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="section-container">
          <h2>Why Choose CarRental?</h2>

          <div className="info-grid">
            <div className="info-card">
              <FaCar className="info-icon" />
              <h3>Wide Selection</h3>
              <p>Choose from our fleet of well-maintained vehicles for every occasion</p>
            </div>

            <div className="info-card">
              <FaUserTie className="info-icon" />
              <h3>Expert Drivers</h3>
              <p>Professional drivers who know the city inside out</p>
            </div>

            <div className="info-card">
              <FaTags className="info-icon" />
              <h3>Transparent Pricing</h3>
              <p>No hidden charges. What you see is what you pay</p>
            </div>

            <div className="info-card">
              <FaHeadset className="info-icon" />
              <h3>24/7 Support</h3>
              <p>Our customer support team is always available</p>
            </div>

            <div className="info-card">
              <FaLock className="info-icon" />
              <h3>Secure Payment</h3>
              <p>Multiple secure payment options available</p>
            </div>

            <div className="info-card">
              <FaStar className="info-icon" />
              <h3>Top Rated</h3>
              <p>Trusted by thousands of happy customers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-container">
          <h2>What Customers Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <article className="testimonial-card" key={testimonial.name}>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <h4>{testimonial.name}</h4>
                <span>{testimonial.role}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;



