import React, { useState, useEffect } from 'react';
import { cabService } from '../services/cabService';
import CabCard from '../components/CabCard';
import type { Cab } from '../types';
import '../styles/CabsPage.css';

const CabsPage: React.FC = () => {
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [filteredCabs, setFilteredCabs] = useState<Cab[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    maxPrice: 50,
    minRating: 0,
    seats: 0,
  });

  useEffect(() => {
    const loadCabs = async () => {
      const allCabs = await cabService.getAllCabs();
      setCabs(allCabs);
      setFilteredCabs(allCabs);
      setLoading(false);
    };
    loadCabs();
  }, []);

  useEffect(() => {
    const applyFilters = async () => {
      const filtered = await cabService.searchCabs(filters);
      setFilteredCabs(filtered);
    };
    applyFilters();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  if (loading) {
    return <div className="loading">Loading cabs...</div>;
  }

  return (
    <div className="cabs-page">
      <div className="cabs-container">
        <h1>Browse Available Cabs</h1>

        <div className="cabs-content">
          <div className="filters-sidebar">
            <h2>Filters</h2>

            <div className="filter-group">
              <label htmlFor="maxPrice">Max Price per km: ₹{filters.maxPrice}</label>
              <input
                id="maxPrice"
                type="range"
                name="maxPrice"
                min="5"
                max="50"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
              <span className="range-value">₹{filters.maxPrice}</span>
            </div>

            <div className="filter-group">
              <label htmlFor="minRating">Min Rating: {filters.minRating.toFixed(1)}</label>
              <input
                id="minRating"
                type="range"
                name="minRating"
                min="0"
                max="5"
                step="0.1"
                value={filters.minRating}
                onChange={handleFilterChange}
              />
              <span className="range-value">{filters.minRating.toFixed(1)} ⭐</span>
            </div>

            <div className="filter-group">
              <label htmlFor="seats">Min Seats: {filters.seats}</label>
              <input
                id="seats"
                type="range"
                name="seats"
                min="0"
                max="7"
                value={filters.seats}
                onChange={handleFilterChange}
              />
              <span className="range-value">{filters.seats} seats</span>
            </div>
          </div>

          <div className="cabs-grid">
            {filteredCabs.length > 0 ? (
              filteredCabs.map((cab) => <CabCard key={cab.id} cab={cab} />)
            ) : (
              <div className="no-results">
                <p>No cabs found matching your criteria.</p>
                <p>Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>

        <div className="cabs-stats">
          <p>Total Cabs Available: {cabs.length}</p>
          <p>Matching Your Filters: {filteredCabs.length}</p>
        </div>
      </div>
    </div>
  );
};

export default CabsPage;
