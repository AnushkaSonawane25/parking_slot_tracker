import React, { useState } from 'react';

function CheckInModal({ isOpen, slot, onClose, onConfirm, isSubmitting }) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [userRole, setUserRole] = useState('Student');
  const [validationError, setValidationError] = useState('');

  if (!isOpen || !slot) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setValidationError('Please enter a vehicle license plate number.');
      return;
    }
    setValidationError('');
    onConfirm({
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType,
      userRole,
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container checkin-modal">
        <div className="modal-header-row">
          <div className="modal-icon-wrapper modal-icon-wrapper--checkin">
            🚗
          </div>
          <div className="modal-title-group">
            <h3 className="modal-title">Park Vehicle in {slot.slotNumber}</h3>
            <p className="modal-subtitle">Enter vehicle and driver details to check in</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {validationError && (
            <div className="form-error-banner">{validationError}</div>
          )}

          <div className="form-group">
            <label htmlFor="vehicleNumber" className="form-label">
              License Plate Number <span className="required-star">*</span>
            </label>
            <input
              id="vehicleNumber"
              type="text"
              className="form-input"
              placeholder="e.g. MH 12 AB 1234"
              value={vehicleNumber}
              onChange={(e) => {
                setVehicleNumber(e.target.value.toUpperCase());
                if (validationError) setValidationError('');
              }}
              autoFocus
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicleType" className="form-label">
                Vehicle Type
              </label>
              <select
                id="vehicleType"
                className="form-select"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="Car">🚗 Car</option>
                <option value="Bike / Two-Wheeler">🏍️ Bike / Two-Wheeler</option>
                <option value="EV">⚡ EV (Electric Vehicle)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="userRole" className="form-label">
                Campus Role
              </label>
              <select
                id="userRole"
                className="form-select"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="Student">🎓 Student</option>
                <option value="Faculty">👨‍🏫 Faculty</option>
                <option value="Visitor">👥 Visitor</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Checking In...' : 'Confirm Check-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckInModal;

