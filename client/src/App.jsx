import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import ParkingSlot from './components/ParkingSlot';
import ConfirmationModal from './components/ConfirmationModal';
import CheckInModal from './components/CheckInModal';
import CheckOutModal from './components/CheckOutModal';
import './App.css';

const API_URL = '/api/slots';

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, options);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || `Request failed with HTTP ${response.status}`);
  }

  return result;
}

function App() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [updatingSlotId, setUpdatingSlotId] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeCheckInSlot, setActiveCheckInSlot] = useState(null);
  const [activeCheckOutSlot, setActiveCheckOutSlot] = useState(null);
  const [checkOutOpenedAt, setCheckOutOpenedAt] = useState(0);

  const showToast = (message) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3500);
  };

  async function fetchSlots() {
    try {
      const { data } = await request('');
      if (!Array.isArray(data)) throw new Error('The server returned invalid slot data.');
      setSlots(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Unable to connect to the backend server. Make sure the Node/Express server and MongoDB are running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSlots();
  }, []);

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    fetchSlots();
  };

  const saveSlot = async (slotId, changes) => {
    const { data } = await request(`/${slotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });

    if (!data) throw new Error('The server did not return the updated slot.');
    setSlots((currentSlots) =>
      currentSlots.map((slot) => (slot._id === slotId ? data : slot))
    );
  };

  const handleSlotClick = (slot) => {
    if (updatingSlotId) return;

    if (slot.status === 'Available') {
      setActiveCheckInSlot(slot);
    } else {
      setCheckOutOpenedAt(Date.now());
      setActiveCheckOutSlot(slot);
    }
  };

  const handleConfirmCheckIn = async (checkInData) => {
    if (!activeCheckInSlot) return;

    const { _id: slotId, slotNumber } = activeCheckInSlot;
    setUpdatingSlotId(slotId);

    try {
      await saveSlot(slotId, { status: 'Occupied', ...checkInData });
      showToast(`🚗 Vehicle ${checkInData.vehicleNumber} checked into ${slotNumber}`);
      setActiveCheckInSlot(null);
    } catch (err) {
      console.error('Check-in error:', err);
      showToast(err.message || 'Error checking in vehicle.');
    } finally {
      setUpdatingSlotId(null);
    }
  };

  const handleConfirmCheckOut = async () => {
    if (!activeCheckOutSlot) return;

    const { _id: slotId, slotNumber, vehicleNumber } = activeCheckOutSlot;
    setUpdatingSlotId(slotId);

    try {
      await saveSlot(slotId, { status: 'Available' });
      showToast(`✅ Slot ${slotNumber} released! ${vehicleNumber ? `(${vehicleNumber} checked out)` : ''}`);
      setActiveCheckOutSlot(null);
    } catch (err) {
      console.error('Check-out error:', err);
      showToast(err.message || 'Error checking out. Please try again.');
    } finally {
      setUpdatingSlotId(null);
    }
  };

  const handleConfirmReset = async () => {
    setIsResetModalOpen(false);
    setIsResetting(true);

    try {
      const { data } = await request('/reset', { method: 'POST' });
      if (!Array.isArray(data)) throw new Error('The server returned invalid slot data.');
      setSlots(data);
      showToast('All 12 parking slots have been reset to Available!');
    } catch (err) {
      console.error('Error resetting slots:', err);
      showToast(err.message || 'Failed to reset parking slots. Please check backend connection.');
    } finally {
      setIsResetting(false);
    }
  };

  const totalCount = slots.length;
  const availableCount = slots.filter((s) => s.status === 'Available').length;
  const occupiedCount = slots.filter((s) => s.status === 'Occupied').length;

  const filteredSlots = slots.filter((slot) => {
    if (currentFilter === 'Available') return slot.status === 'Available';
    if (currentFilter === 'Occupied') return slot.status === 'Occupied';
    return true;
  });

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <Dashboard
          totalCount={totalCount}
          availableCount={availableCount}
          occupiedCount={occupiedCount}
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          onOpenResetModal={() => setIsResetModalOpen(true)}
          isResetting={isResetting}
        />

        {toastMessage && (
          <div className="toast-notification" role="status" aria-live="polite">
            ℹ️
            <span>{toastMessage}</span>
          </div>
        )}

        <main>
          {loading && (
            <div className="state-card state-loading">
              <div className="spinner"></div>
              <h3>Loading Parking Slots...</h3>
              <p>Fetching real-time status from MongoDB database.</p>
            </div>
          )}

          {!loading && error && (
            <div className="state-card state-error">
              <div className="error-icon">⚠️</div>
              <h3>Connection Error</h3>
              <p>{error}</p>
              <button type="button" className="btn btn--primary" onClick={retryFetch}>
                Retry Connection
              </button>
            </div>
          )}

          {!loading && !error && (filteredSlots.length === 0 ? (
            <div className="state-card">
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
          ))}
        </main>

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

      <CheckInModal
        isOpen={Boolean(activeCheckInSlot)}
        slot={activeCheckInSlot}
        onClose={() => setActiveCheckInSlot(null)}
        onConfirm={handleConfirmCheckIn}
        isSubmitting={Boolean(updatingSlotId)}
      />

      <CheckOutModal
        isOpen={Boolean(activeCheckOutSlot)}
        slot={activeCheckOutSlot}
        currentTime={checkOutOpenedAt}
        onClose={() => setActiveCheckOutSlot(null)}
        onConfirm={handleConfirmCheckOut}
        isSubmitting={Boolean(updatingSlotId)}
      />

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
