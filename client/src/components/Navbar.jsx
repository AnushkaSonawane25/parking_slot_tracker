import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;
  const isAdmin = isAuthenticated && user?.role === 'Admin';
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🚗</span>
          <div className="brand-text">
            <span className="brand-title">CampusPark</span>
            <span className="brand-subtitle">College Parking Portal</span>
          </div>
        </Link>

        <nav className="navbar-nav">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          {/* Only show Parking view link when user is authenticated */}
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              {isAdmin ? '🛡️ Admin Parking Control' : '👁️ Parking Status'}
            </Link>
          )}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-info">
                <span className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <div className="user-details">
                  <span className="user-name">{user?.name}</span>
                  <span className={`role-badge role-${user?.role?.toLowerCase() || 'student'}`}>
                    {user?.role || 'Member'}
                  </span>
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="btn-logout" title="Sign out of account">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link
                to="/login"
                className={`btn-nav-login ${isActive('/login') ? 'active' : ''}`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`btn-nav-register ${isActive('/register') ? 'active' : ''}`}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
