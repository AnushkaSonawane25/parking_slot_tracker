import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ParkingSlot from './components/ParkingSlot';
import ConfirmationModal from './components/ConfirmationModal';
import './App.css';

// Base API endpoint for the backend server
const API_URL = '/api/slots';

function App() {
  // Application State
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('All'); // 'All' | 'Available' | 'Occupied'
  const [updatingSlotId, setUpdatingSlotId] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch slots from backend on component mount
  useEffect(() => {
    fetchSlots();
  }, []);

  // Helper to show brief feedback toast
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  /**
   * Fetch all 12 parking slots from MongoDB via Express API
   */
  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setSlots(result.data);
      } else {
        throw new Error(result.message || 'Failed to load slots');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Unable to connect to the backend server. Make sure the Node/Express server and MongoDB are running.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle a slot's status between Available and Occupied
   * Triggered when a user clicks any parking slot card
   */
  const handleToggleSlot = async (slot) => {
    if (updatingSlotId) return; // Prevent double clicks during network request

    const newStatus = slot.status === 'Available' ? 'Occupied' : 'Available';
    setUpdatingSlotId(slot._id);

    try {
      const response = await fetch(`${API_URL}/${slot._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status (HTTP ${response.status})`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Update state with newly modified slot from database
        setSlots((prevSlots) =>
          prevSlots.map((item) => (item._id === slot._id ? result.data : item))
        );
        showToast(`Slot ${slot.slotNumber} is now ${newStatus}`);
      }
    } catch (err) {
      console.error('Error toggling slot:', err);
      showToast(`Error updating Slot ${slot.slotNumber}. Please try again.`);
    } finally {
      setUpdatingSlotId(null);
    }
  };

  /**
   * Reset all 12 parking slots to "Available"
   */
  const handleConfirmReset = async () => {
    setIsResetModalOpen(false);
    setIsResetting(true);

    try {
      const response = await fetch(`${API_URL}/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Reset failed with HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setSlots(result.data);
        showToast('All 12 parking slots have been reset to Available!');
      }
    } catch (err) {
      console.error('Error resetting slots:', err);
      showToast('Failed to reset parking slots. Please check backend connection.');
    } finally {
      setIsResetting(false);
    }
  };

  // Derive counts directly from the slot data
  const totalCount = slots.length;
  const availableCount = slots.filter((s) => s.status === 'Available').length;
  const occupiedCount = slots.filter((s) => s.status === 'Occupied').length;

  // Filter slots based on user selection without mutating original data
  const filteredSlots = slots.filter((slot) => {
    if (currentFilter === 'Available') return slot.status === 'Available';
    if (currentFilter === 'Occupied') return slot.status === 'Occupied';
    return true; // 'All'
  });

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {/* Dashboard: Header, Metrics, Filters & Reset */}
        <Dashboard
          totalCount={totalCount}
          availableCount={availableCount}
          occupiedCount={occupiedCount}
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          onOpenResetModal={() => setIsResetModalOpen(true)}
          isResetting={isResetting}
        />

        {/* Temporary Feedback Notification Toast */}
        {toastMessage && (
          <div className="toast-notification" role="status" aria-live="polite">
            <span className="toast-icon">ℹ️</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="main-content">
          {/* Loading State */}
          {loading && (
            <div className="state-card state-loading">
              <div className="spinner"></div>
              <h3>Loading Parking Slots...</h3>
              <p>Fetching real-time status from MongoDB database.</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="state-card state-error">
              <div className="error-icon">⚠️</div>
              <h3>Connection Error</h3>
              <p>{error}</p>
              <button type="button" className="btn btn--primary" onClick={fetchSlots}>
                Retry Connection
              </button>
            </div>
          )}

          {/* Slots Grid */}
          {!loading && !error && (
            <>
              {filteredSlots.length === 0 ? (
                <div className="state-card state-empty">
                  <h3>No slots match this filter</h3>
                  <p>There are currently no slots with status "{currentFilter}".</p>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setCurrentFilter('All')}
                  >
                    View All Slots
                  </button>
                </div>
              ) : (
                <div className="slots-grid">
                  {filteredSlots.map((slot) => (
                    <ParkingSlot
                      key={slot._id}
                      slot={slot}
                      onToggle={handleToggleSlot}
                      isUpdating={updatingSlotId === slot._id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Campus Legend / Guide Footer */}
        <footer className="app-footer">
          <div className="footer-legend">
            <span className="legend-item">
              <span className="legend-box legend-box--available"></span> Available: Green
            </span>
            <span className="legend-item">
              <span className="legend-box legend-box--occupied"></span> Occupied: Red
            </span>
            <span className="legend-item">
              💡 <em>Click any card to change its occupancy</em>
            </span>
          </div>
          <p className="footer-credits">
            College Web Technology Mini Project • Built with React, Vite, Node.js, Express & MongoDB
          </p>
        </footer>
      </div>

      {/* Confirmation Modal for Reset */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Reset Parking Area?"
        message="Are you sure you want to reset all 12 parking slots back to 'Available'? This will update the MongoDB database."
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}

export default App;
