import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaChair, FaGasPump } from 'react-icons/fa';
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
        <span className={`availability-tag ${cab.available ? 'available' : 'unavailable'}`}>
          {cab.available ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <div className="cab-details">
        <div className="cab-title-row">
          <div className="cab-title-block">
            <h3>{`${cab.make} ${cab.model}`}</h3>
            <div className="cab-subline">
              <span className="cab-year">{cab.year}</span>
              <span className="cab-dot">•</span>
              <span className="cab-rating-inline">
                <FaStar /> {cab.rating}
              </span>
              <span className="cab-reviews">({cab.reviews} reviews)</span>
            </div>
          </div>
          <span className="price-chip">Rs. {cab.pricePerKm}/km</span>
        </div>
        <div className="cab-specs">
          <span className="spec">
            <FaChair /> {cab.seats} seats
          </span>
          <span className="spec">
            <FaGasPump /> {cab.fuelType}
          </span>
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
