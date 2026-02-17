import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchForm.css';

interface SearchFormProps {
  onSearch: (filters: {
    pickup: string;
    dropoff: string;
    date: string;
    time: string;
    distance: number;
  }) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    distance: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'distance' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pickup && formData.dropoff && formData.date && formData.time) {
      onSearch(formData);
      navigate('/cabs');
    } else {
      alert('Please fill all fields');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="pickup">📍 Pickup Location</label>
        <input
          id="pickup"
          type="text"
          name="pickup"
          value={formData.pickup}
          onChange={handleChange}
          placeholder="Enter pickup location"
        />
      </div>

      <div className="form-group">
        <label htmlFor="dropoff">📍 Dropoff Location</label>
        <input
          id="dropoff"
          type="text"
          name="dropoff"
          value={formData.dropoff}
          onChange={handleChange}
          placeholder="Enter dropoff location"
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">📅 Date</label>
        <input
          id="date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={today}
        />
      </div>

      <div className="form-group">
        <label htmlFor="time">⏰ Time</label>
        <input
          id="time"
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="distance">📏 Estimated Distance (km)</label>
        <input
          id="distance"
          type="number"
          name="distance"
          value={formData.distance}
          onChange={handleChange}
          min="1"
          step="1"
        />
      </div>

      <button type="submit" className="search-btn">
        Search Cabs
      </button>
    </form>
  );
};

export default SearchForm;
