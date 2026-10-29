import React from 'react';
import SummaryCard from './SummaryCard';

/**
 * Dashboard Component
 * Contains the header, summary statistics cards, filter buttons, and admin reset trigger.
 */
function Dashboard({
  totalCount,
  availableCount,
  occupiedCount,
  currentFilter,
  onFilterChange,
  onOpenResetModal,
  isResetting,
  canControl,
}) {
  return (
    <header className="dashboard-header">
      {/* Title & Tagline */}
      <div className="title-area">
        <div className="title-with-badge">
          <span className="campus-badge">Campus Facility</span>
          {canControl ? (
            <span className="role-mode-badge role-mode-admin">🛡️ Admin Control Mode</span>
          ) : (
            <span className="role-mode-badge role-mode-readonly">👁️ View-Only Mode</span>
          )}
          <h1 className="main-title">College Parking Slot Tracker</h1>
        </div>
        <p className="main-subtitle">
          {canControl
            ? 'Administrator Control: Click any slot to toggle its occupancy status or reset all campus slots.'
            : 'Live Status Monitor: Displays real-time parking slot availability for students, faculty, and visitors.'}
        </p>
      </div>

      {/* Summary Metric Cards */}
      <div className="summary-grid">
        <SummaryCard
          title="Total Parking Slots"
          count={totalCount}
          type="total"
          icon={
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
            </svg>
          }
        />

        <SummaryCard
          title="Available Slots"
          count={availableCount}
          type="available"
          icon={
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <SummaryCard
          title="Occupied Slots"
          count={occupiedCount}
          type="occupied"
          icon={
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Control Actions: Filters & Reset Button (Admin Only) */}
      <div className="controls-bar">
        <div className="filter-group">
          <span className="filter-label">Filter View:</span>
          <button
            type="button"
            className={`filter-btn ${currentFilter === 'All' ? 'filter-btn--active' : ''}`}
            onClick={() => onFilterChange('All')}
          >
            All Slots <span className="filter-badge">{totalCount}</span>
          </button>
          <button
            type="button"
            className={`filter-btn ${currentFilter === 'Available' ? 'filter-btn--active' : ''}`}
            onClick={() => onFilterChange('Available')}
          >
            Available <span className="filter-badge filter-badge--green">{availableCount}</span>
          </button>
          <button
            type="button"
            className={`filter-btn ${currentFilter === 'Occupied' ? 'filter-btn--active' : ''}`}
            onClick={() => onFilterChange('Occupied')}
          >
            Occupied <span className="filter-badge filter-badge--red">{occupiedCount}</span>
          </button>
        </div>

        {/* Reset button only visible and accessible to Admin */}
        {canControl && (
          <button
            type="button"
            className="btn btn--reset"
            onClick={onOpenResetModal}
            disabled={isResetting}
            title="Reset all slots back to Available (Admin Only)"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isResetting ? 'Resetting...' : 'Reset Parking'}
          </button>
        )}
      </div>
    </header>
  );
}

export default Dashboard;
