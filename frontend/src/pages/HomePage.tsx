import React, { useMemo, useState } from 'react';
import {
  FaShieldAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRegMoneyBillAlt,
  FaRegComments,
  FaWallet,
  FaPiggyBank,
  FaClock,
  FaCheckCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import '../styles/HomePage.css';

const stats = [
  { label: 'Happy Customers', value: '150K+' },
  { label: 'Trusted Partners', value: '450+' },
  { label: 'Premium Fleet', value: '1,200+' },
  { label: 'Global Locations', value: '85+' },
];

const features = [
  {
    title: 'Transparent Pricing',
    description: 'No hidden fees. What you see is exactly what you pay at the counter.',
    icon: FaRegMoneyBillAlt,
  },
  {
    title: 'Fully Insured Vehicles',
    description: 'Every rental comes with comprehensive insurance coverage for your peace of mind.',
    icon: FaShieldAlt,
  },
  {
    title: '24/7 Roadside Assistance',
    description: 'We are always just a call away, whenever and wherever you need us.',
    icon: FaRegComments,
  },
];

const steps = [
  {
    title: 'Choose Location',
    description: 'Select your preferred pick-up and drop-off points from our extensive network.',
    icon: FaMapMarkerAlt,
  },
  {
    title: 'Select Dates',
    description: 'Enter your rental period and find the perfect vehicle for your schedule.',
    icon: FaCalendarAlt,
  },
  {
    title: 'Book Your Car',
    description: 'Confirm your reservation and enjoy a seamless key-handover experience.',
    icon: FaCheckCircle,
  },
];

const HomePage: React.FC = () => {
  const [estimator, setEstimator] = useState({
    distanceKm: 20,
    durationDays: 3,
    categoryMultiplier: 1.5,
  });

  const handleSearch = () => {
    // Handle search here
  };

  const estimatedFare = useMemo(() => {
    const baseRate = 800; // Base rate per day
    const distanceCost = estimator.distanceKm * 15;
    const daysCost = estimator.durationDays * baseRate * estimator.categoryMultiplier;
    return Math.round(distanceCost + daysCost);
  }, [estimator]);

  return (
    <div className="corporate-home">
      {/* Hero Section */}
      <section className="corporate-hero">
        <div className="section-container hero-grid">
          <div className="hero-text" data-animate>
            <span className="hero-badge">The Standard in Corporate Rentals</span>
            <h1 className="hero-title">Experience Premium Mobility.</h1>
            <p className="hero-subtitle">
              Whether for a business trip or a weekend getaway, discover our extensive fleet of meticulously maintained vehicles designed for your comfort and safety.
            </p>
            <div className="hero-buttons">
              <Link to="/cabs" className="btn-corporate primary">Browse Fleet</Link>
              <Link to="/bookings" className="btn-corporate secondary">Manage Reservation</Link>
            </div>
          </div>
          <div className="hero-image-box" data-animate data-delay="100">
            <img src="/hero_car.png" alt="Premium Luxury Sedan" className="hero-car-img" />
          </div>
        </div>
      </section>

      {/* Booking Widget */}
      <section className="booking-widget-section">
        <div className="section-container" data-animate>
          <div className="booking-widget">
            <h3>Start Your Reservation</h3>
            <SearchForm onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="corporate-features bg-light">
        <div className="section-container">
          <div className="section-header center" data-animate>
            <h2>Why Choose CarRental?</h2>
            <p>Our commitment to excellence sets us apart in the car rental industry.</p>
          </div>
          <div className="features-grid">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div className="feature-card" key={idx} data-animate data-delay={idx * 50}>
                  <div className="feature-icon-wrapper">
                    <Icon className="feature-icon" />
                  </div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="corporate-steps">
        <div className="section-container">
          <div className="section-header" data-animate>
            <h2>A Seamless Process</h2>
            <p>Booking a vehicle has never been this straightforward.</p>
          </div>
          <div className="steps-container">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div className="step-item" key={idx} data-animate data-delay={idx * 50}>
                  <div className="step-number">0{idx + 1}</div>
                  <div className="step-content">
                    <Icon className="step-icon" />
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="corporate-stats bg-dark">
        <div className="section-container stats-grid">
          {stats.map((stat, idx) => (
            <div className="stat-block" key={stat.label} data-animate data-delay={idx * 50}>
              <h2>{stat.value}</h2>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Estimator Section */}
      <section className="corporate-estimator bg-light">
        <div className="section-container">
          <div className="estimator-wrapper" data-animate>
            <div className="estimator-content">
              <h2>Quick Fare Estimator</h2>
              <p>Plan your budget ahead of time with our transparent estimating tool.</p>

              <div className="estimator-controls">
                <div className="slider-box">
                  <div className="slider-label">
                    <span>Est. Distance</span>
                    <strong>{estimator.distanceKm} km</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    className="corporate-slider"
                    value={estimator.distanceKm}
                    onChange={(e) => setEstimator(prev => ({ ...prev, distanceKm: Number(e.target.value) }))}
                  />
                </div>

                <div className="slider-box">
                  <div className="slider-label">
                    <span>Duration</span>
                    <strong>{estimator.durationDays} Days</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    className="corporate-slider"
                    value={estimator.durationDays}
                    onChange={(e) => setEstimator(prev => ({ ...prev, durationDays: Number(e.target.value) }))}
                  />
                </div>

                <div className="slider-box">
                  <div className="slider-label">
                    <span>Vehicle Class</span>
                    <strong>{estimator.categoryMultiplier === 1 ? 'Economy' : estimator.categoryMultiplier === 1.5 ? 'Business' : 'Luxury'}</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.5"
                    className="corporate-slider"
                    value={estimator.categoryMultiplier}
                    onChange={(e) => setEstimator(prev => ({ ...prev, categoryMultiplier: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <div className="estimator-summary">
              <h4>Estimated Total</h4>
              <h2 className="price-tag">Rs. {estimatedFare.toLocaleString()}</h2>
              <ul className="estimator-list">
                <li><FaWallet /> Transparent Fare Calculator</li>
                <li><FaPiggyBank /> Excellent Value for Money</li>
                <li><FaClock /> Flexible Return Times</li>
              </ul>
              <Link to="/cabs" className="btn-corporate primary full-width">Reserve Now</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
