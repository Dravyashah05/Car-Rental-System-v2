import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Map.css';

interface MapProps {
  pickupLocation?: string | { lat: number; lng: number; name: string };
  dropoffLocation?: string | { lat: number; lng: number; name: string };
  height?: string;
  showRoute?: boolean;
}

// Sample location coordinates for demo
const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  'New York': { lat: 40.7128, lng: -74.006 },
  'Times Square': { lat: 40.758, lng: -73.9855 },
  'Central Park': { lat: 40.7829, lng: -73.9654 },
  'Brooklyn': { lat: 40.6501, lng: -73.9496 },
  'Queens': { lat: 40.7282, lng: -73.7949 },
  'Manhattan': { lat: 40.7831, lng: -73.9712 },
  'Midtown': { lat: 40.7555, lng: -73.9776 },
  'Downtown': { lat: 40.7061, lng: -74.0088 },
};

const getLocationCoordinates = (location: string | { lat: number; lng: number; name: string }) => {
  if (typeof location === 'string') {
    const key = Object.keys(locationCoordinates).find(k => 
      k.toLowerCase() === location.toLowerCase() || 
      location.toLowerCase().includes(k.toLowerCase())
    );
    if (key) {
      return { ...locationCoordinates[key], name: location };
    }
    // Return approximate random location if not found
    return {
      lat: 40.7128 + (Math.random() - 0.5) * 0.2,
      lng: -74.006 + (Math.random() - 0.5) * 0.2,
      name: location,
    };
  }
  return location;
};

const MapComponent: React.FC<MapProps> = ({
  pickupLocation = 'New York',
  dropoffLocation = 'Times Square',
  height = '400px',
  showRoute = true,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const pickup = getLocationCoordinates(pickupLocation);
    const dropoff = getLocationCoordinates(dropoffLocation);

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(
        [pickup.lat, pickup.lng],
        13
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Clear existing markers and polylines
    mapRef.current.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add pickup marker (green)
    const pickupIcon = L.divIcon({
      className: 'custom-marker pickup-marker',
      html: `<div class="marker-inner">📍</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
      .bindPopup(`<div class="marker-popup"><strong>Pickup</strong><br>${pickup.name}</div>`)
      .addTo(mapRef.current!)
      .openPopup();

    // Add dropoff marker (red)
    const dropoffIcon = L.divIcon({
      className: 'custom-marker dropoff-marker',
      html: `<div class="marker-inner">📌</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon })
      .bindPopup(`<div class="marker-popup"><strong>Dropoff</strong><br>${dropoff.name}</div>`)
      .addTo(mapRef.current!)
      .openPopup();

    // Draw route line if enabled
    if (showRoute) {
      L.polyline(
        [
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ],
        {
          color: '#667eea',
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 5',
        }
      ).addTo(mapRef.current!);
    }

    // Fit bounds to show both markers
    const group = new L.FeatureGroup([
      L.marker([pickup.lat, pickup.lng]),
      L.marker([dropoff.lat, dropoff.lng]),
    ]);
    mapRef.current?.fitBounds(group.getBounds().pad(0.1));

    return () => {
      // Cleanup on unmount
    };
  }, [pickupLocation, dropoffLocation, showRoute]);

  return (
    <div className="map-container" style={{ height }}>
      <div ref={containerRef} className="map-wrapper" />
    </div>
  );
};

export default MapComponent;
