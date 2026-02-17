import React, { useState } from 'react';
import '../styles/LocationPicker.css';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: Location, type: 'pickup' | 'dropoff') => void;
  selectedPickup?: Location;
  selectedDropoff?: Location;
}

const POPULAR_LOCATIONS: Location[] = [
  { lat: 40.7128, lng: -74.006, name: 'New York City' },
  { lat: 40.758, lng: -73.9855, name: 'Times Square' },
  { lat: 40.7489, lng: -73.968, name: 'Grand Central Terminal' },
  { lat: 40.7505, lng: -73.9972, name: 'Central Park' },
  { lat: 40.7614, lng: -73.9776, name: 'Upper East Side' },
  { lat: 40.7614, lng: -73.9776, name: 'Upper West Side' },
  { lat: 40.7282, lng: -74.0076, name: 'World Trade Center' },
  { lat: 40.7549, lng: -73.977, name: 'Rockefeller Center' },
  { lat: 40.7549, lng: -73.9745, name: 'Midtown Manhattan' },
  { lat: 40.6894, lng: -74.0447, name: 'Brooklyn Bridge' },
];

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  selectedPickup,
  selectedDropoff,
}) => {
  const [searchPickup, setSearchPickup] = useState('');
  const [searchDropoff, setSearchDropoff] = useState('');
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  const filterLocations = (query: string) => {
    return POPULAR_LOCATIONS.filter((loc) =>
      loc.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handlePickupSelect = (location: Location) => {
    setSearchPickup(location.name);
    setShowPickupSuggestions(false);
    onLocationSelect(location, 'pickup');
  };

  const handleDropoffSelect = (location: Location) => {
    setSearchDropoff(location.name);
    setShowDropoffSuggestions(false);
    onLocationSelect(location, 'dropoff');
  };

  return (
    <div className="location-picker">
      <div className="location-picker-section">
        <label htmlFor="pickup-input">📍 Pickup Location</label>
        <div className="location-input-wrapper">
          <input
            id="pickup-input"
            type="text"
            placeholder="Enter pickup location"
            value={searchPickup}
            onChange={(e) => {
              setSearchPickup(e.target.value);
              setShowPickupSuggestions(true);
            }}
            onFocus={() => setShowPickupSuggestions(true)}
            className="location-input"
          />
          {searchPickup && (
            <button
              className="clear-btn"
              onClick={() => {
                setSearchPickup('');
                setShowPickupSuggestions(false);
              }}
              aria-label="Clear pickup location"
            >
              ✕
            </button>
          )}
          {showPickupSuggestions && (
            <div className="suggestions-dropdown">
              {filterLocations(searchPickup).length > 0 ? (
                filterLocations(searchPickup).map((location, index) => (
                  <button
                    key={index}
                    className="suggestion-item"
                    onClick={() => handlePickupSelect(location)}
                  >
                    <span className="icon">📍</span>
                    <div className="location-info">
                      <div className="location-name">{location.name}</div>
                      <div className="location-coords">
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="no-suggestions">No locations found</div>
              )}
            </div>
          )}
        </div>
        {selectedPickup && (
          <div className="selected-location">
            ✓ {selectedPickup.name}
          </div>
        )}
      </div>

      <div className="swap-button">
        <button
          onClick={() => {
            setSearchPickup(searchDropoff);
            setSearchDropoff(searchPickup);
          }}
          aria-label="Swap locations"
          title="Swap pickup and dropoff"
        >
          ⇄
        </button>
      </div>

      <div className="location-picker-section">
        <label htmlFor="dropoff-input">📌 Dropoff Location</label>
        <div className="location-input-wrapper">
          <input
            id="dropoff-input"
            type="text"
            placeholder="Enter dropoff location"
            value={searchDropoff}
            onChange={(e) => {
              setSearchDropoff(e.target.value);
              setShowDropoffSuggestions(true);
            }}
            onFocus={() => setShowDropoffSuggestions(true)}
            className="location-input"
          />
          {searchDropoff && (
            <button
              className="clear-btn"
              onClick={() => {
                setSearchDropoff('');
                setShowDropoffSuggestions(false);
              }}
              aria-label="Clear dropoff location"
            >
              ✕
            </button>
          )}
          {showDropoffSuggestions && (
            <div className="suggestions-dropdown">
              {filterLocations(searchDropoff).length > 0 ? (
                filterLocations(searchDropoff).map((location, index) => (
                  <button
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleDropoffSelect(location)}
                  >
                    <span className="icon">📌</span>
                    <div className="location-info">
                      <div className="location-name">{location.name}</div>
                      <div className="location-coords">
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="no-suggestions">No locations found</div>
              )}
            </div>
          )}
        </div>
        {selectedDropoff && (
          <div className="selected-location">
            ✓ {selectedDropoff.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
