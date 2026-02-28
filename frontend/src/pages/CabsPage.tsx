import React, { useEffect, useMemo, useState } from 'react';
import { cabService } from '../services/cabService';
import CabCard from '../components/CabCard';
import type { Cab } from '../types';
import '../styles/CabsPage.css';

const CabsPage: React.FC = () => {
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [filteredCabs, setFilteredCabs] = useState<Cab[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'rating-high'>('recommended');
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

  const visibleCabs = useMemo(() => {
    const clone = [...filteredCabs];

    if (sortBy === 'price-low') {
      clone.sort((a, b) => a.pricePerKm - b.pricePerKm);
    }

    if (sortBy === 'rating-high') {
      clone.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === 'recommended') {
      clone.sort((a, b) => Number(b.available) - Number(a.available) || b.rating - a.rating);
    }

    return clone;
  }, [filteredCabs, sortBy]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  if (loading) {
    return <div className="loading">Loading cars...</div>;
  }

  return (
    <div className="cabs-page">
      <div className="cabs-container">
        <header className="cabs-header">
          <h1>Browse Available Cars</h1>
          <p>Use smart filters and sort to find the right rental car for your trip.</p>
        </header>

        <div className="cabs-content">
          <aside className="filters-sidebar">
            <div className="filters-head">
              <h2>Filters</h2>
              <span>{visibleCabs.length} shown</span>
            </div>

            <div className="filter-group">
              <label htmlFor="maxPrice">Max Price per km: Rs. {filters.maxPrice}</label>
              <input
                id="maxPrice"
                type="range"
                name="maxPrice"
                min="5"
                max="50"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
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
            </div>

            <div className="filter-group">
              <label htmlFor="sortBy">Sort by</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="rating-high">Rating: High to Low</option>
              </select>
            </div>
          </aside>

          <div className="cabs-grid">
            {visibleCabs.length > 0 ? (
              visibleCabs.map((cab) => <CabCard key={cab.id} cab={cab} />)
            ) : (
              <div className="no-results">
                <p>No cars found matching your criteria.</p>
                <p>Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>

        <div className="cabs-stats">
          <p>Total Available Cars: {cabs.length}</p>
          <p>Matching Filters: {visibleCabs.length}</p>
        </div>
      </div>
    </div>
  );
};

export default CabsPage;



