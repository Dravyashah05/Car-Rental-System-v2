import React from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/PaymentsPage.css';

type Props = {
  open: boolean;
  amount: number;
  onClose: () => void;
  onConfirm: () => void;
};

const PaymentModal: React.FC<Props> = ({ open, amount, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Payment</h3>
          <button type="button" className="ghost" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p>Amount payable</p>
          <h2>Rs. {amount.toFixed(2)}</h2>
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
