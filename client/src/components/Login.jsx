import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for evaluation / testing demo credentials
  const handleQuickDemo = async (demoRole) => {
    setError('');
    setLoading(true);

    const demoEmail = `${demoRole.toLowerCase()}@college.edu`;
    const demoPassword = 'password123';
    const demoName = `Campus ${demoRole}`;

    try {
      // First try to login
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch {
      // If demo account doesn't exist yet, automatically register and log in
      try {
        await register(demoName, demoEmail, demoPassword, demoRole);
        navigate('/dashboard');
      } catch (regErr) {
        setError(`Could not initialize demo account: ${regErr.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">🚗</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage and track campus parking slots</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Campus Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="e.g. yourname@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-submit-auth"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-state">
                <span className="spinner-sm"></span> Signing In...
              </span>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Quick Demo Sign In for Students */}
        <div className="demo-login-section">
          <div className="divider-text">
            <span>Or Quick Student Demo</span>
          </div>
          <button
            type="button"
            className="btn-demo-pill btn-demo-pill--single"
            onClick={() => handleQuickDemo('Student')}
            disabled={loading}
            title="Sign in as Student (View-Only Status)"
          >
            🎓 Demo Student (View-Only)
          </button>
        </div>

        <div className="auth-footer-prompt">
          Don't have an account yet?{' '}
          <Link to="/register" className="auth-link">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
