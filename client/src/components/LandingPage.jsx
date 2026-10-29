import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'Admin';

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            <span>Campus Parking Management System</span>
          </div>

          <h1 className="hero-title">
            Smart Campus Parking <span className="highlight-text">Tracker & Portal</span>
          </h1>

          <p className="hero-subtitle">
            A centralized digital parking management system for our college campus. Signed-in students, faculty, and visitors can check live slot occupancy, while authorized Campus Admins manage and update parking allocations in real time.
          </p>

          <div className="hero-actions">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-primary-hero">
                  <span>Sign In to Account</span>
                  <span className="arrow-icon">→</span>
                </Link>
                <Link to="/register" className="btn-secondary-hero">
                  Create Account
                </Link>
              </>
            ) : (
              <div className="hero-auth-actions">
                <Link to="/dashboard" className="btn-primary-hero">
                  {isAdmin ? '🛡️ Open Admin Parking Control' : '👁️ View Live Parking Status'}
                  <span className="arrow-icon">→</span>
                </Link>
                <div className="hero-welcome">
                  Logged in as <strong>{user?.name}</strong> ({user?.role})
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Campus Parking Features</h2>
          <p className="section-subtitle">
            Reliable, secure, and synchronized with MongoDB database.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🛡️</span>
            </div>
            <h3 className="feature-title">Admin Controlled</h3>
            <p className="feature-desc">
              Only authorized Campus Admins & Security have control to toggle slot occupancy and reset parking lots.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">👁️</span>
            </div>
            <h3 className="feature-title">Student & Faculty View</h3>
            <p className="feature-desc">
              Signed-in students and campus visitors can view live parking availability from their mobile phones or laptops.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🟢</span>
            </div>
            <h3 className="feature-title">12 Designated Slots</h3>
            <p className="feature-desc">
              Clear visual layout numbered P1 to P12 with distinct color coding (Green for Available, Red for Occupied).
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">💾</span>
            </div>
            <h3 className="feature-title">Persistent Database</h3>
            <p className="feature-desc">
              Backed by MongoDB. All parking statuses and user accounts persist reliably without data loss.
            </p>
          </div>
        </div>
      </section>

      {/* Campus Guidelines / Roles Section */}
      <section className="steps-section">
        <div className="section-header">
          <h2 className="section-title">Campus Access Roles</h2>
          <p className="section-subtitle">How different campus members use the system</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">🎓</div>
            <h3>Students & Visitors</h3>
            <p>Access live parking status (read-only). Check available spots (P1 to P12) before parking on campus.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">🏛️</div>
            <h3>Faculty & Staff</h3>
            <p>View real-time slot occupancy to plan campus arrivals and monitor facility utilization.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">🛡️</div>
            <h3>Campus Admin & Security</h3>
            <p>Full administrative authority to mark slots as Occupied or Available, and perform layout resets.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Campus Parking Portal</h2>
          <p>
            {!isAuthenticated
              ? 'Sign in to access your parking view or contact campus administration for access.'
              : 'You are signed in. Navigate to your designated parking view.'}
          </p>
          <div className="cta-buttons">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-cta-primary">
                  Sign In
                </Link>
                <Link to="/register" className="btn-cta-secondary">
                  Create Account
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn-cta-primary">
                {isAdmin ? '🛡️ Open Admin Parking Control' : '👁️ View Live Parking Status'}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            🚗 <strong>CampusPark</strong> — College Parking Slot Tracker
          </div>
          <p className="footer-credits">
            College Web Technology Mini Project • Built with React, Vite, Node.js, Express & MongoDB
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
