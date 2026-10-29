import React from 'react';

/**
 * ParkingSlot Component
 * Renders a parking slot card.
 * 
 * @param {Object} slot - Slot data object containing _id, slotNumber, status
 * @param {Function} onToggle - Callback triggered when card is clicked (Admin only)
 * @param {boolean} isUpdating - Indicates whether this specific slot is currently saving
 * @param {boolean} canControl - True if user has Admin role; false for Students/read-only viewers
 */
function ParkingSlot({ slot, onToggle, isUpdating, canControl }) {
  const isAvailable = slot.status === 'Available';

  // Handle keyboard accessibility for Admins
  const handleKeyDown = (e) => {
    if (!canControl) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(slot);
    }
  };

  const handleClick = () => {
    if (canControl) {
      onToggle(slot);
    }
  };

  return (
    <div
      role={canControl ? 'button' : 'region'}
      tabIndex={canControl ? 0 : -1}
      aria-label={`Parking slot ${slot.slotNumber}, currently ${slot.status}. ${
        canControl ? 'Click to change status.' : 'Status view only.'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`slot-card ${isAvailable ? 'slot-card--available' : 'slot-card--occupied'} ${
        isUpdating ? 'slot-card--updating' : ''
      } ${!canControl ? 'slot-card--readonly' : 'slot-card--clickable'}`}
    >
      {/* Slot Header */}
      <div className="slot-header">
        <span className="slot-number">{slot.slotNumber}</span>
        <span className={`slot-badge ${isAvailable ? 'slot-badge--available' : 'slot-badge--occupied'}`}>
          <span className="status-dot"></span>
          {slot.status}
        </span>
      </div>

      {/* Car Icon Visualization */}
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
      </div>

      {/* Action Prompt / Read-Only Status Display */}
      <div className="slot-footer">
        {canControl ? (
          <span className="slot-action-hint">
            {isUpdating
              ? 'Updating...'
              : isAvailable
              ? 'Click to Mark Occupied'
              : 'Click to Mark Available'}
          </span>
        ) : (
          <span className="slot-status-display">
            {isAvailable ? '🟢 Available' : '🔴 Occupied'}
          </span>
        )}
      </div>
    </div>
  );
}

export default ParkingSlot;
