import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLifeRing, FaPhoneAlt, FaRegClock, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { supportService } from '../services/supportService';
import '../styles/SupportPage.css';

const MAX_MESSAGE_LENGTH = 2000;

const SupportPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = useMemo(() => MAX_MESSAGE_LENGTH - message.length, [message.length]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setTicketId('');

    if (!subject.trim() || !message.trim()) {
      setError('Please add a subject and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await supportService.createMessage({
        subject: subject.trim(),
        message: message.trim(),
      });
      if (created.id) {
        setTicketId(created.id.slice(-6).toUpperCase());
      }
      setSuccess('Message sent! Our support team will reach out shortly.');
      setSubject('');
      setMessage('');
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err) {
        const errMessage = (err as { message?: unknown }).message;
        if (typeof errMessage === 'string') {
          setError(errMessage);
        } else {
          setError('Failed to send support request.');
        }
      } else {
        setError('Failed to send support request.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="support-page">
        <div className="support-shell">
          <section className="support-card support-empty">
            <h1>Support Center</h1>
            <p>Please log in to reach our support team.</p>
            <div className="support-actions">
              <Link to="/login" className="support-primary">
                Log in
              </Link>
              <Link to="/signup" className="support-secondary">
                Create account
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="support-page">
      <div className="support-shell">
        <section className="support-card">
          <div className="support-header">
            <div>
              <h1>Support Center</h1>
              <p>Tell us what's going on. We'll get back within 24 hours.</p>
            </div>
            <Link to="/profile" className="support-link">
              Back to Profile
            </Link>
          </div>

          {error && <div className="support-alert error">{error}</div>}
          {success && (
            <div className="support-alert success">
              {success}
              {ticketId ? <span> Ticket #{ticketId}</span> : null}
            </div>
          )}

          <form className="support-form" onSubmit={handleSubmit}>
            <label className="support-field">
              <span>Subject</span>
              <input
                type="text"
                placeholder="Payment issue, booking update, account help..."
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={200}
                required
              />
            </label>

            <label className="support-field">
              <span>Message</span>
              <textarea
                placeholder="Share the details so we can help quickly."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                required
              />
              <div className="support-count">
                {remaining} characters remaining
              </div>
            </label>

            <div className="support-actions">
              <button className="support-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send message'}
              </button>
              <button
                className="support-secondary"
                type="button"
                onClick={() => {
                  setSubject('');
                  setMessage('');
                  setError('');
                  setSuccess('');
                  setTicketId('');
                }}
              >
                Clear form
              </button>
            </div>
          </form>
        </section>

        <aside className="support-card support-side">
          <div className="support-side__section">
            <h2>Contact summary</h2>
            <div className="support-contact">
              <span><FaUser /> {currentUser.name}</span>
              <span><FaEnvelope /> {currentUser.email}</span>
              <span><FaPhoneAlt /> {currentUser.phone || 'No phone on file'}</span>
            </div>
          </div>

          <div className="support-side__section">
            <h2>What happens next</h2>
            <ul className="support-timeline">
              <li><FaLifeRing /> We review your request within 24 hours.</li>
              <li><FaRegClock /> You'll receive updates on email or phone.</li>
              <li><FaEnvelope /> Keep an eye on your inbox for replies.</li>
            </ul>
          </div>

          <div className="support-side__section support-note">
            <h2>Need quick help?</h2>
            <p>Check your booking history or profile settings for self-serve updates.</p>
            <div className="support-note__actions">
              <Link to="/bookings" className="support-secondary">
                View bookings
              </Link>
              <Link to="/settings" className="support-secondary">
                Settings
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SupportPage;
