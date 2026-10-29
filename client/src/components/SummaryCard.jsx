import React from 'react';

/**
 * SummaryCard Component
 * Displays a single metric card (Total Slots, Available Slots, Occupied Slots)
 * 
 * @param {string} title - Label for the metric
 * @param {number} count - Calculated count value
 * @param {string} type - Card style type ('total' | 'available' | 'occupied')
 * @param {React.ReactNode} icon - SVG or text icon
 */
function SummaryCard({ title, count, type, icon }) {
  return (
    <div className={`summary-card summary-card--${type}`}>
      <div className="summary-card-icon-wrapper">
        {icon}
      </div>
      <div className="summary-card-info">
        <span className="summary-card-title">{title}</span>
        <span className="summary-card-count">{count}</span>
      </div>
    </div>
  );
}

export default SummaryCard;
