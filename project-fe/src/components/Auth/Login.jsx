// Improved Login Component
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [personnelId, setPersonnelId] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(personnelId, authKey);
    } catch (err) {
      console.error("Authentication attempt failed:", err);
      setError('Authentication denied. Verify credentials or contact Command.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Decorative elements */}
          <div className="scan-line scan-line-top-left"></div>
          <div className="scan-line scan-line-top-right"></div>
          <div className="scan-line scan-line-bottom-left"></div>
          <div className="scan-line scan-line-bottom-right"></div>
          
          {/* Header with logo */}
          <div className="login-header">
            <div className="login-logo">
              <span className="logo-part-1">SECURE</span>
              <span className="logo-part-2">SYSTEM</span>
            </div>
            <h2 className="login-title">
              <span className="login-subtitle">Secure Access Portal</span>
              Management Senjata
            </h2>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="personnelId">
                <span className="input-icon">👤</span>
                Username
              </label>
              <input
                type="text"
                id="personnelId"
                value={personnelId}
                onChange={(e) => setPersonnelId(e.target.value)}
                placeholder="Enter your operator ID"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="authKey">
                <span className="input-icon">🔒</span>
                Password
              </label>
              <input
                type="password"
                id="authKey"
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                placeholder="Enter your access code"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="login-button">
                <span className="button-text">LOGIN</span>
                <span className="button-flash-effect"></span>
              </button>
            </div>
          </form>

          <div className="login-footer">
            <p className="register-text">
              Belum punya akun?{' '}
              <Link to="/register" className="register-link">
                Daftar Sekarang
              </Link>
            </p>
        
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;