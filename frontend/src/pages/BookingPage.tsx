import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaChair,
  FaClock,
  FaGasPump,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaRoad,
  FaStar,
} from 'react-icons/fa';
import MapComponent from '../components/MapComponent';
import MapPicker from '../components/MapPicker';
import NearbyCars from '../components/NearbyCars';
import LocationPickerSimple from '../components/LocationPickerSimple';
import { cabService } from '../services/cabService';
import type { Cab } from '../types';
import {
  formatCoords,
  getDistanceKm,
  getNearestLocationName,
  resolveLocationInput,
  type GeoPoint,
} from '../utils/geo';
import '../styles/BookingPage.css';

const BookingPage: React.FC = () => {
  const { cabId } = useParams<{ cabId: string }>();
  const navigate = useNavigate();

  const [cab, setCab] = useState<Cab | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMapTarget, setActiveMapTarget] = useState<'pickup' | 'dropoff'>('pickup');
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [pickupHint, setPickupHint] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '',
    estimatedDistance: 10,
    estimatedDuration: 30,
  });

  useEffect(() => {
    const loadCab = async () => {
      if (cabId) {
        const data = await cabService.getCabById(cabId);
        setCab(data);
      }
      setLoading(false);
    };
    loadCab();
  }, [cabId]);

  const totalPrice = useMemo(() => {
    if (!cab) return 0;
    return cabService.calculatePrice(
      cab.pricePerKm,
      cab.pricePerHour,
      formData.estimatedDistance,
      formData.estimatedDuration
    );
  }, [cab, formData.estimatedDistance, formData.estimatedDuration]);

  const pickupPoint = useMemo(
    () => resolveLocationInput(formData.pickupLocation),
    [formData.pickupLocation]
  );

  const dropoffPoint = useMemo(
    () => resolveLocationInput(formData.dropoffLocation),
    [formData.dropoffLocation]
  );

  useEffect(() => {
    if (pickupPoint && dropoffPoint) {
      const dist = getDistanceKm(pickupPoint, dropoffPoint);
      const roundedDist = Math.max(1, Math.round(dist));
      // Assume 2.5 mins per km as a balanced city/highway average
      const duration = Math.round(roundedDist * 2.5);

      setFormData((prev) => ({
        ...prev,
        estimatedDistance: roundedDist,
        estimatedDuration: duration,
      }));
    }
  }, [pickupPoint, dropoffPoint]);

  const handleMapSelect = useCallback((type: 'pickup' | 'dropoff', point: GeoPoint) => {
    const label = point.name ?? formatCoords(point.lat, point.lng);
    setFormData((prev) => ({
      ...prev,
      [type === 'pickup' ? 'pickupLocation' : 'dropoffLocation']: label,
    }));
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }
    setIsLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coordsLabel = formatCoords(latitude, longitude);
        setFormData((prev) => ({ ...prev, pickupLocation: coordsLabel }));
        setPickupHint(`Near ${getNearestLocationName(latitude, longitude)}`);
        setIsLocating(false);
      },
      (error) => {
        setGeoError(error.message || 'Unable to fetch your location.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('Distance') || name.includes('Duration') ? Number(value) : value,
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.pickupLocation) e.pickupLocation = 'Pickup required';
    if (!formData.dropoffLocation) e.dropoffLocation = 'Dropoff required';
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cab) return;
    const ok = validate();
    if (!ok) return;

    const bookingPayload = {
      cabId: cab.id,
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      estimatedDistance: formData.estimatedDistance,
      estimatedDuration: formData.estimatedDuration,
      totalPrice,
      paymentMethod: 'pending',
      paymentStatus: 'pending',
    } as const;

    navigate('/payments', { state: { bookingPayload, totalPrice } });
  };

  if (loading) return <div className="loading">Loading car details...</div>;
  if (!cab) return <div className="error">Car not found</div>;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-page-header">
          <h1>Book Your Car</h1>
          <p>Set your route, choose date and time, and continue to secure payment.</p>
        </div>

        <div className="booking-content">
          <div className="left-column">
            {formData.pickupLocation && formData.dropoffLocation && (
              <div className="map-section panel-card">
                <h3>Trip Preview</h3>
                <MapComponent
                  pickupLocation={formData.pickupLocation}
                  dropoffLocation={formData.dropoffLocation}
                />
              </div>
            )}

            <div className="map-select panel-card">
              <div className="map-select-header">
                <div>
                  <h3>Choose on map</h3>
                  <p>Click the map to set the active point.</p>
                </div>
                <div className="map-toggle">
                  <button
                    type="button"
                    className={activeMapTarget === 'pickup' ? 'active' : ''}
                    onClick={() => setActiveMapTarget('pickup')}
                  >
                    Pickup
                  </button>
                  <button
                    type="button"
                    className={activeMapTarget === 'dropoff' ? 'active' : ''}
                    onClick={() => setActiveMapTarget('dropoff')}
                  >
                    Dropoff
                  </button>
                </div>
              </div>
              <MapPicker
                pickup={pickupPoint}
                dropoff={dropoffPoint}
                activeType={activeMapTarget}
                onSelect={handleMapSelect}
              />
              <div className="map-select-footer">
                <div>
                  <span className="map-label">Pickup</span>
                  <strong>{formData.pickupLocation || 'Not set'}</strong>
                </div>
                <div>
                  <span className="map-label">Dropoff</span>
                  <strong>{formData.dropoffLocation || 'Not set'}</strong>
                </div>
              </div>
            </div>

            <div className="cab-summary panel-card">
              <div className="cab-media">
                <img src={cab.image} alt={cab.model} className="cab-image" />
                <div className="cab-badges">
                  <span className="cab-badge rating">
                    <FaStar /> {cab.rating}
                  </span>
                  <span className="cab-badge price">Rs. {cab.pricePerKm}/km</span>
                  <span className="cab-badge price">Rs. {cab.pricePerHour}/hr</span>
                </div>
              </div>
              <div className="cab-info">
                <div className="cab-title-row">
                  <h2>
                    {cab.make} {cab.model}
                  </h2>
                  <span className="license-pill">{cab.licensePlate}</span>
                </div>

                <div className="cab-stats">
                  <div className="stat">
                    <FaChair /> <span>{cab.seats} Seats</span>
                  </div>
                  <div className="stat">
                    <FaGasPump /> <span>{cab.fuelType}</span>
                  </div>
                </div>

                <div className="cab-pricing">
                  <div className="price-item">
                    <span>Per km</span>
                    <strong>Rs. {cab.pricePerKm}</strong>
                  </div>
                  <div className="price-item">
                    <span>Per hour</span>
                    <strong>Rs. {cab.pricePerHour}</strong>
                  </div>
                </div>
              </div>
            </div>

            <NearbyCars pickupLocation={formData.pickupLocation} currentCabId={cab.id} />
          </div>

          <form className="booking-form panel-card" onSubmit={handleSubmit}>
            <div className="booking-form-head">
              <h3>Trip Details</h3>
              <span>Estimated fare</span>
            </div>
            <div className="booking-total-pill">
              <span>Total</span>
              <strong>Rs. {totalPrice.toFixed(2)}</strong>
            </div>

            <div className="form-group full-width">
              <div className="field-head">
                <label>
                  <FaMapMarkerAlt /> Pickup Location
                </label>
                <button
                  type="button"
                  className="geo-btn"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                >
                  {isLocating ? 'Locating...' : 'Use my location'}
                </button>
              </div>
              <LocationPickerSimple
                value={formData.pickupLocation}
                onChange={(val: string) => {
                  setFormData((prev) => ({ ...prev, pickupLocation: val }));
                  setGeoError(null);
                  setPickupHint(null);
                }}
                placeholder="Enter pickup location"
              />
              {pickupHint ? <span className="field-hint">{pickupHint}</span> : null}
              {geoError ? <span className="field-hint error">{geoError}</span> : null}
            </div>

            <div className="form-group full-width">
              <label>
                <FaMapMarkerAlt /> Dropoff Location
              </label>
              <LocationPickerSimple
                value={formData.dropoffLocation}
                onChange={(val: string) => setFormData((prev) => ({ ...prev, dropoffLocation: val }))}
                placeholder="Enter dropoff location"
              />
            </div>

            <div className="form-group">
              <label>
                <FaCalendarAlt /> Pickup Date
              </label>
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
                min={today}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FaClock /> Pickup Time
              </label>
              <input
                type="time"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FaRoad /> Estimated Distance (km)
              </label>
              <input
                type="number"
                name="estimatedDistance"
                value={formData.estimatedDistance}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FaHourglassHalf /> Estimated Duration (minutes)
              </label>
              <input
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="price-breakdown">
              <h3>Price Breakdown</h3>

              <div className="breakdown-row">
                <span>Distance Cost</span>
                <span>Rs. {(formData.estimatedDistance * cab.pricePerKm).toFixed(2)}</span>
              </div>

              <div className="breakdown-row">
                <span>Time Cost</span>
                <span>Rs. {((formData.estimatedDuration / 60) * cab.pricePerHour).toFixed(2)}</span>
              </div>

              <div className="breakdown-row total">
                <span>Total</span>
                <span>Rs. {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button className="confirm-btn">Continue to Payment</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
