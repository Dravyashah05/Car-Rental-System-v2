# Leaflet Maps Integration Guide

## Overview
Leaflet maps have been successfully integrated into the Cab Rental App with OpenStreetMap tiles and a consistent purple/gold theme matching the existing UI design.

## Components Added/Updated

### 1. MapComponent.tsx
**Location:** `src/components/MapComponent.tsx`

**Features:**
- Interactive map with OpenStreetMap tiles
- Custom emoji markers for pickup (📍) and dropoff (📌) locations
- Route visualization with dashed purple polylines
- Auto-fit bounds to show both markers
- Popup labels showing location names
- Supports both string location names and coordinate objects

**Usage:**
```tsx
<MapComponent
  pickupLocation="New York"
  dropoffLocation="Times Square"
  height="400px"
  showRoute={true}
/>
```

**Location Database:**
The component includes 8 sample locations:
- New York
- Times Square
- Central Park
- Brooklyn
- Queens
- Manhattan
- Midtown
- Downtown

Custom locations can be added by updating the `locationCoordinates` object in the component.

### 2. LocationPicker.tsx
**Location:** `src/components/LocationPicker.tsx`

**Features:**
- Location search with dropdown suggestions
- 10 popular predefined locations with emoji indicators
- Clear button for quick reset
- Click-outside detection to close dropdown
- Visual feedback for selected locations
- Responsive design

**Popular Locations:**
- 🗽 New York
- ✨ Times Square
- 🌳 Central Park
- 🏙️ Brooklyn
- 🏢 Queens
- 🗼 Manhattan
- 🌃 Midtown
- 📍 Downtown
- 💼 Wall Street
- ✈️ Airport

### 3. LocationInput.tsx (Updated)
**Location:** `src/components/LocationInput.tsx`

**Changes:**
- Replaced Google Maps Autocomplete with LocationPicker component
- Removed dependency on @react-google-maps/api
- Maintains same interface for backward compatibility

### 4. BookingPage.tsx (Updated)
**Location:** `src/pages/BookingPage.tsx`

**Changes:**
- Added MapComponent import
- Displays map preview when both pickup and dropoff locations are entered
- Map section spans full width for better visibility
- Location display under cab summary

### Styling Files

#### Map.css
**Location:** `src/styles/Map.css`

**Features:**
- Custom marker styling with bounce animation
- Themed popups matching app purple/gold palette
- Custom zoom controls
- Responsive leaflet controls
- Dark mode support
- 250+ lines of comprehensive styling

Key Classes:
- `.map-container` - Main container
- `.custom-marker` - Base marker styling
- `.pickup-marker` - Green pickup marker
- `.dropoff-marker` - Red dropoff marker
- `.marker-popup` - Popup styling
- `.bounce-marker` - Bounce animation

#### LocationPicker.css
**Location:** `src/styles/LocationPicker.css`

**Features:**
- Modern input styling with purple focus state
- Dropdown suggestions with hover effects
- Clear button with smooth transitions
- Selected location indicator
- Responsive design for mobile/tablet
- Custom scrollbar styling
- 180+ lines of styling

Key Classes:
- `.location-picker` - Main container
- `.location-input` - Text input field
- `.suggestions-dropdown` - Suggestions list
- `.suggestion-item` - Individual suggestion
- `.swap-button` - Location swap button
- `.selected-location` - Selected location display

#### BookingPage.css (Updated)
**Location:** `src/styles/BookingPage.css`

**Changes:**
- Added `.map-section` styling
- Map section spans full grid width
- Consistent theming with app colors
- Responsive adjustments for mobile

## Theme Colors
All map components use the app's established color scheme:

- **Primary Purple:** #667eea
- **Secondary Purple:** #764ba2
- **Accent Gold:** #ffd700
- **Dark Background:** #081a33, #0f2a4a
- **Light Text:** #eaf4ff
- **Borders:** rgba(255, 255, 255, 0.15)

## Dependencies Added

### package.json Updates
```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "react-icons": "^5.0.1"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.11"
  }
}
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `leaflet` - Core mapping library
- `react-leaflet` - React bindings for Leaflet
- `react-icons` - Icon library (already included)
- `@types/leaflet` - TypeScript definitions

### 2. Import Leaflet CSS
Leaflet CSS is automatically imported in `MapComponent.tsx`:
```tsx
import 'leaflet/dist/leaflet.css';
```

### 3. Use in Pages
```tsx
import MapComponent from '../components/MapComponent';

// In your component
<MapComponent
  pickupLocation={pickupLocation}
  dropoffLocation={dropoffLocation}
/>
```

## Features

### Location Search
- Type to search from predefined locations
- Click suggestions to auto-fill
- Clear button for quick reset
- Shows all locations when input is empty

### Map Display
- Real-time map updates as locations change
- Custom markers with emojis
- Route visualization with polylines
- Automatic bounds fitting
- Responsive height adjustment

### User Experience
- Consistent with existing app theme
- Smooth animations and transitions
- Mobile-friendly design
- Accessibility considerations

## Customization

### Add New Locations
Edit `locationCoordinates` in `MapComponent.tsx`:
```tsx
const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  'New York': { lat: 40.7128, lng: -74.006 },
  'Your City': { lat: YOUR_LAT, lng: YOUR_LNG },
  // Add more...
};
```

### Change Map Colors
Edit `.custom-marker` styles in `Map.css` or update the theme colors in components.

### Adjust Marker Icons
Modify the HTML content in `MapComponent.tsx`:
```tsx
html: `<div class="marker-inner">🚕</div>` // Change emoji
```

### Modify Popup Content
Update popup content in the marker creation:
```tsx
.bindPopup(`<div class="marker-popup">Custom Content</div>`)
```

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 10+)
- Mobile browsers: Full support

## Performance
- Lightweight: Leaflet ~40KB gzipped
- Efficient: Only renders visible tiles
- Responsive: Automatic recalculation on resize
- Optimized: Debounced map updates

## Troubleshooting

### Map Not Showing
1. Ensure leaflet CSS is imported
2. Check that container has a height
3. Verify location data is correct

### Markers Not Displaying
1. Check map center coordinates
2. Ensure Leaflet CSS is loaded
3. Verify marker icons are valid

### Suggestions Not Working
1. Check popularLocations array in LocationPicker
2. Verify input change handlers
3. Check dropdown z-index in CSS

## Future Enhancements
- Real geocoding integration (Google Maps API, OpenCage)
- Real-time traffic layer
- Multiple route options
- Estimated fare display on map
- Driver location tracking
- Turn-by-turn navigation
- Location history
- Saved favorite locations

## Notes
- Current implementation uses sample locations for demo
- For production, integrate with real geocoding APIs
- Consider adding address validation
- Implement location caching for performance
- Add error handling for location lookups
