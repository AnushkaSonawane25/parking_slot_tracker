import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ParkingSlot from './components/ParkingSlot';
import ConfirmationModal from './components/ConfirmationModal';
import CheckInModal from './components/CheckInModal';
import CheckOutModal from './components/CheckOutModal';
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

  // Modal states for Check-In & Check-Out
  const [activeCheckInSlot, setActiveCheckInSlot] = useState(null);
  const [activeCheckOutSlot, setActiveCheckOutSlot] = useState(null);

  // Fetch slots from backend on component mount
  useEffect(() => {
    fetchSlots();
  }, []);

  // Helper to show brief feedback toast
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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
   * Trigger modal on slot card click:
   * - If Available: Open Check-In Modal
   * - If Occupied: Open Check-Out Summary Modal
   */
  const handleSlotClick = (slot) => {
    if (updatingSlotId) return;

    if (slot.status === 'Available') {
      setActiveCheckInSlot(slot);
    } else {
      setActiveCheckOutSlot(slot);
    }
  };

  /**
   * Execute Check-In with vehicle details
   */
  const handleConfirmCheckIn = async (checkInData) => {
    if (!activeCheckInSlot) return;

    const slotId = activeCheckInSlot._id;
    const slotNumber = activeCheckInSlot.slotNumber;
    setUpdatingSlotId(slotId);

    try {
      const response = await fetch(`${API_URL}/${slotId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Occupied',
          ...checkInData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Check-in failed');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setSlots((prevSlots) =>
          prevSlots.map((item) => (item._id === slotId ? result.data : item))
        );
        showToast(`🚗 Vehicle ${checkInData.vehicleNumber} checked into ${slotNumber}`);
        setActiveCheckInSlot(null);
      }
    } catch (err) {
      console.error('Check-in error:', err);
      showToast(err.message || 'Error checking in vehicle.');
    } finally {
      setUpdatingSlotId(null);
    }
  };

  /**
   * Execute Check-Out and release slot
   */
  const handleConfirmCheckOut = async () => {
    if (!activeCheckOutSlot) return;

    const slotId = activeCheckOutSlot._id;
    const slotNumber = activeCheckOutSlot.slotNumber;
    const vehicleNumber = activeCheckOutSlot.vehicleNumber;
    setUpdatingSlotId(slotId);

    try {
      const response = await fetch(`${API_URL}/${slotId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Available' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to check out (HTTP ${response.status})`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setSlots((prevSlots) =>
          prevSlots.map((item) => (item._id === slotId ? result.data : item))
        );
        showToast(`✅ Slot ${slotNumber} released! ${vehicleNumber ? `(${vehicleNumber} checked out)` : ''}`);
        setActiveCheckOutSlot(null);
      }
    } catch (err) {
      console.error('Check-out error:', err);
      showToast('Error checking out. Please try again.');
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

        {/* Feedback Notification Toast */}
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
                      onSlotClick={handleSlotClick}
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
              💡 <em>Click an empty slot to Check-In, or an occupied slot to Check-Out</em>
            </span>
          </div>
          <p className="footer-credits">
            College Web Technology Mini Project • Built with React, Vite, Node.js, Express & MongoDB
          </p>
        </footer>
      </div>

      {/* Check-In Modal */}
      <CheckInModal
        isOpen={Boolean(activeCheckInSlot)}
        slot={activeCheckInSlot}
        onClose={() => setActiveCheckInSlot(null)}
        onConfirm={handleConfirmCheckIn}
        isSubmitting={Boolean(updatingSlotId)}
      />

      {/* Check-Out Summary Modal */}
      <CheckOutModal
        isOpen={Boolean(activeCheckOutSlot)}
        slot={activeCheckOutSlot}
        onClose={() => setActiveCheckOutSlot(null)}
        onConfirm={handleConfirmCheckOut}
        isSubmitting={Boolean(updatingSlotId)}
      />

      {/* Confirmation Modal for Reset */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Reset Parking Area?"
        message="Are you sure you want to reset all 12 parking slots back to 'Available'? This will clear all checked-in vehicles in MongoDB."
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}

export default App;
