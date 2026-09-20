import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      addToast('Please enter both username and password', 'warning');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login(username, password);
      setLoading(false);
      navigate('/profile');
    }, 900);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-brand-header">
          <img
            src="https://cdn-icons-gif.flaticon.com/19001/19001681.gif"
            alt="LUMORA"
            className="auth-flacon-icon"
          />
          <h1 className="auth-brand-title">LUMORA</h1>
          <p className="auth-brand-subtitle">Haute Parfumerie Sanctuary</p>
        </div>

        <h2 className="auth-page-title">Welcome Back</h2>
        <p className="auth-page-caption">Sign in to access your bespoke flacon collection and privileges.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label>Username or Email</label>
            <div className="input-with-icon">
              <User size={18} className="field-icon" />
              <input
                type="text"
                placeholder="Enter username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="label-with-link">
              <label>Password</label>
              <a 
                href="#forgot" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  addToast('Password reset link sent to your registered email.', 'info'); 
                }}
                className="forgot-link"
              >
                Forgot Password?
              </a>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Atelier'}
          </button>
        </form>

        <div className="auth-divider">
          <span>Or sign in with</span>
        </div>

        <div className="auth-social-row">
          <button
            type="button"
            className="social-auth-btn"
            onClick={() => {
              login('GoogleUser');
              navigate('/profile');
            }}
          >
            <i className="fa-brands fa-google"></i> Google
          </button>
          <button
            type="button"
            className="social-auth-btn"
            onClick={() => {
              login('AppleUser');
              navigate('/profile');
            }}
          >
            <i className="fa-brands fa-apple"></i> Apple
          </button>
        </div>

        <p className="auth-footer-link">
          New to House LUMORA? <Link to="/signup">Create an Account</Link>
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
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.username) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      signup(formData);
      setLoading(false);
      navigate('/profile');
    }, 1000);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-brand-header">
          <img
            src="https://cdn-icons-gif.flaticon.com/19001/19001681.gif"
            alt="LUMORA"
            className="auth-flacon-icon"
          />
          <h1 className="auth-brand-title">LUMORA</h1>
          <p className="auth-brand-subtitle">Haute Parfumerie Sanctuary</p>
        </div>

        <h2 className="auth-page-title">Create Your Account</h2>
        <p className="auth-page-caption">
          Join our intimate circle of fragrance collectors and receive exclusive harvest previews.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="field-icon" />
              <input
                type="text"
                name="name"
                placeholder="Monsieur Alexandre"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Username</label>
            <div className="input-with-icon">
              <User size={18} className="field-icon" />
              <input
                type="text"
                name="username"
                placeholder="alexandre_scents"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                type="email"
                name="email"
                placeholder="alexandre@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Phone Number (Optional)</label>
            <div className="input-with-icon">
              <Phone size={18} className="field-icon" />
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Create Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Sanctuary Account...' : 'Join House LUMORA'}
          </button>
        </form>

        <p className="auth-footer-link">
          Already a member? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
