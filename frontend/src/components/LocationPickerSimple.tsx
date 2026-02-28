import React, { useState, useRef, useEffect } from 'react';
import '../styles/LocationPicker.css';
import locationsData from '../data/locations.json';

interface LocationPickerSimpleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const popularLocations = locationsData.popularLocations;

const LocationPickerSimple: React.FC<LocationPickerSimpleProps> = ({
  value,
  onChange,
  placeholder = 'Enter location',
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim() === '') {
      setSuggestions(popularLocations);
    } else {
      const filtered = popularLocations.filter((loc) =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="location-picker-simple" ref={containerRef}>
      <div className="location-picker-input-group">
        <input
          ref={inputRef}
          type="text"
          className="location-input-styled"
          placeholder={placeholder}
          value={value}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onClick={() => setShowSuggestions(true)}
        />

        {value && (
          <button
            type="button"
            className="clear-btn-simple"
            onClick={handleClear}
            title="Clear"
            aria-label="Clear location"
          >
            ×
          </button>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown-simple" role="listbox">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="suggestion-item-simple"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span className="suggestion-icon" aria-hidden="true">📍</span>
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPickerSimple;
