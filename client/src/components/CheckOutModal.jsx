function CheckOutModal({ isOpen, slot, currentTime, onClose, onConfirm, isSubmitting }) {
  if (!isOpen || !slot) return null;

  const occupiedDate = slot.occupiedAt ? new Date(slot.occupiedAt) : null;
  const now = new Date(currentTime);
  let durationText = 'Just now';
  let totalMinutes = 0;

  if (occupiedDate && !isNaN(occupiedDate.getTime())) {
    const diffMs = Math.max(0, now - occupiedDate);
    totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours > 0) {
      durationText = `${hours} hr${hours > 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
    } else {
      durationText = `${mins} min${mins !== 1 ? 's' : ''}`;
    }
  }

  const isFreeRole = slot.userRole === 'Faculty';
  let parkingFee = 'Free';
  if (!isFreeRole) {
    if (totalMinutes <= 30) {
      parkingFee = 'Free (Grace Period)';
    } else {
      const billableHours = Math.ceil(totalMinutes / 60);
      parkingFee = `₹${billableHours * 20}`;
    }
  }

  const roleEmojiMap = {
    Student: '🎓',
    Faculty: '👨‍🏫',
    Visitor: '👥',
  };

  const typeEmojiMap = {
    Car: '🚗',
    'Bike / Two-Wheeler': '🏍️',
    EV: '⚡',
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container">
        <div className="modal-header-row">
          <div className="modal-icon-wrapper modal-icon-wrapper--checkout">
            🏁
          </div>
          <div className="modal-title-group">
            <h3 className="modal-title">Check-Out: Slot {slot.slotNumber}</h3>
            <p className="modal-subtitle">Review parking session summary</p>
          </div>
        </div>

        <div className="checkout-summary-card">
          <div className="summary-row">
            <span className="summary-label">Vehicle Plate</span>
            <span className="summary-val summary-val--plate">
              {slot.vehicleNumber || 'Unknown'}
            </span>
          </div>

          <div className="summary-row">
            <span className="summary-label">Vehicle Type</span>
            <span className="summary-val">
              {typeEmojiMap[slot.vehicleType] || '🚗'} {slot.vehicleType || 'Car'}
            </span>
          </div>

          <div className="summary-row">
            <span className="summary-label">Campus Role</span>
            <span className="summary-val">
              {roleEmojiMap[slot.userRole] || '👤'} {slot.userRole || 'Student'}
            </span>
          </div>

          <div className="summary-row">
            <span className="summary-label">Parked At</span>
            <span className="summary-val">
              {occupiedDate ? occupiedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </span>
          </div>

          <div className="summary-row summary-row--highlight">
            <span className="summary-label">Total Duration</span>
            <span className="summary-val summary-val--duration">⏱️ {durationText}</span>
          </div>

          <div className="summary-row summary-row--fee">
            <span className="summary-label">Estimated Fee</span>
            <span className="summary-val summary-val--fee">{parkingFee}</span>
          </div>
        </div>

        <p className="checkout-confirm-hint">
          Releasing this slot will reset its status back to <strong>Available</strong>.
        </p>

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
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Releasing...' : 'Confirm Check-Out'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckOutModal;
