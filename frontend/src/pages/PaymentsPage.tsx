import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCreditCard, FaLock, FaMobileAlt, FaWallet } from 'react-icons/fa';
import { cabService } from '../services/cabService';
import { useBooking } from '../context/BookingContext';
import '../styles/PaymentsPage.css';

interface LocationState {
  bookingPayload: {
    cabId: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    pickupTime: string;
    estimatedDistance: number;
    estimatedDuration: number;
    totalPrice: number;
  };
  totalPrice: number;
}

const PaymentsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addBooking } = useBooking();

  const state = location.state as LocationState | undefined;
  const payload = state?.bookingPayload;
  const price = state?.totalPrice ?? 0;

  const [formData, setFormData] = useState({
    paymentMethod: 'card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!payload) {
    return (
      <div className="payments-page">
        <div className="payments-empty">
          <h2>Payment details missing</h2>
          <p>Please select a car and continue from the booking form.</p>
          <Link to="/cabs" className="payments-empty-btn">
            Browse cars
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (formData.paymentMethod === 'card') {
      const cc = String(formData.cardNumber || '').replace(/\s+/g, '');
      const name = String(formData.cardName || '');
      const exp = String(formData.cardExpiry || '');
      const cvv = String(formData.cardCvv || '');
      if (!/^[0-9]{12,19}$/.test(cc)) e.cardNumber = 'Invalid card number';
      if (!name.trim()) e.cardName = 'Name required';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) e.cardExpiry = 'MM/YY';
      if (!/^[0-9]{3,4}$/.test(cvv)) e.cardCvv = 'Invalid CVV';
    }
    if (formData.paymentMethod === 'upi') {
      if (!/^[\w.-]{2,}@[\w.-]{2,}$/.test(formData.upiId.trim())) {
        e.upiId = 'Enter a valid UPI ID';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const booking = await cabService.createBooking(payload);
      addBooking(booking);
      navigate('/bookings', { state: { success: 'Booking confirmed!' } });
    } catch (err) {
      console.error(err);
      alert('Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payments-page">
      <div className="payments-container">
        <header className="payments-header">
          <div className="payments-badge">
            <FaLock />
          </div>
          <div>
            <h1>
              <FaCreditCard /> Secure Payment
            </h1>
            <p>Encrypted checkout for your car rental booking</p>
          </div>
        </header>

        <div className="payments-layout">
          <aside className="payments-summary">
            <h3>Booking Summary</h3>
            <div className="summary-amount">
              <span>Total payable</span>
              <strong>Rs. {price.toFixed(2)}</strong>
            </div>
            <div className="summary-details">
              <div className="row">
                <span>Pickup</span>
                <span>{payload?.pickupLocation || '-'}</span>
              </div>
              <div className="row">
                <span>Dropoff</span>
                <span>{payload?.dropoffLocation || '-'}</span>
              </div>
              <div className="row">
                <span>Date & time</span>
                <span>
                  {payload?.pickupDate} {payload?.pickupTime}
                </span>
              </div>
            </div>
            <div className="summary-safe">
              <FaCheckCircle />
              <span>Your payment details are protected with secure encryption.</span>
            </div>
          </aside>

          <form className="payments-form" onSubmit={handleSubmit}>
            <h3>Choose Payment Method</h3>
            <div className="method-grid">
              <button
                type="button"
                className={`method-card ${formData.paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => {
                  setFormData((p) => ({ ...p, paymentMethod: 'card' }));
                  setErrors({});
                }}
              >
                <FaCreditCard />
                <span>Card</span>
              </button>
              <button
                type="button"
                className={`method-card ${formData.paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => {
                  setFormData((p) => ({ ...p, paymentMethod: 'upi' }));
                  setErrors({});
                }}
              >
                <FaMobileAlt />
                <span>UPI</span>
              </button>
              <button
                type="button"
                className={`method-card ${formData.paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => {
                  setFormData((p) => ({ ...p, paymentMethod: 'cash' }));
                  setErrors({});
                }}
              >
                <FaWallet />
                <span>Cash</span>
              </button>
            </div>

            {formData.paymentMethod === 'card' && (
              <div className="fields-grid">
                <div className="field full">
                  <label>Card Number</label>
                  <input
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="XXXX XXXX XXXX XXXX"
                    aria-label="Card Number"
                  />
                  {errors.cardNumber && <div className="error-text">{errors.cardNumber}</div>}
                </div>
                <div className="field full">
                  <label>Name on Card</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    placeholder="Card holder name"
                  />
                  {errors.cardName && <div className="error-text">{errors.cardName}</div>}
                </div>
                <div className="field">
                  <label>Expiry</label>
                  <input
                    name="cardExpiry"
                    value={formData.cardExpiry}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    aria-label="Card Expiry"
                  />
                  {errors.cardExpiry && <div className="error-text">{errors.cardExpiry}</div>}
                </div>
                <div className="field">
                  <label>CVV</label>
                  <input
                    name="cardCvv"
                    value={formData.cardCvv}
                    onChange={handleChange}
                    placeholder="CVV"
                    aria-label="Card CVV"
                  />
                  {errors.cardCvv && <div className="error-text">{errors.cardCvv}</div>}
                </div>
              </div>
            )}

            {formData.paymentMethod === 'upi' && (
              <div className="fields-grid">
                <div className="field full">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleChange}
                    placeholder="example@okbank"
                  />
                  {errors.upiId && <div className="error-text">{errors.upiId}</div>}
                </div>
              </div>
            )}

            {formData.paymentMethod === 'cash' && (
              <div className="cash-note">
                Pay directly at pickup. Your booking will be confirmed now.
              </div>
            )}

            <button className="payments-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Processing Payment...' : `Pay Rs. ${price.toFixed(2)} & Confirm`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
