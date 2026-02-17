import React from 'react';
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
} from 'react-icons/fa';
import SearchForm from '../components/SearchForm';
import '../styles/HomePage.css';

const stats = [
  { label: 'Happy Riders', value: '25K+' },
  { label: 'Daily Trips', value: '4.8K+' },
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
    description: 'Pick your schedule and find the cab that matches your budget.',
    icon: FaCalendarCheck,
  },
  {
    title: 'Confirm & Ride',
    description: 'Book instantly and track your ride with reliable updates.',
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
    quote: 'Safe rides at student-friendly prices. Support team is genuinely helpful.',
  },
];

const HomePage: React.FC = () => {
  const handleSearch = () => {
    // Handle search here
  };

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content section-container">
          <h1>Welcome to CityRide</h1>
          <p>Book your ride in minutes, travel with confidence</p>

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

      {/* SEARCH */}
      <section className="search-section">
        <div className="section-container">
          <h2>Find Your Perfect Ride</h2>
          <SearchForm onSearch={handleSearch} />
        </div>
      </section>

      {/* STATS */}
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

      {/* HOW IT WORKS */}
      <section className="steps-section">
        <div className="section-container">
          <h2>How CityRide Works</h2>
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

      {/* INFO */}
      <section className="info-section">
        <div className="section-container">
          <h2>Why Choose CityRide?</h2>

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

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="section-container">
          <h2>What Riders Say</h2>
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
