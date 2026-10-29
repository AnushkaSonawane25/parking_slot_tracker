import React from 'react';

/**
 * ParkingSlot Component
 * Renders an interactive parking slot card showing its number, status, and car icon.
 * 
 * @param {Object} slot - Slot data object containing _id, slotNumber, status
 * @param {Function} onToggle - Callback function triggered when card is clicked
 * @param {boolean} isUpdating - Indicates whether this specific slot is currently saving
 */
function ParkingSlot({ slot, onToggle, isUpdating }) {
  const isAvailable = slot.status === 'Available';

  // Handle keyboard accessibility (Enter or Space to toggle)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(slot);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Parking slot ${slot.slotNumber}, currently ${slot.status}. Click to change status.`}
      onClick={() => onToggle(slot)}
      onKeyDown={handleKeyDown}
      className={`slot-card ${isAvailable ? 'slot-card--available' : 'slot-card--occupied'} ${
        isUpdating ? 'slot-card--updating' : ''
      }`}
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
          {/* Detailed modern car icon SVG */}
          <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.5l2-3.5A2 2 0 0 1 8.2 2.5h7.6a2 2 0 0 1 1.7 1L19.5 7H21a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
          <circle cx="7" cy="17" r="3" />
          <path d="M10 17h4" />
          <circle cx="17" cy="17" r="3" />
          <path d="M6 7l1.5-3h9L18 7" />
        </svg>
      </div>

      {/* Action Prompt */}
      <div className="slot-footer">
        <span className="slot-action-hint">
          {isUpdating
            ? 'Updating...'
            : isAvailable
            ? 'Click to Mark Occupied'
            : 'Click to Mark Available'}
        </span>
      </div>
    </div>
  );
}

export default ParkingSlot;
