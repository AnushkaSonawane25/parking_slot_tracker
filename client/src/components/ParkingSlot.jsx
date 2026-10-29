function ParkingSlot({ slot, onSlotClick, isUpdating }) {
  const isAvailable = slot.status === 'Available';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSlotClick(slot);
    }
  };

  const getVehicleIcon = () => {
    if (slot.vehicleType === 'Bike / Two-Wheeler') return '🏍️';
    if (slot.vehicleType === 'EV') return '⚡';
    return '🚗';
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Parking slot ${slot.slotNumber}, currently ${slot.status}.`}
      onClick={() => onSlotClick(slot)}
      onKeyDown={handleKeyDown}
      className={`slot-card ${isAvailable ? 'slot-card--available' : 'slot-card--occupied'} ${
        isUpdating ? 'slot-card--updating' : ''
      }`}
    >
      <div className="slot-header">
        <span className="slot-number">{slot.slotNumber}</span>
        <span className={`slot-badge ${isAvailable ? 'slot-badge--available' : 'slot-badge--occupied'}`}>
          <span className="status-dot"></span>
          {slot.status}
        </span>
      </div>

      <div className="slot-visual-container">
        {isAvailable ? (
          <div className="slot-visual">
            <svg
              className="car-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.5l2-3.5A2 2 0 0 1 8.2 2.5h7.6a2 2 0 0 1 1.7 1L19.5 7H21a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
              <circle cx="7" cy="17" r="3" />
              <path d="M10 17h4" />
              <circle cx="17" cy="17" r="3" />
              <path d="M6 7l1.5-3h9L18 7" />
            </svg>
            <span className="empty-slot-label">Empty Slot</span>
          </div>
        ) : (
          <div className="slot-occupied-info">
            <div className="vehicle-badge-pill">
              <span>{getVehicleIcon()}</span>
              <span>{slot.vehicleType || 'Car'}</span>
            </div>
            <div className="vehicle-plate-box">
              <span className="plate-prefix">IND</span>
              <span className="plate-text">{slot.vehicleNumber || 'OCCUPIED'}</span>
            </div>
            {slot.userRole && (
              <span className="slot-role-tag">
                {slot.userRole === 'Student' && '🎓 Student'}
                {slot.userRole === 'Faculty' && '👨‍🏫 Faculty'}
                {slot.userRole === 'Visitor' && '👥 Visitor'}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="slot-footer">
        <span className="slot-action-hint">
          {isUpdating
            ? 'Updating...'
            : isAvailable
            ? '👉 Click to Check In'
            : '🏁 Click to Check Out'}
        </span>
      </div>
    </div>
  );
}

export default ParkingSlot;
