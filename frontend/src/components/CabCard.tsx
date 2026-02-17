import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaChair, FaGasPump, FaCalendarAlt } from 'react-icons/fa';
import type { Cab } from '../types';
import '../styles/CabCard.css';

interface CabCardProps {
  cab: Cab;
}

const CabCard: React.FC<CabCardProps> = ({ cab }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleBookNow = () => {
    navigate(`/book/${cab.id}`);
  };

  return (
    <div className="cab-card">
      <div className="cab-image">
        {cab.image ? (
          <img
            src={cab.image}
            alt={`${cab.make} ${cab.model}`}
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0.5 }}
          />
        ) : (
          <div className="cab-image-fallback">
            <span>No image</span>
          </div>
        )}
        <div className="cab-image-overlay" />
        <div className="cab-badges">
          <span className={`status ${cab.available ? 'available' : 'unavailable'}`}>
            {cab.available ? 'Available' : 'Unavailable'}
          </span>
          <span className="badge rating">
            <FaStar /> {cab.rating}
          </span>
          <span className="badge price">Rs. {cab.pricePerKm}/km</span>
        </div>
      </div>
      <div className="cab-details">
        <div className="cab-title-row">
          <h3>{`${cab.make} ${cab.model}`}</h3>
          <span className="year-pill">{cab.year}</span>
        </div>
        <div className="cab-specs">
          <span className="spec">
            <FaChair /> {cab.seats} seats
          </span>
          <span className="spec">
            <FaGasPump /> {cab.fuelType}
          </span>
          <span className="spec">
            <FaCalendarAlt /> {cab.year}
          </span>
        </div>

        <div className="cab-rating">
          <span className="stars">
            <FaStar /> {cab.rating}
          </span>
          <span className="reviews">({cab.reviews} reviews)</span>
        </div>

        <div className="cab-pricing">
          <div className="price-item">
            <span className="label">Per km:</span>
            <span className="price">Rs. {cab.pricePerKm}</span>
          </div>
          <div className="price-item">
            <span className="label">Per hour:</span>
            <span className="price">Rs. {cab.pricePerHour}</span>
          </div>
        </div>

        <button
          className="book-btn"
          onClick={handleBookNow}
          disabled={!cab.available}
        >
          {cab.available ? 'Book Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
};

export default CabCard;
