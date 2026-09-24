import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      addToast('Please enter both email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const profile = await login(email, password);
      setLoading(false);
      if (profile?.role === 'ADMIN' || profile?.role === 'MANAGER') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Incorrect email or password. Please try again.');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-brand-header">
          <Link to="/" className="auth-brand-logo-link">
            <h1 className="auth-brand-title">LUMORA</h1>
          </Link>
          <p className="auth-brand-subtitle">Haute Parfumerie Paris</p>
        </div>

        <h2 className="auth-page-title">Sign In</h2>
        <p className="auth-page-caption">Access your order history and fragrance selections.</p>

        {errorMsg && (
          <div className="auth-error-banner" role="alert">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-input-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={17} className="field-icon" />
              <input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="label-with-link">
              <label htmlFor="login-password">Password</label>
              <a 
                href="#forgot" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  addToast('If this email is registered, password reset instructions have been sent.', 'info'); 
                }}
                className="forgot-link"
              >
                Forgot password?
              </a>
            </div>
            <div className="input-with-icon">
              <Lock size={17} className="field-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-link">
          Don't have an account? <Link to="/signup">Create an Account</Link>
        </p>
      </div>
    </div>
  );
}

export function SignUpPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      setLoading(false);
      navigate('/profile');
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Registration could not be completed. Please check your details.');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-brand-header">
          <Link to="/" className="auth-brand-logo-link">
            <h1 className="auth-brand-title">LUMORA</h1>
          </Link>
          <p className="auth-brand-subtitle">Haute Parfumerie Paris</p>
        </div>

        <h2 className="auth-page-title">Create Account</h2>
        <p className="auth-page-caption">Register to save delivery addresses and manage orders.</p>

        {errorMsg && (
          <div className="auth-error-banner" role="alert">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-input-group">
            <label htmlFor="register-name">Full Name</label>
            <div className="input-with-icon">
              <User size={17} className="field-icon" />
              <input
                id="register-name"
                type="text"
                name="name"
                placeholder="e.g. Alexandre Dubois"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="register-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={17} className="field-icon" />
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="register-phone">Phone Number (Optional)</label>
            <div className="input-with-icon">
              <Phone size={17} className="field-icon" />
              <input
                id="register-phone"
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="register-password">Password</label>
            <div className="input-with-icon">
              <Lock size={17} className="field-icon" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
