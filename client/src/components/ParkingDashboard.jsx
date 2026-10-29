import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import ParkingSlot from './ParkingSlot';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api/slots';

function ParkingDashboard() {
  const { user, token, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'Admin';
  const canControl = isAdmin;

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
   * Toggle a slot's status between Available and Occupied
   * Permitted ONLY for Admin role
   */
  const handleToggleSlot = async (slot) => {
    if (!canControl) {
      showToast('⚠️ Access Denied: Only Campus Admin can toggle parking slots.');
      return;
    }

    if (updatingSlotId) return; // Prevent double clicks during request

    const newStatus = slot.status === 'Available' ? 'Occupied' : 'Available';
    setUpdatingSlotId(slot._id);

    try {
      const response = await fetch(`${API_URL}/${slot._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed with HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setSlots((prevSlots) =>
          prevSlots.map((item) => (item._id === slot._id ? result.data : item))
        );
        showToast(`Slot ${slot.slotNumber} marked as ${newStatus} by Admin`);
      }
    } catch (err) {
      console.error('Error toggling slot:', err);
      showToast(`Error updating Slot ${slot.slotNumber}: ${err.message}`);
    } finally {
      setUpdatingSlotId(null);
    }
  };

  /**
   * Reset all 12 parking slots to "Available"
   * Permitted ONLY for Admin role
   */
  const handleConfirmReset = async () => {
    if (!canControl) {
      showToast('⚠️ Access Denied: Only Campus Admin can reset parking slots.');
      return;
    }

    setIsResetModalOpen(false);
    setIsResetting(true);

    try {
      const response = await fetch(`${API_URL}/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Reset failed with HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setSlots(result.data);
        showToast('All 12 parking slots have been reset to Available by Admin!');
      }
    } catch (err) {
      console.error('Error resetting slots:', err);
      showToast(`Reset failed: ${err.message}`);
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
    <div className="app-container">
      {/* Role Notice Banner */}
      <div className={`role-notice-banner ${canControl ? 'role-notice-admin' : 'role-notice-viewer'}`}>
        {canControl ? (
          <span>
            🛡️ <strong>Admin Control Active:</strong> Logged in as <strong>{user?.name}</strong>. You have permission to mark slots as Occupied/Available and reset parking.
          </span>
        ) : (
          <span>
            👁️ <strong>Read-Only Status View:</strong> {isAuthenticated ? `Logged in as ${user?.name} (${user?.role}).` : 'Viewing as Campus Guest.'} Slot status is live. Only Campus Admin can mark slots as occupied or available.
          </span>
        )}
      </div>

      {/* Dashboard: Header, Metrics, Filters & Reset */}
      <Dashboard
        totalCount={totalCount}
        availableCount={availableCount}
        occupiedCount={occupiedCount}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        isResetting={isResetting}
        canControl={canControl}
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
                    onToggle={handleToggleSlot}
                    isUpdating={updatingSlotId === slot._id}
                    canControl={canControl}
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
            {canControl ? (
              <span>💡 <em>Click any card to change its occupancy</em></span>
            ) : (
              <span>🔒 <em>Display-only status • Controls reserved for Admin</em></span>
            )}
          </span>
        </div>
        <p className="footer-credits">
          College Web Technology Mini Project • Built with React, Vite, Node.js, Express & MongoDB
        </p>
      </footer>

      {/* Confirmation Modal for Reset (Admin Only) */}
      {canControl && (
        <ConfirmationModal
          isOpen={isResetModalOpen}
          title="Reset Parking Area?"
          message="Are you sure you want to reset all 12 parking slots back to 'Available'? This will update the MongoDB database."
          onConfirm={handleConfirmReset}
          onCancel={() => setIsResetModalOpen(false)}
        />
      )}
    </div>
  );
}

export default ParkingDashboard;
