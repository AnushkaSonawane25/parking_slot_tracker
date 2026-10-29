import React from 'react';

/**
 * ConfirmationModal Component
 * Displays a clean confirmation dialog before performing irreversible actions like Reset.
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {string} title - Heading of modal
 * @param {string} message - Explanatory message
 * @param {Function} onConfirm - Callback if user clicks Reset
 * @param {Function} onCancel - Callback if user clicks Cancel
 */
function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon-wrapper">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#dc2626" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h3 id="modal-title" className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
          >
            Yes, Reset All Slots
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
