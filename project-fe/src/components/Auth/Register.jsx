// Improved Register Component
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
    } catch (err) {
      console.error("Registration attempt failed:", err);
      setError('Registration failed. Please contact system administrator.');
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
              <span className="login-subtitle">New Operator Registration</span>
              Access Request
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
              <label htmlFor="name">
                <span className="input-icon">👤</span>
                Username
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">
                <span className="input-icon">✉️</span>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your official email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                <span className="input-icon">🔑</span>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create your access code"
                required
              />
              <div className="password-strength">
                <div className="strength-meter"></div>
                <div className="strength-text">Panjang password minimal 6 karakter</div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="login-button">
                <span className="button-text">Register</span>
                <span className="button-flash-effect"></span>
              </button>
            </div>
          </form>

          <div className="login-footer">
            <p className="register-text">
              Sudah Punya akun?{' '}
              <Link to="/login" className="register-link">
                Masuk di sini
              </Link>
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;